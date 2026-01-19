"use client";

import React, { useMemo, useState } from 'react';
import { UnifiedDailyData } from '@/types/energy';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'; // Need to verify Tabs install
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { thermsToKwh } from '@/lib/analytics';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface DashboardProps {
    data: UnifiedDailyData[];
}

export function Dashboard({ data }: DashboardProps) {
    const [viewMode, setViewMode] = useState<'combined_kwh' | 'electric' | 'gas'>('combined_kwh');

    // Prepare data for the chart based on view mode
    const chartData = useMemo(() => {
        return data.map(day => {
            const elec = day.electricUsageKwh || 0;
            const gasKwh = day.gasUsageTherms ? thermsToKwh(day.gasUsageTherms) : 0;

            return {
                ...day,
                totalKwh: elec + gasKwh,
                gasKwh: gasKwh,
                dateShort: new Date(day.date).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })
            };
        });
    }, [data]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Energy Dashboard</h2>
                <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select View" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="combined_kwh">Combined (kWh)</SelectItem>
                        <SelectItem value="electric">Electric Only (kWh)</SelectItem>
                        <SelectItem value="gas">Gas Only (Therms)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daily Usage vs Temperature</CardTitle>
                    <CardDescription>
                        {viewMode === 'combined_kwh' ? "Total Energy (Electric + Gas converted to kWh)" :
                            viewMode === 'electric' ? "Electric Usage (kWh)" : "Gas Usage (Therms)"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="dateShort"
                                    tick={{ fontSize: 12 }}
                                    tickMargin={10}
                                />
                                {/* Left Y-Axis for Energy */}
                                <YAxis
                                    yAxisId="left"
                                    orientation="left"
                                    stroke="#8884d8"
                                    label={{
                                        value: viewMode === 'gas' ? 'Therms' : 'kWh',
                                        angle: -90,
                                        position: 'insideLeft'
                                    }}
                                />
                                {/* Right Y-Axis for Temperature */}
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    stroke="#ff7300"
                                    domain={['auto', 'auto']}
                                    unit="°F"
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}
                                    labelFormatter={(label) => `Date: ${label}`}
                                />
                                <Legend />

                                {/* Temperature Line */}
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="avgTempF"
                                    name="Avg Temp (°F)"
                                    stroke="#ff7300"
                                    dot={false}
                                    strokeWidth={2}
                                />

                                {/* Bars based on View Mode */}
                                {viewMode === 'combined_kwh' && (
                                    <>
                                        <Bar yAxisId="left" dataKey="electricUsageKwh" name="Electric (kWh)" stackId="a" fill="#3b82f6" />
                                        <Bar yAxisId="left" dataKey="gasKwh" name="Gas (as kWh)" stackId="a" fill="#ef4444" />
                                    </>
                                )}

                                {viewMode === 'electric' && (
                                    <Bar yAxisId="left" dataKey="electricUsageKwh" name="Electric (kWh)" fill="#3b82f6" />
                                )}

                                {viewMode === 'gas' && (
                                    <Bar yAxisId="left" dataKey="gasUsageTherms" name="Gas (Therms)" fill="#ef4444" />
                                )}

                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
