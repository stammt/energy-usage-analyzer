export interface GeoLocation {
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string; // State/Region
}

export async function getCoordinatesFromZip(zipCode: string): Promise<GeoLocation | null> {
    if (!zipCode || zipCode.length < 5) return null;

    // Use Zippopotam.us for Zip Code lookup (Free, No Key)
    try {
        const res = await fetch(`http://api.zippopotam.us/us/${zipCode}`);
        if (!res.ok) return null;

        const data = await res.json();

        if (data.places && data.places.length > 0) {
            const place = data.places[0];
            return {
                name: place['place name'],
                latitude: parseFloat(place.latitude),
                longitude: parseFloat(place.longitude),
                country: data.country,
                admin1: place.state
            };
        }
    } catch (error) {
        console.error("Failed to fetch coordinates", error);
    }
    return null;
}

export interface DailyWeather {
    date: string; // YYYY-MM-DD
    avgTempF: number;
    minTempF: number;
    maxTempF: number;
}

export interface HourlyWeather {
    time: string; // ISO String or YYYY-MM-DDTHH:mm
    tempF: number;
}

export interface WeatherData {
    daily: DailyWeather[];
    hourly: HourlyWeather[];
}

export async function getHistoricalWeather(
    lat: number,
    lon: number,
    startDate: Date,
    endDate: Date
): Promise<WeatherData> {
    // Format dates as YYYY-MM-DD
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    // Open-Meteo Archive API
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startStr}&end_date=${endStr}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean&hourly=temperature_2m&temperature_unit=fahrenheit&timezone=auto`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!data.daily || !data.hourly) throw new Error("No data received");

        // Process Daily
        const dates = data.daily.time as string[];
        const means = data.daily.temperature_2m_mean as number[];
        const maxs = data.daily.temperature_2m_max as number[];
        const mins = data.daily.temperature_2m_min as number[];

        const daily = dates.map((date, i) => ({
            date,
            avgTempF: means[i],
            maxTempF: maxs[i],
            minTempF: mins[i]
        }));

        // Process Hourly
        const times = data.hourly.time as string[];
        const temps = data.hourly.temperature_2m as number[];

        const hourly = times.map((time, i) => ({
            time,
            tempF: temps[i]
        }));

        return { daily, hourly };

    } catch (error) {
        console.error("Weather fetch failed", error);
        return { daily: [], hourly: [] };
    }
}
