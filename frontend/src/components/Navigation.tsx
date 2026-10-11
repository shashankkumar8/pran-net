import {
  Activity,
  Compass,
  AlertTriangle,
  Wind,
  Layers,
  CheckCircle2,
  History,
  Database,
  BookOpen,
} from 'lucide-react';
import { ViewId } from '../types';

interface NavigationProps {
  currentView: ViewId;
  onSelectView: (view: ViewId) => void;
  pendingReviewsCount: number;
  ledgerRecordsCount: number;
}

const ITEMS: Array<{ id: ViewId; label: string; icon: React.ComponentType<{ size: number }> }> = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'vayu', label: 'Geographic (VAYU)', icon: Compass },
  { id: 'whybad', label: 'WhyBadAQI', icon: AlertTriangle },
  { id: 'downwind', label: 'DownWind', icon: Wind },
  { id: 'sectors', label: 'Sectors', icon: Layers },
  { id: 'review', label: 'Mitigation Review', icon: CheckCircle2 },
  { id: 'ledger', label: 'Action Ledger', icon: History },
  { id: 'sources', label: 'Data Sources', icon: Database },
  { id: 'methodology', label: 'Methodology', icon: BookOpen },
];

export default function Navigation({
  currentView,
  onSelectView,
  pendingReviewsCount,
  ledgerRecordsCount,
}: NavigationProps) {
  return (
    <nav aria-label="Main application navigation" className="nav-bar">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const isSelected = currentView === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className={isSelected ? 'selected' : ''}
            onClick={() => onSelectView(item.id)}
            aria-current={isSelected ? 'page' : undefined}
          >
            <Icon size={15} />
            <span>{item.label}</span>
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
