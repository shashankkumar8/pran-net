import { Waves, ExternalLink, ShieldAlert, CheckCircle2, FileText, Database, Compass, Wind, Layers, Activity, AlertTriangle, BookOpen, History } from 'lucide-react';
import { ViewId, ThemeMode, DataSourceStatus } from '../types';
import { LangCode, t } from '../i18n';

interface FooterProps {
  onNavigate: (view: ViewId) => void;
  currentLang: LangCode;
  dataSources: DataSourceStatus[];
  themeMode?: ThemeMode;
  onThemeChange?: (mode: ThemeMode) => void;
}

export default function Footer({
  onNavigate,
  currentLang,
  dataSources,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  // Find actual live statuses
  const cpcbStatus = dataSources.find((s) => s.id === 'cpcb_ogd')?.status || 'NEEDS CONFIGURATION';
  const firmsStatus = dataSources.find((s) => s.id === 'nasa_firms')?.status || 'NEEDS CONFIGURATION';

  return (
    <footer className="institutional-footer" aria-label="Institutional Footer">
      <div className="footer-container">
        {/* Top 4-Column Grid */}
        <div className="footer-grid">
          {/* Column A: PRAN-NET Identity */}
          <div className="footer-col col-brand">
            <div className="footer-brand-header">
              <div className="footer-logo" aria-hidden="true">
                <Waves size={20} />
              </div>
              <div>
                <b className="footer-brand-title">PRAN-NET</b>
                <span className="footer-brand-sub">Pran Operational Mitigation Network</span>
              </div>
            </div>
            <p className="footer-mission-text">
              Evidence-to-action civic environmental platform integrating real-time Copernicus CAMS atmospheric chemistry models, local meteorological screening, and human-in-the-loop mitigation workflows for municipalities, fleets, and campuses.
            </p>
            <div className="footer-motif" aria-hidden="true">
              <div className="motif-bar bar-1"></div>
              <div className="motif-bar bar-2"></div>
              <div className="motif-bar bar-3"></div>
              <div className="motif-bar bar-4"></div>
            </div>
          </div>

          {/* Column B: Explore Platform */}
          <div className="footer-col">
            <h4 className="footer-col-title">Explore Platform</h4>
            <ul className="footer-nav-list">
              <li>
                <button type="button" onClick={() => onNavigate('overview')} className="footer-link">
                  <Activity size={13} /> {t(currentLang, 'nav_overview')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('vayu')} className="footer-link">
                  <Compass size={13} /> {t(currentLang, 'nav_vayu')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('whybad')} className="footer-link">
                  <AlertTriangle size={13} /> {t(currentLang, 'nav_whybad')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('downwind')} className="footer-link">
                  <Wind size={13} /> {t(currentLang, 'nav_downwind')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('sectors')} className="footer-link">
                  <Layers size={13} /> {t(currentLang, 'nav_sectors')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column C: Transparency & Governance */}
          <div className="footer-col">
            <h4 className="footer-col-title">Transparency & Evidence</h4>
            <ul className="footer-nav-list">
              <li>
                <button type="button" onClick={() => onNavigate('sources')} className="footer-link">
                  <Database size={13} /> {t(currentLang, 'nav_sources')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('methodology')} className="footer-link">
                  <BookOpen size={13} /> {t(currentLang, 'nav_methodology')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('ledger')} className="footer-link">
                  <History size={13} /> {t(currentLang, 'nav_ledger')}
                </button>
              </li>
              <li>
                <a
                  href="https://open-meteo.com/en/docs/air-quality-api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  <FileText size={13} /> CAMS / Open-Meteo Docs <ExternalLink size={10} />
                </a>
              </li>
              <li>
                <a
                  href="https://cpcb.nic.in/National-Air-Quality-Index/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  <FileText size={13} /> CPCB National AQI Guidelines <ExternalLink size={10} />
                </a>
              </li>
            </ul>
          </div>

          {/* Column D: Live Data & Source Provenance */}
          <div className="footer-col col-status">
            <h4 className="footer-col-title">Verified Data Registry</h4>
            <div className="source-status-stack">
              <div className="source-status-row">
                <span className="source-name">Open-Meteo Air Quality</span>
                <span className="status-badge-live">
                  <CheckCircle2 size={11} /> LIVE MODEL
                </span>
              </div>
              <small className="source-caption">Copernicus CAMS European Reanalysis</small>

              <div className="source-status-row" style={{ marginTop: '8px' }}>
                <span className="source-name">Surface Weather Forecast</span>
                <span className="status-badge-live">
                  <CheckCircle2 size={11} /> LIVE
                </span>
              </div>
              <small className="source-caption">NWP Surface Dispersion Vector (10m)</small>

              <div className="source-status-row" style={{ marginTop: '8px' }}>
                <span className="source-name">CPCB Station API</span>
                <span className="status-badge-config">
                  <ShieldAlert size={11} /> {cpcbStatus}
                </span>
              </div>
              <small className="source-caption">Requires verified data.gov.in resource ID</small>

              <div className="source-status-row" style={{ marginTop: '8px' }}>
                <span className="source-name">NASA FIRMS Satellite</span>
                <span className="status-badge-config">
                  <ShieldAlert size={11} /> {firmsStatus}
                </span>
              </div>
              <small className="source-caption">Thermal anomaly MAP_KEY registration</small>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="bottom-legal-copy">
            <span>&copy; {currentYear} PRAN-NET &middot; Pran Operational Mitigation Network. All rights reserved.</span>
            <p className="bottom-disclaimer">
              <b>Decision Support Notice:</b> PRAN-NET provides indicative environmental intelligence and deterministic decision support. Modelled concentrations do not constitute statutory regulatory findings or a substitute for verified public health advisories.
            </p>
          </div>
          <div className="bottom-links">
            <button type="button" onClick={() => onNavigate('methodology')} className="bottom-link">
              Data Governance
            </button>
            <span className="bottom-dot">&middot;</span>
            <button type="button" onClick={() => onNavigate('sources')} className="bottom-link">
              Attribution
            </button>
            <span className="bottom-dot">&middot;</span>
            <span className="bottom-pill">Deterministic Rules v0.3.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
