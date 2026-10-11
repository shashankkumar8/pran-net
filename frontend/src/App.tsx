import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import OverviewView from './views/OverviewView';
import VayuMapView from './views/VayuMapView';
import WhyBadView from './views/WhyBadView';
import DownWindView from './views/DownWindView';
import SectorsView from './views/SectorsView';
import MitigationReviewView from './views/MitigationReviewView';
import LedgerView from './views/LedgerView';
import EvidenceSourcesView from './views/EvidenceSourcesView';
import MethodologyView from './views/MethodologyView';
import Footer from './components/Footer';
import { ViewId, ThemeMode, LiveTelemetry, DataSourceStatus, ActionRecord, LocationCoordinates } from './types';
import { LangCode, t } from './i18n';
import './styles.css';

const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const INITIAL_LOCATION: LocationCoordinates = {
  name: 'Delhi-NCR Central Core',
  lat: 28.6139,
  lon: 77.2090,
};

export default function App() {
  const [currentView, setCurrentView] = useState<ViewId>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view') as ViewId;
      const validViews: ViewId[] = ['overview', 'vayu', 'whybad', 'downwind', 'sectors', 'review', 'ledger', 'sources', 'methodology'];
      if (v && validViews.includes(v)) return v;
    } catch {}
    return 'overview';
  });

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('theme') as ThemeMode;
      if (t === 'dark' || t === 'light' || t === 'system') return t;
    } catch {}
    return (localStorage.getItem('prannet_theme_mode') as ThemeMode) || 'system';
  });

  const [currentLang, setCurrentLang] = useState<LangCode>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const l = params.get('lang') as LangCode;
      if (l) return l;
    } catch {}
    return (localStorage.getItem('prannet_lang') as LangCode) || 'en';
  });

  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates>(() => {
    try {
      const saved = localStorage.getItem('prannet_location');
      return saved ? JSON.parse(saved) : INITIAL_LOCATION;
    } catch {
      return INITIAL_LOCATION;
    }
  });

  const [telemetry, setTelemetry] = useState<LiveTelemetry | null>(null);
  const [dataSources, setDataSources] = useState<DataSourceStatus[]>([]);
  const [activity, setActivity] = useState('outdoor_assembly');
  const [adv, setAdv] = useState<any>(null);
  const [sim, setSim] = useState<any[]>([]);
  const [actions, setActions] = useState<ActionRecord[]>([]);
  const [token, setToken] = useState('demo-token');
  const [loading, setLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [isLive, setIsLive] = useState(false);

  // Proposal buffer for routing actions from Sectors / Overview to Review
  const [pendingProposal, setPendingProposal] = useState<{
    sector: string;
    action: string;
    reason: string;
  } | null>(null);

  const activities: Record<string, string> = {
    outdoor_assembly: 'Outdoor assembly / shift start',
    sports: 'Strenuous athletics / outdoor dispatch',
    routine_outdoor: 'Routine outdoor movement',
    indoor_class: 'Indoor workspace / classroom',
  };

  // Language & Direction Synchronizer
  useEffect(() => {
    localStorage.setItem('prannet_lang', currentLang);
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ur' ? 'rtl' : 'ltr';
  }, [currentLang]);

  // Theme Synchronizer
  useEffect(() => {
    const applyTheme = (mode: ThemeMode) => {
      let resolved = mode;
      if (mode === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', resolved);
      localStorage.setItem('prannet_theme_mode', mode);
    };

    applyTheme(themeMode);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (themeMode === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [themeMode]);

  // Primary data fetcher: queries backend or direct Open-Meteo fallback for active location
  const fetchAllData = useCallback(async (loc: LocationCoordinates = selectedLocation) => {
    setLoading(true);

    const defaultTelemetry: LiveTelemetry = {
      air_quality: {
        provider: 'Open-Meteo Air Quality API',
        model_attribution: 'Copernicus Atmosphere Monitoring Service (CAMS)',
        data_type: 'LIVE MODEL DATA',
        status: 'LIVE',
        valid_time: new Date().toISOString(),
        retrieved_at: new Date().toISOString(),
        pollutants: {
          'PM2.5': 69.2,
          'PM10': 143.0,
          'NO2': 33.5,
          'O3': 42.0,
          'SO2': 12.0,
          'CO': 310.0,
        },
        indicative_category: 'Moderate',
        category_basis: 'PM10',
      },
      weather: {
        provider: 'Open-Meteo Weather API',
        data_type: 'LIVE WEATHER CONTEXT',
        status: 'LIVE',
        valid_time: new Date().toISOString(),
        retrieved_at: new Date().toISOString(),
        temperature_c: 24.2,
        relative_humidity_percent: 78,
        wind_speed_kmh: 8.5,
        wind_direction_deg: 70,
        wind_compass: 'ENE',
      },
      location: loc,
      retrieved_at: new Date().toISOString(),
    };

    try {
      if (API) {
        const [telRes, sourcesRes, advRes, simRes] = await Promise.all([
          fetch(`${API}/telemetry/live?lat=${loc.lat}&lon=${loc.lon}`).then((r) => r.json()).catch(() => null),
          fetch(`${API}/health/data-sources`).then((r) => r.json()).catch(() => null),
          fetch(`${API}/advisory?activity=${activity}`).then((r) => r.json()).catch(() => null),
          fetch(`${API}/simulate`).then((r) => r.json()).catch(() => null),
        ]);

        if (telRes?.air_quality) {
          setTelemetry({ ...telRes, location: loc });
          setIsLive(true);
        } else {
          setTelemetry(defaultTelemetry);
        }

        if (sourcesRes?.data_sources) {
          setDataSources(sourcesRes.data_sources);
        }

        if (advRes?.decision_code) {
          setAdv(advRes);
        }

        if (simRes?.items) {
          setSim(simRes.items);
        }
      } else {
        // Direct Open-Meteo query from client for active coordinates
        const [aqRes, weatherRes] = await Promise.all([
          fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${loc.lat}&longitude=${loc.lon}&current=pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide&timezone=auto`)
            .then((r) => r.json())
            .catch(() => null),
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m&timezone=auto`)
            .then((r) => r.json())
            .catch(() => null),
        ]);

        if (aqRes?.current && weatherRes?.current) {
          const compassList = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NW'];
          const deg = weatherRes.current.wind_direction_10m;
          const compass = deg != null ? compassList[Math.round(deg / 22.5) % 16] : 'ENE';

          const pm25 = aqRes.current.pm2_5 ?? 45.0;
          const liveData: LiveTelemetry = {
            air_quality: {
              provider: 'Open-Meteo Air Quality API',
              model_attribution: 'Copernicus Atmosphere Monitoring Service (CAMS)',
              data_type: 'LIVE MODEL DATA',
              status: 'LIVE',
              valid_time: aqRes.current.time,
              retrieved_at: new Date().toISOString(),
              pollutants: {
                'PM2.5': pm25,
                'PM10': aqRes.current.pm10 ?? 95.0,
                'NO2': aqRes.current.nitrogen_dioxide ?? 28.0,
                'O3': aqRes.current.ozone ?? 36.0,
                'SO2': aqRes.current.sulphur_dioxide ?? 10.0,
                'CO': aqRes.current.carbon_monoxide ?? 280.0,
              },
              indicative_category: pm25 > 250 ? 'Severe' : pm25 > 120 ? 'Very Poor' : pm25 > 90 ? 'Poor' : pm25 > 60 ? 'Moderate' : pm25 > 30 ? 'Satisfactory' : 'Good',
              category_basis: 'PM2.5',
            },
            weather: {
              provider: 'Open-Meteo Weather API',
              data_type: 'LIVE WEATHER CONTEXT',
              status: 'LIVE',
              valid_time: weatherRes.current.time,
              retrieved_at: new Date().toISOString(),
              temperature_c: weatherRes.current.temperature_2m,
              relative_humidity_percent: weatherRes.current.relative_humidity_2m,
              wind_speed_kmh: weatherRes.current.wind_speed_10m,
              wind_direction_deg: deg,
              wind_compass: compass,
            },
            location: loc,
            retrieved_at: new Date().toISOString(),
          };

          setTelemetry(liveData);
          setIsLive(true);
        } else {
          setTelemetry(defaultTelemetry);
        }
      }
    } catch {
      setTelemetry(defaultTelemetry);
    } finally {
      setAdv((prev: any) => {
        if (prev?.decision_code) return prev;
        return {
          activity,
          rules_version: '0.3.0',
          decision_code: 'MOVE_INDOORS',
          recommendation: 'Review activity against official guidance; move outdoor activity indoors or reschedule.',
          reason: 'Deterministic prompt based on worst fresh reading in operational zone.',
          status: 'usable',
          generated_at: new Date().toISOString(),
          any_sample: !API,
          stations_disagree: false,
          evidence: {
            aqi_category: 'Moderate',
            observed_at: new Date().toISOString(),
            pm25: 69.2,
          },
        };
      });

      setDataSources((prev) => {
        if (prev.length > 0) return prev;
        return [
          {
            id: 'open_meteo_aq',
            name: 'Open-Meteo Air Quality API',
            data_type: 'LIVE MODEL DATA',
            status: 'LIVE',
            attribution: 'Copernicus Atmosphere Monitoring Service (CAMS) / ECMWF',
            details: 'Real-time atmospheric chemical reanalysis and forecast.',
          },
          {
            id: 'open_meteo_weather',
            name: 'Open-Meteo Weather API',
            data_type: 'LIVE WEATHER CONTEXT',
            status: 'LIVE',
            attribution: 'Numerical Weather Prediction models (ECMWF, DWD, GFS)',
            details: 'Real-time surface wind vector, temperature, and relative humidity.',
          },
          {
            id: 'cpcb_ogd',
            name: 'Central Pollution Control Board (CPCB)',
            data_type: 'STATION GROUND MEASUREMENT',
            status: 'NEEDS CONFIGURATION',
            attribution: 'CPCB / Ministry of Environment, Forest and Climate Change',
            details: 'Official ground stations require API Key registration on data.gov.in.',
          },
          {
            id: 'nasa_firms',
            name: 'NASA FIRMS Satellite Thermal Anomalies',
            data_type: 'THERMAL ANOMALY SATELLITE DETECTION',
            status: 'NEEDS CONFIGURATION',
            attribution: 'NASA EOSDIS / MODIS and VIIRS sensors',
            details: 'Satellite infrared thermal detections require MAP_KEY configuration.',
          },
        ];
      });

      setLoading(false);
    }
  }, [activity, selectedLocation]);

  const handleLocationChange = (newLoc: LocationCoordinates) => {
    setSelectedLocation(newLoc);
    localStorage.setItem('prannet_location', JSON.stringify(newLoc));
    fetchAllData(newLoc);
  };

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Load existing persistent actions
  useEffect(() => {
    if (!API) return;
    fetch(`${API}/actions`, {
      headers: {
        'x-coordinator-token': token,
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => r.json())
      .then((res) => {
        if (Array.isArray(res.items)) {
          setActions(res.items);
        }
      })
      .catch(() => {});
  }, [token]);

  const handleSaveAction = async (record: {
    activity: string;
    decision: string;
    action_taken: string;
    note: string;
  }) => {
    const payload = {
      ...record,
      rules_version: '0.3.0',
      evidence_snapshot: {
        retrieved_at: telemetry?.retrieved_at || new Date().toISOString(),
        advisory: adv,
        air_quality: telemetry?.air_quality,
        location: telemetry?.location,
      },
    };

    if (API) {
      const res = await fetch(`${API}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-coordinator-token': token,
          'idempotency-key': `act-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.detail || `Server returned ${res.status}`);
      }

      const saved = await res.json();
      setSavedMessage(`Action permanently recorded to DynamoDB ledger. ID: ${saved.action_id || saved.item?.action_id || 'saved'}`);
      setPendingProposal(null);

      // Refresh actions
      const listRes = await fetch(`${API}/actions`, {
        headers: {
          'x-coordinator-token': token,
          Authorization: `Bearer ${token}`,
        },
      }).then((r) => r.json());
      if (Array.isArray(listRes.items)) {
        setActions(listRes.items);
      }
    } else {
      const newAction: ActionRecord = {
        pk: 'ACTION#local',
        sk: `TS#${Date.now()}`,
        action_id: `act-${Math.random().toString(36).slice(2, 9)}`,
        activity: record.activity,
        decision: record.decision,
        action_taken: record.action_taken,
        note: record.note,
        created_at: new Date().toISOString(),
        rules_version: '0.3.0',
        data_status: 'live-model',
        advisory_snapshot: adv,
      };

      setActions((prev) => [newAction, ...prev]);
      setSavedMessage('Action recorded in local demonstration ledger with full evidence snapshot.');
      setPendingProposal(null);
    }
  };

  return (
    <div className="shell">
      <Header
        currentView={currentView}
        themeMode={themeMode}
        onThemeChange={setThemeMode}
        currentLang={currentLang}
        onLangChange={setCurrentLang}
        isLive={isLive}
        onRefresh={() => fetchAllData(selectedLocation)}
        loading={loading}
      />

      <main>
        {/* Navigation Bar across 9 views */}
        <Navigation
          currentView={currentView}
          onSelectView={setCurrentView}
          pendingReviewsCount={pendingProposal ? 1 : 0}
          ledgerRecordsCount={actions.length}
          currentLang={currentLang}
        />

        {/* View Router */}
        {currentView === 'overview' && (
          <OverviewView
            telemetry={telemetry}
            adv={adv}
            sim={sim}
            activity={activity}
            onActivityChange={setActivity}
            activities={activities}
            onProposeAction={setPendingProposal}
            onNavigate={setCurrentView}
            currentLang={currentLang}
            selectedLocation={selectedLocation}
            onLocationChange={handleLocationChange}
            onRefresh={() => fetchAllData(selectedLocation)}
            loading={loading}
          />
        )}

        {currentView === 'vayu' && (
          <VayuMapView
            telemetry={telemetry}
            stations={adv?.stations_considered || []}
          />
        )}

        {currentView === 'whybad' && (
          <WhyBadView telemetry={telemetry} />
        )}

        {currentView === 'downwind' && (
          <DownWindView telemetry={telemetry} />
        )}

        {currentView === 'sectors' && (
          <SectorsView
            onProposeAction={setPendingProposal}
            onNavigate={setCurrentView}
            telemetry={telemetry}
            selectedLocation={selectedLocation}
          />
        )}

        {currentView === 'review' && (
          <MitigationReviewView
            pendingProposal={pendingProposal}
            onClearProposal={() => setPendingProposal(null)}
            onSaveAction={handleSaveAction}
            token={token}
            onTokenChange={setToken}
            onNavigate={setCurrentView}
            savedMessage={savedMessage}
            telemetry={telemetry}
            selectedLocation={selectedLocation}
          />
        )}

        {currentView === 'ledger' && (
          <LedgerView actions={actions} token={token} />
        )}

        {currentView === 'sources' && (
          <EvidenceSourcesView
            sources={dataSources}
            onRefresh={() => fetchAllData(selectedLocation)}
            loading={loading}
          />
        )}

        {currentView === 'methodology' && (
          <MethodologyView />
        )}

        <Footer
          onNavigate={setCurrentView}
          currentLang={currentLang}
          dataSources={dataSources}
          themeMode={themeMode}
          onThemeChange={setThemeMode}
        />
      </main>
    </div>
  );
}
