"use client";

import { useState, useMemo } from 'react';
import { FileUploader } from '@/components/file-uploader';
import { HomeProfileSettings } from '@/components/home-profile';
import { EnergyUsageRecord, UtilityType, UnifiedDailyData } from '@/types/energy';
import { HomeProfile, DEFAULT_PROFILE } from '@/types/profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCoordinatesFromZip, getHistoricalWeather, DailyWeather } from '@/lib/weather-service';
import { Loader2 } from 'lucide-react';
import { unifyData } from '@/lib/analytics';
import { Dashboard } from '@/components/dashboard';
import { Insights } from '@/components/insights';
import { RecommendationList } from '@/components/recommendations';

export default function Home() {
  const [electricData, setElectricData] = useState<EnergyUsageRecord[]>([]);
  const [gasData, setGasData] = useState<EnergyUsageRecord[]>([]);
  const [profile, setProfile] = useState<HomeProfile>(DEFAULT_PROFILE);
  const [weatherData, setWeatherData] = useState<DailyWeather[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [unifiedData, setUnifiedData] = useState<UnifiedDailyData[]>([]);

  // Effect to unify data whenever inputs change
  useMemo(() => {
    if ((electricData.length > 0 || gasData.length > 0) && weatherData.length > 0) {
      const unified = unifyData(electricData, gasData, weatherData);
      setUnifiedData(unified);
    }
  }, [electricData, gasData, weatherData]);

  const handleDataLoaded = (data: EnergyUsageRecord[], type: UtilityType) => {
    if (type === 'electric') {
      setElectricData(data);
    } else {
      setGasData(data);
    }
  };

  const fetchWeather = async () => {
    if (!profile.zipCode || profile.zipCode.length < 5) {
      alert("Please enter a valid Zip Code first.");
      return;
    }

    // Determine date range from loaded data
    const allRecords = [...electricData, ...gasData];
    if (allRecords.length === 0) return;

    // Find min/max dates
    // Note: This is simple; ideally handling gaps
    allRecords.sort((a, b) => a.date.getTime() - b.date.getTime());
    const startDate = allRecords[0].date;
    const endDate = allRecords[allRecords.length - 1].date;

    setLoadingWeather(true);
    try {
      const coords = await getCoordinatesFromZip(profile.zipCode);
      if (!coords) {
        alert("Could not find location for Zip Code.");
        return;
      }

      const weather = await getHistoricalWeather(coords.latitude, coords.longitude, startDate, endDate);
      setWeatherData(weather);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch weather data.");
    } finally {
      setLoadingWeather(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Energy Usage Analyzer
          </h1>
          <p className="text-muted-foreground">
            Upload your utility data to visualize patterns and find savings.
          </p>
        </div>

        <HomeProfileSettings profile={profile} onChange={setProfile} />

        {unifiedData.length > 0 && (
          <>
            <Insights data={unifiedData} />
            <RecommendationList data={unifiedData} />
            <Dashboard data={unifiedData} />
          </>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <FileUploader onDataLoaded={handleDataLoaded} />

          <Card>
            <CardHeader>
              <CardTitle>Data Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Electric Records</p>
                    <p className="text-2xl font-bold">{electricData.length}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gas Records</p>
                    <p className="text-2xl font-bold">{gasData.length}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Weather Data</p>
                  {weatherData.length > 0 ? (
                    <p className="text-green-600 font-medium flex items-center gap-2">
                      Loaded {weatherData.length} days of history
                    </p>
                  ) : (
                    <Button
                      onClick={fetchWeather}
                      disabled={loadingWeather || (electricData.length === 0 && gasData.length === 0)}
                      className="w-full"
                    >
                      {loadingWeather && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {loadingWeather ? "Fetching..." : "Fetch Weather History"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Temporary Raw Data View for Debugging */}
        {(electricData.length > 0 || gasData.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Loaded Data Preview</CardTitle>
            </CardHeader>
            <CardContent className="max-h-64 overflow-auto text-xs font-mono">
              <pre>
                {JSON.stringify({ electric: electricData.slice(0, 3), gas: gasData.slice(0, 3) }, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
