export interface HomeProfile {
    heatingSource: 'gas_furnace' | 'electric_furnace' | 'heat_pump' | 'boiler' | 'none';
    coolingSource: 'central_ac' | 'window_units' | 'heat_pump' | 'none';
    waterHeater: 'gas' | 'electric' | 'heat_pump' | 'unknown';
    zipCode: string;
}

export const DEFAULT_PROFILE: HomeProfile = {
    heatingSource: 'gas_furnace',
    coolingSource: 'central_ac',
    waterHeater: 'gas',
    zipCode: ''
};
