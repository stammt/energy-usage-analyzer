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
    // http://api.zippopotam.us/us/20723
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

export async function getHistoricalWeather(
    lat: number,
    lon: number,
    startDate: Date,
    endDate: Date
): Promise<DailyWeather[]> {
    // Format dates as YYYY-MM-DD
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    // Open-Meteo Archive API
    // https://archive-api.open-meteo.com/v1/archive?latitude=52.52&longitude=13.41&start_date=2023-01-01&end_date=2023-12-31&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean&temperature_unit=fahrenheit&timezone=auto

    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startStr}&end_date=${endStr}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean&temperature_unit=fahrenheit&timezone=auto`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!data.daily) throw new Error("No daily data received");

        const dates = data.daily.time as string[];
        const means = data.daily.temperature_2m_mean as number[];
        const maxs = data.daily.temperature_2m_max as number[];
        const mins = data.daily.temperature_2m_min as number[];

        return dates.map((date, i) => ({
            date,
            avgTempF: means[i],
            maxTempF: maxs[i],
            minTempF: mins[i]
        }));

    } catch (error) {
        console.error("Weather fetch failed", error);
        return [];
    }
}
