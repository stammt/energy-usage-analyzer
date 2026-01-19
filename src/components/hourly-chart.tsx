"use client";

import React from 'react';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EnergyUsageRecord } from '@/types/energy';
import { HourlyWeather } from '@/lib/weather-service';

interface HourlyUsageChartProps {
    date: string; // YYYY-MM-DD
    electricData: EnergyUsageRecord[];
    gasData: EnergyUsageRecord[];
    hourlyWeather: HourlyWeather[];
    onClose: () => void;
}

export function HourlyUsageChart({ date, electricData, gasData, hourlyWeather, onClose }: HourlyUsageChartProps) {

    // 1. Filter data for this specific date
    const startOfDay = new Date(date).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

    const electricForDay = electricData.filter(d => {
        const t = d.date.getTime();
        return t >= startOfDay && t < endOfDay;
    });

    const gasForDay = gasData.filter(d => {
        const t = d.date.getTime();
        return t >= startOfDay && t < endOfDay;
    });

    // 2. Merge into 24 hourly buckets
    const data = Array.from({ length: 24 }, (_, i) => {
        const hourLabel = `${i.toString().padStart(2, '0')}:00`;

        // Find matching usage
        // Note: Data timestamps might be slightly off (e.g. 00:15), so we bin by hour
        const electric = electricForDay.find(d => d.date.getHours() === i)?.usage || 0;
        const gas = gasForDay.find(d => d.date.getHours() === i)?.usage || 0;

        // Find matching weather
        // Weather "time" string format depends on API, likely ISO or YYYY-MM-DDTHH:mm
        // We need to parse strict 'date' YYYY-MM-DD + hour
        const weatherEntry = hourlyWeather.find(w => {
            const wDate = new Date(w.time);
            // Match Date AND Hour
            return wDate.getDate() === new Date(date).getDate() && wDate.getHours() === i;
        });

        return {
            hour: hourLabel,
            electricKwh: electric,
            gasTherms: gas,
            tempF: weatherEntry ? weatherEntry.tempF : null
        };
    });

    return (
        <Card className="fixed inset-4 z-50 shadow-2xl overflow-auto border-2 border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Hourly Detail for {date}</CardTitle>
                    <CardDescription>Hour-by-hour breakdown of energy vs. temperature.</CardDescription>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-2 text-2xl font-bold">&times;</button>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis dataKey="hour" fontSize={12} />
                            <YAxis yAxisId="left" label={{ value: 'Usage', angle: -90, position: 'insideLeft' }} />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                domain={['auto', 'auto']}
                                label={{ value: 'Temp (°F)', angle: 90, position: 'insideRight' }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px' }}
                                formatter={(value: any, name: any) => [
                                    typeof value === 'number' ? value.toFixed(2) : value,
                                    name === 'electricKwh' ? 'Electric (kWh)' : name === 'gasTherms' ? 'Gas (Therms)' : 'Temp (°F)'
                                ]}
                            />
                            <Legend verticalAlign="top" height={36} />

                            <Bar yAxisId="left" dataKey="electricKwh" fill="#3b82f6" name="Electric" barSize={20} />
                            <Bar yAxisId="left" dataKey="gasTherms" fill="#f97316" name="Gas" barSize={20} />
                            <Line yAxisId="right" type="monotone" dataKey="tempF" stroke="#ef4444" strokeWidth={2} dot={false} name="Temp" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
