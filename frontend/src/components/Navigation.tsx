import React from 'react';
import {
  Activity,
  MapPin,
  AlertTriangle,
  Wind,
  Layers,
  CheckCircle2,
  History,
  Database,
  BookOpen,
} from 'lucide-react';
import { ViewId } from '../types';
import { LangCode, t } from '../i18n';

interface NavigationProps {
  currentView: ViewId;
  onSelectView: (view: ViewId) => void;
  pendingReviewsCount: number;
  ledgerRecordsCount: number;
  currentLang: LangCode;
}

interface NavItemConfig {
  id: ViewId;
  key: string;
  defaultLabel: string;
  icon: React.ComponentType<{ size: number }>;
}

const ITEMS: NavItemConfig[] = [
  { id: 'overview', key: 'nav_overview', defaultLabel: 'Air Quality Overview', icon: Activity },
  { id: 'vayu', key: 'nav_vayu', defaultLabel: 'Geographic Air Quality Map', icon: MapPin },
  { id: 'whybad', key: 'nav_whybad', defaultLabel: 'Pollution Source Analysis', icon: AlertTriangle },
  { id: 'downwind', key: 'nav_downwind', defaultLabel: 'Wind & Weather', icon: Wind },
  { id: 'sectors', key: 'nav_sectors', defaultLabel: 'Sector Action Plans', icon: Layers },
  { id: 'review', key: 'nav_review', defaultLabel: 'Action Review', icon: CheckCircle2 },
  { id: 'ledger', key: 'nav_ledger', defaultLabel: 'Action History', icon: History },
  { id: 'sources', key: 'nav_sources', defaultLabel: 'Data & Evidence', icon: Database },
  { id: 'methodology', key: 'nav_methodology', defaultLabel: 'Methods & Guidance', icon: BookOpen },
];

export default function Navigation({
  currentView,
  onSelectView,
  pendingReviewsCount,
  ledgerRecordsCount,
  currentLang,
}: NavigationProps) {
  return (
    <nav aria-label="Main application navigation" className="nav-bar">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const isSelected = currentView === item.id;
        const label = t(currentLang, item.key) || item.defaultLabel;

        return (
          <button
            key={item.id}
            type="button"
            className={isSelected ? 'selected' : ''}
            onClick={() => onSelectView(item.id)}
            aria-current={isSelected ? 'page' : undefined}
          >
            <Icon size={15} />
            <span>{label}</span>
            {item.id === 'review' && pendingReviewsCount > 0 && (
              <span className="count warning-count" title={`${pendingReviewsCount} pending decision proposals`}>
                {pendingReviewsCount}
              </span>
            )}
            {item.id === 'ledger' && ledgerRecordsCount > 0 && (
              <span className="count" title={`${ledgerRecordsCount} records stored in persistent ledger`}>
                {ledgerRecordsCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
