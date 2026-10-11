import { Sun, Moon, Monitor, Waves, RefreshCw } from 'lucide-react';
import { ThemeMode, ViewId } from '../types';

interface HeaderProps {
  currentView: ViewId;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  isLive: boolean;
  onRefresh: () => void;
  loading: boolean;
}

const VIEW_TITLES: Record<ViewId, string> = {
  overview: 'Live Operational Intelligence',
  vayu: 'Geographic Intelligence (VAYU)',
  whybad: 'Source Investigation (WhyBadAQI)',
  downwind: 'DownWind Atmospheric Context',
  sectors: 'Cross-Sector Operational Workspaces',
  review: 'Mitigation Decision Review',
  ledger: 'Auditable Action History & Ledger',
  sources: 'Evidence & Data Provider Registry',
  methodology: 'Calculation Standards & Help',
};

export default function Header({
  currentView,
  themeMode,
  onThemeChange,
  isLive,
  onRefresh,
  loading,
}: HeaderProps) {
  return (
    <header>
      <div className="brand">
        <div className="logo" aria-hidden="true">
          <Waves size={24} />
        </div>
        <div>
          <b>
            PRAN-NET <span>· Operational Network</span>
          </b>
          <small>{VIEW_TITLES[currentView]}</small>
        </div>
      </div>

      <div className="head-right">
        {/* Segmented Theme Switcher */}
        <div className="theme-switch" role="group" aria-label="Theme mode switcher">
          <button
            type="button"
            className={`theme-btn ${themeMode === 'light' ? 'active' : ''}`}
            onClick={() => onThemeChange('light')}
            title="Airglass Porcelain (Light Theme)"
            aria-pressed={themeMode === 'light'}
          >
            <Sun size={13} /> Light
          </button>
          <button
            type="button"
            className={`theme-btn ${themeMode === 'dark' ? 'active' : ''}`}
            onClick={() => onThemeChange('dark')}
            title="Obsidian Atmosphere (Dark Theme)"
            aria-pressed={themeMode === 'dark'}
          >
            <Moon size={13} /> Dark
          </button>
          <button
            type="button"
            className={`theme-btn ${themeMode === 'system' ? 'active' : ''}`}
            onClick={() => onThemeChange('system')}
            title="System Preference"
            aria-pressed={themeMode === 'system'}
          >
            <Monitor size={13} /> System
          </button>
        </div>

        {/* Status Badge */}
        {isLive ? (
          <span className="live-badge" title="Live Open-Meteo atmospheric & weather telemetry connected">
            LIVE · OPEN-METEO
          </span>
        ) : (
          <span className="demo" title="Offline verification mode with simulated fixtures">
            SIMULATED DEMO DATA
          </span>
        )}

        {/* Global Refresh Control */}
        <button
          className="refresh"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh telemetry and evidence"
          title="Refresh telemetry"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
    </header>
  );
}
