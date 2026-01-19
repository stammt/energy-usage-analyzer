import { EnergyUsageRecord, UnifiedDailyData, WeatherData } from '@/types/energy';
import { DailyWeather } from '@/lib/weather-service';
import * as ss from 'simple-statistics';

// Conversion constants
const THERMS_TO_KWH = 29.3001;

// Base temperatures for Degree Days (Standard US)
const HDD_BASE_TEMP = 65;
const CDD_BASE_TEMP = 65;

export interface AnalysisResult {
    baseLoad: number; // Daily kWh usage independent of weather
    heatingSlope: number; // kWh per HDD
    coolingSlope: number; // kWh per CDD
    rSquared: number; // Goodness of fit
}

export interface Recommendation {
    id: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    category: 'heating' | 'cooling' | 'baseload';
}

export function unifyData(
    electricData: EnergyUsageRecord[],
    gasData: EnergyUsageRecord[],
    weatherData: DailyWeather[]
): UnifiedDailyData[] {

    const dailyMap = new Map<string, UnifiedDailyData>();

    // Helper to get map entry or create default
    const getEntry = (dateKey: string): UnifiedDailyData => {
        if (!dailyMap.has(dateKey)) {
            dailyMap.set(dateKey, { date: dateKey, electricUsageKwh: 0, gasUsageTherms: 0 });
        }
        return dailyMap.get(dateKey)!;
    };

    // 1. Aggregation: Sum hourly data into daily buckets

    // Process Electric
    electricData.forEach(record => {
        const dateKey = record.date.toISOString().split('T')[0];
        const entry = getEntry(dateKey);
        entry.electricUsageKwh = (entry.electricUsageKwh || 0) + record.usage;
    });

    // Process Gas
    gasData.forEach(record => {
        const dateKey = record.date.toISOString().split('T')[0];
        const entry = getEntry(dateKey);
        entry.gasUsageTherms = (entry.gasUsageTherms || 0) + record.usage;
    });

    // 2. Merge Weather
    // Create a lookup for weather
    const weatherMap = new Map(weatherData.map(w => [w.date, w]));

    const sortedKeys = Array.from(dailyMap.keys()).sort();

    return sortedKeys.map(dateKey => {
        const entry = dailyMap.get(dateKey)!;
        const weather = weatherMap.get(dateKey);

        return {
            ...entry,
            avgTempF: weather ? weather.avgTempF : undefined
        };
    });
}

/**
 * Converts a value from Therms to kWh
 */
export function thermsToKwh(therms: number): number {
    return therms * THERMS_TO_KWH;
}

/**
 * Calculates total energy in kWh (Electric + Gas converted)
 */
export function calculateTotalKwh(electric: number, gasTherms: number): number {
    return electric + thermsToKwh(gasTherms);
}

/**
 * Calculates Heating Degree Days for a given temperature
 */
export function calculateHDD(avgTempF: number): number {
    return avgTempF < HDD_BASE_TEMP ? HDD_BASE_TEMP - avgTempF : 0;
}

/**
 * Calculates Cooling Degree Days for a given temperature
 */
export function calculateCDD(avgTempF: number): number {
    return avgTempF > CDD_BASE_TEMP ? avgTempF - CDD_BASE_TEMP : 0;
}

/**
 * Performs linear regression to find Base Load and Heating/Cooling sensitivity.
 */
