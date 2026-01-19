export type HeatingSource = 'gas_furnace' | 'electric_furnace' | 'heat_pump' | 'boiler' | 'none';
export type CoolingSource = 'central_ac' | 'window_units' | 'heat_pump' | 'none';
export type WaterHeaterSource = 'gas' | 'electric' | 'heat_pump' | 'unknown';

export interface Zone {
    id: string;
    name: string;
    heatingSource: HeatingSource;
    coolingSource: CoolingSource;
}

export interface HomeProfile {
    zones: Zone[];
    waterHeater: WaterHeaterSource;
    zipCode: string;
}

export const DEFAULT_ZONE: Zone = {
    id: '1',
    name: 'Main Zone',
    heatingSource: 'gas_furnace',
    coolingSource: 'central_ac'
};

export const DEFAULT_PROFILE: HomeProfile = {
    zones: [DEFAULT_ZONE],
    waterHeater: 'gas',
    zipCode: ''
};
