import { Sun, Moon, Monitor, Waves, RefreshCw, Languages } from 'lucide-react';
import { ThemeMode, ViewId } from '../types';
import { LangCode, LANGUAGES, t } from '../i18n';

interface HeaderProps {
  currentView: ViewId;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  currentLang: LangCode;
  onLangChange: (lang: LangCode) => void;
  isLive: boolean;
  onRefresh: () => void;
  loading: boolean;
}

export default function Header({
  currentView,
  themeMode,
  onThemeChange,
  currentLang,
  onLangChange,
  isLive,
  onRefresh,
  loading,
}: HeaderProps) {
  const viewTitle = t(currentLang, `nav_${currentView}`);

  return (
    <header className="header-container">
      <div className="brand">
        <div className="logo" aria-hidden="true">
          <Waves size={24} />
        </div>
        <div>
          <b>
            {t(currentLang, 'app_name')}{' '}
            <span>· {t(currentLang, 'app_tagline')}</span>
          </b>
          <small>{viewTitle}</small>
        </div>
      </div>

      <div className="head-right">
        {/* Multilingual Selector */}
        <div className="lang-picker-wrapper" title="Select regional language">
          <Languages size={14} className="lang-icon" aria-hidden="true" />
          <select
            id="prannet-lang-select"
            className="lang-select"
            value={currentLang}
            onChange={(e) => onLangChange(e.target.value as LangCode)}
            aria-label="Language selector"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeName} ({l.englishName})
              </option>
            ))}
          </select>
        </div>

        {/* Segmented Theme Switcher */}
        <div className="theme-switch" role="group" aria-label="Theme mode switcher">
          <button
            type="button"
            className={`theme-btn ${themeMode === 'light' ? 'active' : ''}`}
            onClick={() => onThemeChange('light')}
            title="Airglass Porcelain (Light Theme)"
            aria-pressed={themeMode === 'light'}
          >
            <Sun size={13} /> {t(currentLang, 'theme_light')}
          </button>
          <button
            type="button"
            className={`theme-btn ${themeMode === 'dark' ? 'active' : ''}`}
            onClick={() => onThemeChange('dark')}
            title="Obsidian Atmosphere (Dark Theme)"
            aria-pressed={themeMode === 'dark'}
          >
            <Moon size={13} /> {t(currentLang, 'theme_dark')}
          </button>
          <button
            type="button"
            className={`theme-btn ${themeMode === 'system' ? 'active' : ''}`}
            onClick={() => onThemeChange('system')}
            title="System Preference"
            aria-pressed={themeMode === 'system'}
          >
            <Monitor size={13} /> {t(currentLang, 'theme_system')}
          </button>
        </div>

        {/* Status Badge */}
        {isLive ? (
          <span className="live-badge" title="Live atmospheric and weather telemetry connected">
            {t(currentLang, 'live_model_badge')}
          </span>
        ) : (
          <span className="demo" title="Verification mode with simulated fixtures">
            {t(currentLang, 'simulated_badge')}
          </span>
        )}

        {/* Global Refresh Control */}
        <button
          className="refresh"
          onClick={onRefresh}
          disabled={loading}
          aria-label={t(currentLang, 'refresh_telemetry')}
          title={t(currentLang, 'refresh_telemetry')}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
    </header>
  );
}
