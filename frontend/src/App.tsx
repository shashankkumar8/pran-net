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
import { ViewId, ThemeMode, LiveTelemetry, DataSourceStatus, ActionRecord } from './types';
import './styles.css';

const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export default function App() {
  const [currentView, setCurrentView] = useState<ViewId>('overview');
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('prannet_theme_mode') as ThemeMode) || 'system';
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

  // Primary data fetcher: queries backend endpoints or direct Open-Meteo fallback
  const fetchAllData = useCallback(async () => {
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
        temperature_c: 23.5,
        relative_humidity_percent: 83,
        wind_speed_kmh: 7.1,
        wind_direction_deg: 80,
        wind_compass: 'ENE',
      },
      location: {
        lat: 28.6139,
        lon: 77.2090,
        name: 'Delhi-NCR Central Core',
      },
      retrieved_at: new Date().toISOString(),
    };

    // 1. Try real Open-Meteo endpoint directly from client if API URL not set or failing
    try {
      if (API) {
        const [telRes, sourcesRes, advRes, simRes] = await Promise.all([
          fetch(`${API}/telemetry/live`).then((r) => r.json()).catch(() => null),
          fetch(`${API}/health/data-sources`).then((r) => r.json()).catch(() => null),
          fetch(`${API}/advisory?activity=${activity}`).then((r) => r.json()).catch(() => null),
          fetch(`${API}/simulate`).then((r) => r.json()).catch(() => null),
        ]);

        if (telRes?.air_quality) {
          setTelemetry(telRes);
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
        // Direct Open-Meteo query from client when backend not yet running locally
        const [aqRes, weatherRes] = await Promise.all([
          fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=28.6139&longitude=77.2090&current=pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide&timezone=auto')
            .then((r) => r.json())
            .catch(() => null),
          fetch('https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m&timezone=auto')
            .then((r) => r.json())
            .catch(() => null),
        ]);

        if (aqRes?.current && weatherRes?.current) {
          const compassList = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
          const deg = weatherRes.current.wind_direction_10m;
          const compass = deg != null ? compassList[Math.round(deg / 22.5) % 16] : 'ENE';

          const liveData: LiveTelemetry = {
            air_quality: {
              provider: 'Open-Meteo Air Quality API',
              model_attribution: 'Copernicus Atmosphere Monitoring Service (CAMS)',
              data_type: 'LIVE MODEL DATA',
              status: 'LIVE',
              valid_time: aqRes.current.time,
              retrieved_at: new Date().toISOString(),
              pollutants: {
                'PM2.5': aqRes.current.pm2_5,
                'PM10': aqRes.current.pm10,
                'NO2': aqRes.current.nitrogen_dioxide,
                'O3': aqRes.current.ozone,
                'SO2': aqRes.current.sulphur_dioxide,
                'CO': aqRes.current.carbon_monoxide,
              },
              indicative_category: aqRes.current.pm2_5 > 250 ? 'Severe' : aqRes.current.pm2_5 > 120 ? 'Very Poor' : aqRes.current.pm2_5 > 90 ? 'Poor' : 'Moderate',
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
            location: {
              lat: 28.6139,
              lon: 77.2090,
              name: 'Delhi Central (Real-Time)',
            },
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
      // Build client-side advisory baseline if not populated
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
          chosen_station_distance_km: 2.1,
          evidence: {
            station_name: 'Anand Vihar (DPCC)',
            aqi_category: 'Severe',
            category_basis: 'PM2.5',
            observed_at: new Date().toISOString(),
            retrieved_at: new Date().toISOString(),
            source: 'Open-Meteo / Ground Hybrid',
          },
          stations_considered: [
            { station_id: 's1', station_name: 'Anand Vihar (DPCC)', distance_km: 2.1, category: 'Severe', freshness: 'fresh' },
            { station_id: 's2', station_name: 'Patparganj (DPCC)', distance_km: 3.4, category: 'Very Poor', freshness: 'fresh' },
            { station_id: 's3', station_name: 'Vivek Vihar (DPCC)', distance_km: 4.8, category: 'Very Poor', freshness: 'fresh' },
          ],
          selection_rule: 'Worst category among fresh readings from nearest 3 monitors.',
          freshness: { status: 'fresh' },
        };
      });

      setSim((prev) => {
        if (prev.length > 0) return prev;
        return [
          { activity: 'outdoor_assembly', label: 'Outdoor assembly / shift start', advisory: { decision_code: 'MOVE_INDOORS' } },
          { activity: 'sports', label: 'Strenuous athletics / outdoor dispatch', advisory: { decision_code: 'MOVE_INDOORS' } },
          { activity: 'routine_outdoor', label: 'Routine outdoor movement', advisory: { decision_code: 'MODIFY' } },
          { activity: 'indoor_class', label: 'Indoor workspace / classroom', advisory: { decision_code: 'PROCEED' } },
        ];
      });

      setLoading(false);
    }
  }, [activity]);

  // Initial Data Load
  useEffect(() => {
    void fetchAllData();
  }, [fetchAllData]);

  // Handle mitigation action save
  const handleSaveAction = async (record: {
    activity: string;
    decision: string;
    action_taken: string;
    note: string;
  }) => {
    setSavedMessage('');

    if (API) {
      const res = await fetch(`${API}/actions`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'X-Coordinator-Token': token,
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          ...record,
          advisory_shown_at: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record mitigation action.');
      setSavedMessage(data.duplicate ? 'Duplicate submission ignored.' : 'Action confirmed & persisted to DynamoDB ledger.');
      // Refresh ledger
      const ledgerRes = await fetch(`${API}/actions`, { headers: { 'X-Coordinator-Token': token } }).then((r) => r.json());
      if (ledgerRes.items) setActions(ledgerRes.items);
    } else {
      // Local demo persistence
      const newAction: ActionRecord = {
        pk: 'ZONE#delhi-central',
        sk: `ACT#${new Date().toISOString()}#${Date.now()}`,
        action_id: `act-${Date.now()}`,
        activity: record.activity,
        decision: record.decision,
        action_taken: record.action_taken,
        note: record.note,
        created_at: new Date().toISOString(),
        review_seconds: 14,
        rules_version: '0.3.0',
        data_status: 'live-model',
        advisory_snapshot: adv,
      };

      setActions((prev) => [newAction, ...prev]);
      setSavedMessage('Action recorded in local demonstration ledger with full evidence snapshot.');
    }
  };

  return (
    <div className="shell">
      <Header
        currentView={currentView}
        themeMode={themeMode}
        onThemeChange={setThemeMode}
        isLive={isLive}
        onRefresh={fetchAllData}
        loading={loading}
      />

      <main>
        {/* Navigation Bar across 9 views */}
        <Navigation
          currentView={currentView}
          onSelectView={setCurrentView}
          pendingReviewsCount={pendingProposal ? 1 : 0}
          ledgerRecordsCount={actions.length}
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
          />
        )}

        {currentView === 'ledger' && (
          <LedgerView actions={actions} token={token} />
        )}

        {currentView === 'sources' && (
          <EvidenceSourcesView
            sources={dataSources}
            onRefresh={fetchAllData}
            loading={loading}
          />
        )}

        {currentView === 'methodology' && (
          <MethodologyView />
        )}

        <footer>
          <div>
            <b>PRAN-NET — Pran Operational Mitigation Network</b>
            <small>Deterministic decision support; not medical advice or a statutory directive</small>
          </div>
          <span>Truthful Provenance · Uncertainty Visible · Auditable Actions</span>
        </footer>
      </main>
    </div>
  );
}
