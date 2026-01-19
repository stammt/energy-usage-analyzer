export type UtilityType = 'gas' | 'electric';

export interface EnergyUsageRecord {
  date: Date;
  usage: number; // kWh or Therms
  cost?: number;
  estimated?: boolean;
}

export interface WeatherData {
  date: Date;
  avgTempC: number;
  hdd: number; // Heating Degree Days
  cdd: number; // Cooling Degree Days
}

export interface UnifiedDailyData {
  date: string; // ISO date string YYYY-MM-DD
  electricUsageKwh?: number;
  gasUsageTherms?: number;
  avgTempF?: number;
}
