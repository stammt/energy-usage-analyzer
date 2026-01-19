"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HomeProfile, Zone } from '@/types/profile';
import { Trash2, Plus } from 'lucide-react';

interface HomeProfileSettingsProps {
    profile: HomeProfile;
    onChange: (profile: HomeProfile) => void;
}

export function HomeProfileSettings({ profile, onChange }: HomeProfileSettingsProps) {

    const updateField = (field: keyof HomeProfile, value: any) => {
        onChange({ ...profile, [field]: value });
    };

    const updateZone = (zoneId: string, field: keyof Zone, value: string) => {
        const newZones = profile.zones.map(z => {
            if (z.id === zoneId) {
                return { ...z, [field]: value };
            }
            return z;
        });
        updateField('zones', newZones);
    };

    const addZone = () => {
        const newId = (Math.random() + 1).toString(36).substring(7);
        const newZone: Zone = {
            id: newId,
            name: `Zone ${profile.zones.length + 1}`,
            heatingSource: 'electric_furnace',
            coolingSource: 'central_ac'
        };
        updateField('zones', [...profile.zones, newZone]);
    };

    const removeZone = (zoneId: string) => {
        if (profile.zones.length <= 1) return;
        const newZones = profile.zones.filter(z => z.id !== zoneId);
        updateField('zones', newZones);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Home Profile</CardTitle>
                <CardDescription>Configure your HVAC zones and appliances.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Global Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="zip">Zip Code</Label>
                        <Input
                            id="zip"
                            placeholder="e.g. 20723"
                            value={profile.zipCode}
                            onChange={(e) => updateField('zipCode', e.target.value)}
                            maxLength={5}
                        />
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
                </div>

                <div className="border-t pt-4">
                    <h3 className="text-sm font-medium mb-4">HVAC Zones</h3>

                    <div className="space-y-4">
                        {profile.zones.map((zone, index) => (
                            <div key={zone.id} className="p-4 border rounded-lg relative bg-secondary/20">
                                {profile.zones.length > 1 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => removeZone(zone.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Zone Name</Label>
                                        <Input
                                            value={zone.name}
                                            onChange={(e) => updateZone(zone.id, 'name', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Heating</Label>
                                        <Select
                                            value={zone.heatingSource}
                                            onValueChange={(val) => updateZone(zone.id, 'heatingSource', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
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
                                        <Label>Cooling</Label>
                                        <Select
                                            value={zone.coolingSource}
                                            onValueChange={(val) => updateZone(zone.id, 'coolingSource', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="central_ac">Central AC</SelectItem>
                                                <SelectItem value="heat_pump">Heat Pump</SelectItem>
                                                <SelectItem value="window_units">Window Units</SelectItem>
                                                <SelectItem value="none">None</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button variant="outline" size="sm" className="mt-4" onClick={addZone}>
                        <Plus className="mr-2 h-4 w-4" /> Add Zone
                    </Button>
                </div>

            </CardContent>
        </Card>
    );
}
