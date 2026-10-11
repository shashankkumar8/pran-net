export type ViewId =
  | 'overview'
  | 'vayu'
  | 'whybad'
  | 'downwind'
  | 'sectors'
  | 'review'
  | 'ledger'
  | 'sources'
  | 'methodology';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface LocationCoordinates {
  lat: number;
  lon: number;
  name: string;
}

export interface LiveTelemetry {
  air_quality: {
    provider: string;
    model_attribution?: string;
    data_type: string;
    status: string;
    valid_time?: string;
    retrieved_at: string;
    pollutants?: Record<string, number>;
    units?: Record<string, string>;
    european_aqi?: number;
    us_aqi?: number;
    indicative_category?: string;
    category_basis?: string;
    methodology_note?: string;
    error?: string;
  };
  weather: {
    provider: string;
    data_type: string;
    status: string;
    valid_time?: string;
    retrieved_at: string;
    temperature_c?: number;
    relative_humidity_percent?: number;
    wind_speed_kmh?: number;
    wind_direction_deg?: number;
    wind_compass?: string;
    units?: Record<string, string>;
    scientific_caveat?: string;
    error?: string;
  };
  location: LocationCoordinates;
  retrieved_at: string;
}

export interface DataSourceStatus {
  id?: string;
  name?: string;
  provider?: string;
  data_type: string;
  status: 'LIVE' | 'CACHED' | 'SIMULATED' | 'NEEDS CONFIGURATION' | 'DEGRADED' | 'UNAVAILABLE';
  retrieved_at?: string;
  details?: string;
  attribution?: string;
  setup_guide?: string;
}

export interface ActionRecord {
  pk: string;
  sk: string;
  action_id: string;
  activity: string;
  decision: string;
  action_taken: string;
  note: string;
  created_at: string;
  review_seconds?: number;
  rules_version: string;
  data_status: string;
  advisory_snapshot?: any;
}
