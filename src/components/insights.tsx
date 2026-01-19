"use client";

import React, { useMemo } from 'react';
import { UnifiedDailyData } from '@/types/energy';
import { performRegressionAnalysis, AnalysisResult } from '@/lib/analytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, TrendingUp, ThermometerSnowflake, ThermometerSun } from 'lucide-react';

interface InsightsProps {
    data: UnifiedDailyData[];
}

export function Insights({ data }: InsightsProps) {
    const analysis = useMemo(() => {
        return performRegressionAnalysis(data);
    }, [data]);

    const { baseLoad, heatingSlope, coolingSlope, rSquared } = analysis;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            {/* Base Load Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Daily Base Load</CardTitle>
                    <Lightbulb className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{baseLoad.toFixed(1)} kWh</div>
                    <p className="text-xs text-muted-foreground">
                        Estimated "always on" usage (fridge, wifi, etc.)
                    </p>
                </CardContent>
            </Card>

            {/* Heating Efficiency Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Heating Sensitivity</CardTitle>
                    <ThermometerSnowflake className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{heatingSlope.toFixed(2)} kWh</div>
                    <p className="text-xs text-muted-foreground">
                        per Heating Degree Day (HDD)
                    </p>
                    {rSquared > 0.5 && (
                        <p className="text-xs text-green-600 mt-1">High correlation detected</p>
                    )}
                </CardContent>
            </Card>

            {/* Cooling Efficiency Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cooling Sensitivity</CardTitle>
                    <ThermometerSun className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{coolingSlope > 0 ? coolingSlope.toFixed(2) : '--'} kWh</div>
                    <p className="text-xs text-muted-foreground">
                        per Cooling Degree Day (CDD)
                    </p>
                </CardContent>
            </Card>

            {/* Summary / Tip */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Heating Insight</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-sm">
                        At {heatingSlope.toFixed(2)} kWh/degree, lowering your thermostat by 1°F could save approx <span className="font-bold">{(heatingSlope * 30).toFixed(0)} kWh</span> per month in winter.
                    </p>
                </CardContent>
            </Card>

        </div>
    );
}