export function performRegressionAnalysis(data: UnifiedDailyData[]): AnalysisResult {
    // Prepare data points: [HDD, TotalKwh]
    const heatingPoints: number[][] = [];
    const coolingPoints: number[][] = [];
    const baseLoadPoints: number[] = [];

    data.forEach(d => {
        if (d.avgTempF === undefined) return;

        const totalUsage = (d.electricUsageKwh || 0) + thermsToKwh(d.gasUsageTherms || 0);

        // Heating Mode
        if (d.avgTempF < 60) {
            const hdd = calculateHDD(d.avgTempF);
            heatingPoints.push([hdd, totalUsage]);
        }
        // Cooling Mode
        else if (d.avgTempF > 70) {
            const cdd = calculateCDD(d.avgTempF);
            coolingPoints.push([cdd, totalUsage]);
        }
        // Shoulder Season (Base Load Proxy)
        else {
            baseLoadPoints.push(totalUsage);
        }
    });

    let heatingSlope = 0;
    let heatingRSquared = 0;
    let coolingSlope = 0;
    // let coolingRSquared = 0;

    // Calculate Heating Stats
    if (heatingPoints.length > 2) {
        const line = ss.linearRegression(heatingPoints);
        const lineFunc = ss.linearRegressionLine(line);
        heatingSlope = line.m;
        heatingRSquared = ss.rSquared(heatingPoints, lineFunc);
    }

    // Calculate Cooling Stats
    if (coolingPoints.length > 2) {
        const line = ss.linearRegression(coolingPoints);
        // const lineFunc = ss.linearRegressionLine(line);
        coolingSlope = line.m;
        // coolingRSquared = ss.rSquared(coolingPoints, lineFunc);
    }

    // Calculate Base Load
    let baseLoad = 0;
    if (baseLoadPoints.length > 0) {
        baseLoad = ss.mean(baseLoadPoints);
    } else {
        baseLoad = ss.min(data.map(d => (d.electricUsageKwh || 0) + thermsToKwh(d.gasUsageTherms || 0)));
    }

    return {
        baseLoad: Math.max(0, baseLoad),
        heatingSlope: Math.max(0, heatingSlope),
        coolingSlope: Math.max(0, coolingSlope),
        rSquared: heatingRSquared
    };
}

/**
 * Generates actionable recommendations based on analysis.
 */
export function getRecommendations(analysis: AnalysisResult): Recommendation[] {
    const list: Recommendation[] = [];
    const { baseLoad, heatingSlope, coolingSlope, rSquared } = analysis;

    // 1. Heating Recommendations
    if (heatingSlope > 3.0) {
        list.push({
            id: 'insulation',
            title: 'Improve Insulation',
            description: `Your home uses ${heatingSlope.toFixed(1)} kWh per degree of cold. This is relatively high sensitivity, suggesting poor insulation or drafty windows.`,
            impact: 'high',
            category: 'heating'
        });
    } else if (heatingSlope > 1.5) {
        list.push({
            id: 'draft-sealing',
            title: 'Seal Drafts',
            description: 'Check windows and doors for drafts. Small gaps can significantly increase heating costs.',
            impact: 'medium',
            category: 'heating'
        });
    }

    if (rSquared > 0.8) {
        list.push({
            id: 'smart-thermostat',
            title: 'Smart Thermostat Optimization',
            description: 'Your usage correlates very strongly with temperature. A smart thermostat with setbacks could be very effective.',
            impact: 'medium',
            category: 'heating'
        });
    }

    // 2. Base Load Recommendations
    if (baseLoad > 15) {
        list.push({
            id: 'vampire-load',
            title: 'Check "Vampire" Loads',
            description: `Your constant daily usage is high (~${baseLoad.toFixed(0)} kWh). Check for old refrigerators, dehumidifiers, or always-on electronics.`,
            impact: 'high',
            category: 'baseload'
        });
    } else if (baseLoad > 8) {
        list.push({
            id: 'led-lighting',
            title: 'Switch to LED',
            description: 'If you haven\'t already, ensuring all lights are LED can reduce your base load.',
            impact: 'low',
            category: 'baseload'
        });
    }

    // 3. Cooling 
    if (coolingSlope > 4.0) {
        list.push({
            id: 'ac-maintenance',
            title: 'AC Maintenance',
            description: 'Your cooling sensitivity is very high. Ensure your AC filter is clean and the unit is serviced.',
            impact: 'high',
            category: 'cooling'
        });
    }

    return list;
}
