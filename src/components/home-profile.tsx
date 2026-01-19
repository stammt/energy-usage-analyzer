"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { HomeProfile } from '@/types/profile';

interface HomeProfileSettingsProps {
    profile: HomeProfile;
    onChange: (profile: HomeProfile) => void;
}

export function HomeProfileSettings({ profile, onChange }: HomeProfileSettingsProps) {

    const updateField = (field: keyof HomeProfile, value: string) => {
        onChange({ ...profile, [field]: value });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Home Profile</CardTitle>
                <CardDescription>Tell us about your home to improve analysis accuracy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="heating">Heating Source</Label>
                        <Select
                            value={profile.heatingSource}
                            onValueChange={(val) => updateField('heatingSource', val)}
                        >
                            <SelectTrigger id="heating">
                                <SelectValue placeholder="Select heating source" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gas_furnace">Gas Furnace</SelectItem>
                                <SelectItem value="electric_furnace">Electric Furnace</SelectItem>
                                <SelectItem value="heat_pump">Heat Pump</SelectItem>
                                <SelectItem value="boiler">Boiler (Radiator)</SelectItem>
                                <SelectItem value="none">None</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cooling">Cooling Source</Label>
                        <Select
                            value={profile.coolingSource}
                            onValueChange={(val) => updateField('coolingSource', val)}
                        >
                            <SelectTrigger id="cooling">
                                <SelectValue placeholder="Select cooling source" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="central_ac">Central AC</SelectItem>
                                <SelectItem value="heat_pump">Heat Pump</SelectItem>
                                <SelectItem value="window_units">Window Units</SelectItem>
                                <SelectItem value="none">None</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="water">Water Heater</Label>
                        <Select
                            value={profile.waterHeater}
                            onValueChange={(val) => updateField('waterHeater', val)}
                        >
                            <SelectTrigger id="water">
                                <SelectValue placeholder="Select water heater type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gas">Gas</SelectItem>
                                <SelectItem value="electric">Electric</SelectItem>
                                <SelectItem value="heat_pump">Heat Pump (Hybrid)</SelectItem>
                                <SelectItem value="unknown">Unknown</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="zip">Zip Code</Label>
                        <Input
                            id="zip"
                            placeholder="e.g. 20723"
                            value={profile.zipCode}
                            onChange={(e) => updateField('zipCode', e.target.value)}
                            maxLength={5}
                        />
                        <p className="text-xs text-muted-foreground">Used for local weather data.</p>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
