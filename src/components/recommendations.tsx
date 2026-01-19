"use client";

import React, { useMemo } from 'react';
import { UnifiedDailyData } from '@/types/energy';
import { performRegressionAnalysis, getRecommendations } from '@/lib/analytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Snowflake, Flame, CheckCircle2 } from 'lucide-react';

interface RecommendationListProps {
    data: UnifiedDailyData[];
}

export function RecommendationList({ data }: RecommendationListProps) {
    const recommendations = useMemo(() => {
        const analysis = performRegressionAnalysis(data);
        return getRecommendations(analysis);
    }, [data]);

    if (recommendations.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Recommendations
                </CardTitle>
                <CardDescription>
                    Tailored tips based on your usage patterns.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {recommendations.map(rec => (
                        <div key={rec.id} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <Badge variant={rec.impact === 'high' ? 'destructive' : 'secondary'}>
                                    {rec.impact.toUpperCase()} IMPACT
                                </Badge>
                                {rec.category === 'heating' && <Flame className="h-4 w-4 text-orange-500" />}
                                {rec.category === 'cooling' && <Snowflake className="h-4 w-4 text-blue-500" />}
                                {rec.category === 'baseload' && <Zap className="h-4 w-4 text-yellow-500" />}
                            </div>
                            <h4 className="font-semibold">{rec.title}</h4>
                            <p className="text-sm text-muted-foreground">{rec.description}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
