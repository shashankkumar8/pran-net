import { useState } from 'react';
import { Layers, Truck, Building, GraduationCap, CheckCircle2, ArrowRight } from 'lucide-react';
import { ViewId } from '../types';

interface SectorsViewProps {
  onProposeAction: (proposal: { sector: string; action: string; reason: string }) => void;
  onNavigate: (view: ViewId) => void;
}

export default function SectorsView({ onProposeAction, onNavigate }: SectorsViewProps) {
  const [activeTab, setActiveTab] = useState<'municipal' | 'logistics' | 'campus'>('municipal');

  const handlePropose = (sector: string, action: string, reason: string) => {
    onProposeAction({ sector, action, reason });
    onNavigate('review');
  };

  return (
    <div className="view-container">
      <div className="panel-head" style={{ marginBottom: '14px' }}>
        <div>
          <small>CROSS-SECTOR OPERATIONAL WORKSPACES</small>
          <h2>Mitigation Workspaces by Sector</h2>
        </div>
        <label className="pill">3 Sectors Active</label>
      </div>

      {/* Sector Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
        <button
          className={`secondary ${activeTab === 'municipal' ? 'primary' : ''}`}
          onClick={() => setActiveTab('municipal')}
          style={{ flex: 1, padding: '12px' }}
        >
          <Building size={16} /> Municipal Operations
        </button>
        <button
          className={`secondary ${activeTab === 'logistics' ? 'primary' : ''}`}
          onClick={() => setActiveTab('logistics')}
          style={{ flex: 1, padding: '12px' }}
        >
          <Truck size={16} /> Gig Logistics & Fleet
        </button>
        <button
          className={`secondary ${activeTab === 'campus' ? 'primary' : ''}`}
          onClick={() => setActiveTab('campus')}
          style={{ flex: 1, padding: '12px' }}
        >
          <GraduationCap size={16} /> Campus & School
        </button>
      </div>

      {/* Municipal Sector */}
      {activeTab === 'municipal' && (
        <div className="panel">
          <div className="panel-head">
            <div>
              <small>MUNICIPAL OPERATIONS SECTOR</small>
              <h2>Ward Dust Suppression & Sweeping Protocol</h2>
            </div>
            <label className="pill">Lead: Ward Mitigation Officer</label>
          </div>
          <p className="muted">
            Targeted civil interventions focused on reducing resuspended road dust, unpaved shoulder emissions, and construction corridor fugitive particulate loads.
          </p>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Target Intervention</th>
                  <th>Operational Rationale</th>
                  <th>Expected Efficacy</th>
                  <th>Action Trigger</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Mechanical road sweeping deployment</b></td>
                  <td>Removes silt and coarse particulates along heavy transit routes</td>
                  <td>25-35% localized PM10 reduction</td>
                  <td>
                    <button
                      className="primary"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                      onClick={() => handlePropose('municipal', 'Deploy mechanical road sweeping on arterial corridor', 'PM10 elevation detected; suppress resuspended road dust.')}
                    >
                      Propose Action <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>

                <tr>
                  <td><b>Dry shoulder mist cannon spraying</b></td>
                  <td>Atomized water mist binds loose soil on unpaved medians</td>
                  <td>Short-term boundary suppression</td>
                  <td>
                    <button
                      className="primary"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                      onClick={() => handlePropose('municipal', 'Activate mist cannons along arterial shoulder', 'Immediate PM10 boundary suppression during calm wind window.')}
                    >
                      Propose Action <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>

                <tr>
                  <td><b>Construction site fugitive dust audit</b></td>
                  <td>Verify anti-dust barriers, tarpaulins, and wash pits</td>
                  <td>Prevent localized particulate spillover</td>
                  <td>
                    <button
                      className="primary"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                      onClick={() => handlePropose('municipal', 'Issue construction corridor inspection audit', 'Regional PM load high; enforce fugitive dust compliance.')}
                    >
                      Propose Action <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gig Logistics Sector */}
      {activeTab === 'logistics' && (
        <div className="panel">
          <div className="panel-head">
            <div>
              <small>GIG LOGISTICS & FLEET SAFETY</small>
              <h2>Courier & Delivery Worker Exposure Mitigation</h2>
            </div>
            <label className="pill">Lead: Fleet Safety Dispatcher</label>
          </div>
          <p className="muted">
            Operational mitigations designed to safeguard two-wheeler courier riders and outdoor delivery contractors during acute particulate pollution episodes.
          </p>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Target Intervention</th>
                  <th>Operational Rationale</th>
                  <th>Impact Scope</th>
                  <th>Action Trigger</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Outdoor courier shift duration rotation</b></td>
                  <td>Limit maximum continuous outdoor riding to 45 minutes</td>
                  <td>Reduces cumulative respiratory volume exposure</td>
                  <td>
                    <button
                      className="primary"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                      onClick={() => handlePropose('logistics', 'Cap continuous outdoor delivery shifts at 45 min', 'Severe ambient PM2.5 detected; enforce rider shift rotation.')}
                    >
                      Propose Action <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>

                <tr>
                  <td><b>Hotspot corridor route diversion</b></td>
                  <td>Re-route delivery couriers away from acute traffic bottlenecks</td>
                  <td>Avoids peak roadside NO2 and ultra-fine plumes</td>
                  <td>
                    <button
                      className="primary"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                      onClick={() => handlePropose('logistics', 'Reroute fleet couriers around high-pollution arterial bottlenecks', 'Avoid peak roadside NO2 and PM plumes during acute episode.')}
                    >
                      Propose Action <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>

                <tr>
                  <td><b>Distribution hub air shelter activation</b></td>
                  <td>Equip fulfillment hubs with HEPA air filtration & respite water</td>
                  <td>Provides clean air recovery between dispatches</td>
                  <td>
                    <button
                      className="primary"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                      onClick={() => handlePropose('logistics', 'Activate HEPA filtered rest lounges across micro-hubs', 'Ensure clean-air recovery spaces for gig workforce.')}
                    >
                      Propose Action <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campus Sector */}
      {activeTab === 'campus' && (
        <div className="panel">
          <div className="panel-head">
            <div>
              <small>CAMPUS & EDUCATIONAL SECTOR</small>
              <h2>School Activity Decision & Communication</h2>
            </div>
            <label className="pill">Lead: Environmental Coordinator</label>
          </div>
          <p className="muted">
            Evidence-backed decision support for school morning assemblies, sports curricula, indoor air purification, and transparent parental communication.
          </p>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Target Intervention</th>
                  <th>Operational Rationale</th>
                  <th>Policy Guidance</th>
                  <th>Action Trigger</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Move outdoor assembly to auditorium</b></td>
                  <td>Avoids large-group sedentary exposure during morning inversion</td>
                  <td>Mandated under Very Poor / Severe advisory</td>
                  <td>
                    <button
                      className="primary"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                      onClick={() => handlePropose('campus', 'Move morning school assembly indoors', 'Advisory recommends MOVE_INDOORS for outdoor assembly.')}
                    >
                      Propose Action <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>

                <tr>
                  <td><b>Suspend high-exertion athletic activities</b></td>
                  <td>Heavy respiration increases deep pulmonary particle deposition</td>
                  <td>Strenuous sports evaluated 1 category stricter</td>
                  <td>
                    <button
                      className="primary"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                      onClick={() => handlePropose('campus', 'Reschedule physical education and strenuous outdoor sports', 'Strenuous athletics triggers stricter exposure threshold.')}
                    >
                      Propose Action <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>

                <tr>
                  <td><b>Classroom air purifier cadence boost</b></td>
                  <td>Increase CADR to maximum during occupied school hours</td>
                  <td>Lowers indoor steady-state concentration</td>
                  <td>
                    <button
                      className="primary"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                      onClick={() => handlePropose('campus', 'Operate classroom HEPA purifiers at maximum CADR setting', 'Increase indoor air removal rate to counter outdoor infiltration.')}
                    >
                      Propose Action <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
