import { useState } from 'react';
import {
  Layers,
  Truck,
  Building,
  GraduationCap,
  Wheat,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Send,
  Calculator,
  MessageSquare,
  ShieldAlert,
  Camera,
  MapPin,
  Clock,
  Info,
} from 'lucide-react';
import { ViewId, LiveTelemetry, LocationCoordinates } from '../types';

interface SectorsViewProps {
  onProposeAction: (proposal: { sector: string; action: string; reason: string }) => void;
  onNavigate: (view: ViewId) => void;
  telemetry?: LiveTelemetry | null;
  selectedLocation?: LocationCoordinates;
}

export default function SectorsView({
  onProposeAction,
  onNavigate,
  telemetry,
  selectedLocation,
}: SectorsViewProps) {
  const [activeTab, setActiveTab] = useState<'municipal' | 'logistics' | 'campus' | 'agriculture'>('municipal');

  // Municipal Incident Reporting Form States
  const [reportCategory, setReportCategory] = useState('road_dust');
  const [reportLocation, setReportLocation] = useState(selectedLocation?.name || 'Ward 14 Arterial Corridor');
  const [reportDesc, setReportDesc] = useState('');
  const [reportHasPhoto, setReportHasPhoto] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Inhaled Dose Explorer States (Problem B)
  const [doseTravelMode, setDoseTravelMode] = useState<'sedentary' | 'walking' | 'cycling'>('cycling');
  const [doseDistanceKm, setDoseDistanceKm] = useState(8.5);
  const [doseDurationMin, setDoseDurationMin] = useState(35);
  const [customAmbientPm, setCustomAmbientPm] = useState(telemetry?.air_quality?.pollutants?.['PM2.5'] || 69.2);

  // Parent Notification Drafter States (Problem E)
  const [schoolGrade, setSchoolGrade] = useState('primary');
  const [actionPlanned, setActionPlanned] = useState('Move outdoor morning assembly into auditorium & cancel strenuous athletics');
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Agricultural Service Request States (Problem C)
  const [farmerTehsil, setFarmerTehsil] = useState('Ludhiana West / Malwa Belt');
  const [cropAcreage, setCropAcreage] = useState('12');
  const [machineryNeeded, setMachineryNeeded] = useState('Happy Seeder + In-situ Mulcher');
  const [sowingDeadlineDays, setSowingDeadlineDays] = useState('6');
  const [agriSuccess, setAgriSuccess] = useState(false);

  const pm25Val = telemetry?.air_quality?.pollutants?.['PM2.5'] || 69.2;
  const pm10Val = telemetry?.air_quality?.pollutants?.['PM10'] || 143.0;

  const handlePropose = (sector: string, action: string, reason: string) => {
    onProposeAction({ sector, action, reason });
    onNavigate('review');
  };

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSuccess(true);
    setTimeout(() => {
      onProposeAction({
        sector: 'municipal',
        action: `Civil Inspection: ${reportCategory.replace('_', ' ').toUpperCase()} at ${reportLocation}`,
        reason: `Citizen / Field Report: ${reportDesc || 'Visual emission plume documented; dispatch verification unit.'}`,
      });
      onNavigate('review');
    }, 900);
  };

  const handleAgriSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAgriSuccess(true);
    setTimeout(() => {
      onProposeAction({
        sector: 'agriculture',
        action: `Residue Machinery Dispatch: ${machineryNeeded} for ${cropAcreage} acres (${farmerTehsil})`,
        reason: `Farmer Service Booking: Pre-sowing window (${sowingDeadlineDays} days remaining); non-punitive ex-situ collection coordination.`,
      });
      onNavigate('review');
    }, 900);
  };

  // Inhaled Dose Math: Inhaled Mass = Concentration (µg/m³) * Breathing Rate (m³/h) * Duration (h)
  const breathingRates: Record<string, number> = {
    sedentary: 0.5, // 0.5 m³/h (car, bus commute)
    walking: 1.2,   // 1.2 m³/h (pedestrian)
    cycling: 2.1,   // 2.1 m³/h (delivery rider, cyclist)
  };
  const activeBr = breathingRates[doseTravelMode];
  const durationHours = doseDurationMin / 60;
  const inhaledMassMicrograms = Math.round(customAmbientPm * activeBr * durationHours * 10) / 10;

  return (
    <div className="view-container">
      {/* 1. SECTOR HEADER */}
      <div className="panel-head" style={{ marginBottom: '14px' }}>
        <div>
          <small style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>OPERATIONAL WORKSPACES</small>
          <h2>Sector Action Plans & Incident Routing</h2>
        </div>
        <label className="pill">4 Sectors Active · Evidence Linked</label>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '8px',
          marginBottom: '18px',
        }}
      >
        <button
          className={`secondary ${activeTab === 'municipal' ? 'primary' : ''}`}
          onClick={() => setActiveTab('municipal')}
          style={{ padding: '12px' }}
        >
          <Building size={16} /> Municipal & Civil Operations
        </button>
        <button
          className={`secondary ${activeTab === 'logistics' ? 'primary' : ''}`}
          onClick={() => setActiveTab('logistics')}
          style={{ padding: '12px' }}
        >
          <Truck size={16} /> Gig Logistics & Worker Exposure
        </button>
        <button
          className={`secondary ${activeTab === 'campus' ? 'primary' : ''}`}
          onClick={() => setActiveTab('campus')}
          style={{ padding: '12px' }}
        >
          <GraduationCap size={16} /> Campus, School & Indoor Air
        </button>
        <button
          className={`secondary ${activeTab === 'agriculture' ? 'primary' : ''}`}
          onClick={() => setActiveTab('agriculture')}
          style={{ padding: '12px' }}
        >
          <Wheat size={16} /> Agriculture & Residue Logistics
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: MUNICIPAL OPERATIONS & CITIZEN REPORTING */}
      {/* ============================================================== */}
      {activeTab === 'municipal' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Municipal Playbook */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <small style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>CIVIL ACTION PLAYBOOK</small>
                <h3>Ward Dust Suppression & Sweeping Protocol</h3>
              </div>
              <label className="pill">Lead: Ward Mitigation Officer</label>
            </div>
            <p className="muted" style={{ fontSize: '13px' }}>
              Targeted civil interventions focused on reducing resuspended road dust, unpaved shoulder emissions, and construction corridor fugitive particulate loads without disruptive municipal gridlock.
            </p>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Target Intervention</th>
                    <th>Operational Rationale</th>
                    <th>Expected Efficacy</th>
                    <th>Action Dispatch</th>
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
                        onClick={() =>
                          handlePropose(
                            'municipal',
                            'Deploy mechanical road sweeping on arterial corridor',
                            `PM10 elevation detected (${pm10Val} µg/m³); suppress resuspended crustal road dust.`
                          )
                        }
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
                        onClick={() =>
                          handlePropose(
                            'municipal',
                            'Activate mist cannons along arterial shoulder',
                            'Immediate PM10 boundary suppression during calm surface wind window.'
                          )
                        }
                      >
                        Propose Action <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td><b>Construction site fugitive dust audit</b></td>
                    <td>Verify anti-dust barriers, green mesh tarpaulins, and wheel wash pits</td>
                    <td>Prevents localized particulate spillover</td>
                    <td>
                      <button
                        className="primary"
                        style={{ padding: '6px 12px', fontSize: '11px' }}
                        onClick={() =>
                          handlePropose(
                            'municipal',
                            'Issue construction corridor inspection audit',
                            'Elevated localized coarse load; enforce fugitive dust compliance under Graded Action.'
                          )
                        }
                      >
                        Propose Action <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Citizen & Field Geotagged Incident Reporting Form (Problems G & I) */}
          <div className="panel" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
            <div className="panel-head">
              <div>
                <small style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>PROBLEMS G & I · EVIDENCE INTAKE</small>
                <h3>Geotagged Dust & Waste Burning Incident Reporter</h3>
              </div>
              <span className="pill">Direct Link to Action Review</span>
            </div>
            <p className="muted" style={{ fontSize: '12px', lineHeight: 1.6 }}>
              Residents, sanitary inspectors, and civil marshals can submit geotagged reports of unpaved road dust, construction barrier breaches, or suspected open municipal waste combustion. Reports are deduplicated and routed directly to the authorized review queue.
            </p>

            {reportSuccess ? (
              <div className="notice" role="status">
                <CheckCircle2 size={16} /> Incident registered and routed to Human Review queue. Redirecting…
              </div>
            ) : (
              <form onSubmit={handleIncidentSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <label>
                    Incident Category
                    <select value={reportCategory} onChange={(e) => setReportCategory(e.target.value)}>
                      <option value="road_dust">Resuspended Road Dust / Unpaved Shoulder</option>
                      <option value="construction_dust">Construction Site Fugitive Dust Spillover</option>
                      <option value="open_waste_burning">Open Municipal Solid Waste Combustion</option>
                      <option value="biomass_smoke">Localized Garden / Biomass Smoke Plume</option>
                    </select>
                  </label>

                  <label>
                    Location / Landmark
                    <input
                      type="text"
                      value={reportLocation}
                      onChange={(e) => setReportLocation(e.target.value)}
                      required
                      placeholder="e.g. Ring Road Junction, Ward 14"
                    />
                  </label>
                </div>

                <label style={{ marginTop: '10px' }}>
                  Observations & Context Description
                  <textarea
                    rows={2}
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    required
                    placeholder="Describe visible dust clouds, heavy truck passage, unshielded excavation, or waste pile smoke…"
                  />
                </label>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={reportHasPhoto}
                      onChange={(e) => setReportHasPhoto(e.target.checked)}
                    />
                    <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Camera size={14} /> Attach Photographic Evidence Stub (Geotagged & Timestamped)
                    </span>
                  </label>

                  <button className="primary" type="submit" style={{ padding: '8px 16px', fontSize: '12px' }}>
                    <Send size={14} /> Submit & Route to Action Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: GIG LOGISTICS & PERSONAL EXPOSURE EXPLORER */}
      {/* ============================================================== */}
      {activeTab === 'logistics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Gig Workforce Playbook */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <small style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>GIG LOGISTICS & FLEET SAFETY</small>
                <h3>Courier & Delivery Worker Exposure Mitigation</h3>
              </div>
              <label className="pill">Lead: Fleet Safety Dispatcher</label>
            </div>
            <p className="muted" style={{ fontSize: '13px' }}>
              Operational mitigations designed to safeguard two-wheeler courier riders and outdoor delivery contractors during acute particulate pollution episodes.
            </p>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Target Intervention</th>
                    <th>Operational Rationale</th>
                    <th>Impact Scope</th>
                    <th>Action Dispatch</th>
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
                        onClick={() =>
                          handlePropose(
                            'logistics',
                            'Cap continuous outdoor delivery shifts at 45 min',
                            `Severe ambient PM2.5 detected (${pm25Val} µg/m³); enforce rider shift rotation.`
                          )
                        }
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
                        onClick={() =>
                          handlePropose(
                            'logistics',
                            'Reroute fleet couriers around high-pollution arterial bottlenecks',
                            'Avoid peak roadside NO2 and PM plumes during acute episode.'
                          )
                        }
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
                        onClick={() =>
                          handlePropose(
                            'logistics',
                            'Activate HEPA filtered rest lounges across micro-hubs',
                            'Ensure clean-air recovery spaces for gig workforce.'
                          )
                        }
                      >
                        Propose Action <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Personal Inhaled Dose Exposure Explorer (Problem B) */}
          <div className="panel" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
            <div className="panel-head">
              <div>
                <small style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>PROBLEM B · PHYSIOLOGICAL EXPOSURE MODEL</small>
                <h3>Personal Inhaled Particulate Dose Explorer</h3>
              </div>
              <label className="pill">Mass = Concentration × Breathing Rate × Duration</label>
            </div>
            <p className="muted" style={{ fontSize: '12px', lineHeight: 1.6 }}>
              Concentration alone does not equal inhaled dose. Inhaled particulate mass depends directly on physical exertion, mode of transit, route duration, and ambient concentration along the transit corridor.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginTop: '10px',
              }}
            >
              <label>
                Activity / Travel Mode
                <select
                  value={doseTravelMode}
                  onChange={(e) => setDoseTravelMode(e.target.value as any)}
                >
                  <option value="sedentary">Enclosed Car / AC Metro (BR: 0.5 m³/h)</option>
                  <option value="walking">Pedestrian Commute (BR: 1.2 m³/h)</option>
                  <option value="cycling">Two-Wheeler / Courier Cycling (BR: 2.1 m³/h)</option>
                </select>
              </label>

              <label>
                Route Distance (km)
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="50"
                  value={doseDistanceKm}
                  onChange={(e) => setDoseDistanceKm(parseFloat(e.target.value) || 5)}
                />
              </label>

              <label>
                Transit Duration (minutes)
                <input
                  type="number"
                  step="5"
                  min="5"
                  max="180"
                  value={doseDurationMin}
                  onChange={(e) => setDoseDurationMin(parseFloat(e.target.value) || 30)}
                />
              </label>

              <label>
                Ambient PM2.5 (µg/m³)
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="999"
                  value={customAmbientPm}
                  onChange={(e) => setCustomAmbientPm(parseFloat(e.target.value) || 50)}
                />
              </label>
            </div>

            {/* Inhaled Dose Output Card */}
            <div
              style={{
                marginTop: '14px',
                padding: '14px 18px',
                borderRadius: '8px',
                background: 'var(--bg-surface-1)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <small style={{ color: 'var(--text-muted)' }}>ESTIMATED INHALED PARTICULATE MASS</small>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    {inhaledMassMicrograms}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    µg of PM₂.₅ inhaled
                  </span>
                </div>
                <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                  Calculation: {customAmbientPm} µg/m³ × {activeBr} m³/h × {durationHours.toFixed(2)} h = {inhaledMassMicrograms} µg
                </small>
              </div>

              <div style={{ textAlign: 'right' }}>
                <button
                  className="secondary"
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                  onClick={() =>
                    handlePropose(
                      'logistics',
                      `Enforce Rider Shift Cap: ${inhaledMassMicrograms} µg Inhaled Dose Threshold Reached`,
                      `High exertion courier travel (${activeBr} m³/h) under ${customAmbientPm} µg/m³ PM2.5.`
                    )
                  }
                >
                  Propose Shift Respite in Review <ArrowRight size={12} />
                </button>
              </div>
            </div>

            <p className="footnote" style={{ marginTop: '10px' }}>
              <strong>Scientific Honesty:</strong> This model estimates inhaled particulate mass using established physiological ventilation rates. It does not fabricate arbitrary % health risk reductions or guarantee medical outcomes.
            </p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CAMPUS, SCHOOLS & INDOOR AIR */}
      {/* ============================================================== */}
      {activeTab === 'campus' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* School Safety Playbook */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <small style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>CAMPUS & EDUCATIONAL SECTOR</small>
                <h3>School Activity Decision & Mitigation</h3>
              </div>
              <label className="pill">Lead: Environmental Safety Coordinator</label>
            </div>
            <p className="muted" style={{ fontSize: '13px' }}>
              Evidence-backed decision support for school morning assemblies, sports curricula, indoor air purification, and transparent parental communication without arbitrary emergency closures.
            </p>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Target Intervention</th>
                    <th>Operational Rationale</th>
                    <th>Policy Guidance</th>
                    <th>Action Dispatch</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>Move outdoor assembly to auditorium</b></td>
                    <td>Avoids large-group sedentary exposure during morning thermal inversion</td>
                    <td>Mandated under Very Poor / Severe advisory</td>
                    <td>
                      <button
                        className="primary"
                        style={{ padding: '6px 12px', fontSize: '11px' }}
                        onClick={() =>
                          handlePropose(
                            'campus',
                            'Move morning school assembly indoors',
                            `Advisory recommends MOVE_INDOORS for outdoor assembly (PM2.5: ${pm25Val} µg/m³).`
                          )
                        }
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
                        onClick={() =>
                          handlePropose(
                            'campus',
                            'Reschedule physical education and strenuous outdoor sports',
                            'Strenuous athletics triggers stricter exposure threshold.'
                          )
                        }
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
                        onClick={() =>
                          handlePropose(
                            'campus',
                            'Operate classroom HEPA purifiers at maximum CADR setting',
                            'Increase indoor air removal rate to counter outdoor infiltration.'
                          )
                        }
                      >
                        Propose Action <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Parent & Staff Advisory Notification Drafter (Problem E) */}
          <div className="panel" style={{ borderLeft: '4px solid var(--accent-amber)' }}>
            <div className="panel-head">
              <div>
                <small style={{ color: 'var(--accent-amber)', fontWeight: 800 }}>PROBLEM E · TRANSPARENT ENGAGEMENT</small>
                <h3>Parent & Staff Advisory Notification Drafter</h3>
              </div>
              <span className="pill">Bilingual · Non-Alarmist</span>
            </div>
            <p className="muted" style={{ fontSize: '12px' }}>
              Generate clear, non-alarmist communication broadcasts for parents and teachers based on verified local environmental evidence.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginTop: '10px' }}>
              <label>
                Target Cohort
                <select value={schoolGrade} onChange={(e) => setSchoolGrade(e.target.value)}>
                  <option value="primary">Early Childhood & Primary (Nursery – Grade 5)</option>
                  <option value="middle">Middle School (Grades 6 – 8)</option>
                  <option value="high">Senior Secondary (Grades 9 – 12)</option>
                </select>
              </label>

              <label>
                Planned Campus Action
                <input
                  type="text"
                  value={actionPlanned}
                  onChange={(e) => setActionPlanned(e.target.value)}
                  placeholder="e.g. Relocate morning assembly indoors and operate HEPA purifiers"
                />
              </label>
            </div>

            {/* Generated Broadcast Card */}
            <div
              style={{
                marginTop: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'var(--bg-surface-1)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <b style={{ fontSize: '12px', color: 'var(--text-primary)' }}>Notice Draft (SMS / WhatsApp Ready)</b>
                <button
                  type="button"
                  className="secondary"
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      `[School Air Advisory] Dear Parents, today's local ambient PM2.5 in our school zone is ${pm25Val} µg/m³. In line with our Environmental Safety Protocol, we have enacted: ${actionPlanned}. Classrooms remain ventilated with HEPA filtration. Students with respiratory sensitivities are monitored closely.`
                    );
                    setCopiedDraft(true);
                    setTimeout(() => setCopiedDraft(false), 2000);
                  }}
                >
                  <MessageSquare size={12} /> {copiedDraft ? 'Copied to Clipboard!' : 'Copy Notice Text'}
                </button>
              </div>

              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                "[School Air Advisory] Dear Parents, today's local ambient PM2.5 in our school zone is {pm25Val} µg/m³. In line with our Environmental Safety Protocol, we have enacted: <strong>{actionPlanned}</strong>. Classrooms remain protected with active HEPA air filtration. Students with respiratory sensitivities are accommodated indoors. Thank you for your cooperation."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: AGRICULTURE & CROP RESIDUE LOGISTICS */}
      {/* ============================================================== */}
      {activeTab === 'agriculture' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Agriculture Playbook */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <small style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>PROBLEM C · SUPPORTIVE LOGISTICS</small>
                <h3>Crop Residue Management & Machinery Coordination</h3>
              </div>
              <label className="pill">Non-Punitive Assistance Model</label>
            </div>
            <p className="muted" style={{ fontSize: '13px' }}>
              Farmers face intense 10-14 day harvest-to-wheat-sowing windows. Detection alone does not solve crop burning. PRAN-NET connects farmers and custom hiring centres with in-situ Happy Seeders, balers, and biomass collection logistics.
            </p>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Equipment / Service</th>
                    <th>Function & Technology</th>
                    <th>Operational Window</th>
                    <th>Custom Hiring Center Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>Happy Seeder + Super SMS Combine</b></td>
                    <td>Direct wheat sowing through standing paddy stubble without burning</td>
                    <td>Immediate post-harvest (48h)</td>
                    <td>
                      <span className="pill" style={{ color: 'var(--accent-emerald)' }}>14 Units Active (Malwa)</span>
                    </td>
                  </tr>

                  <tr>
                    <td><b>Round / Square Straw Baler</b></td>
                    <td>Compacts paddy straw into dense bales for bio-pellet plants & thermal units</td>
                    <td>Ex-situ collection (3-5 days)</td>
                    <td>
                      <span className="pill" style={{ color: 'var(--accent-cyan)' }}>8 Units Available</span>
                    </td>
                  </tr>

                  <tr>
                    <td><b>Paddy Straw In-situ Mulcher & Reversible MB Plough</b></td>
                    <td>Shreds and incorporates residue directly into soil organic matter</td>
                    <td>Land preparation (2-4 days)</td>
                    <td>
                      <span className="pill" style={{ color: 'var(--accent-amber)' }}>6 Units Assigned</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Farmer Service Request Booking Form */}
          <div className="panel" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
            <div className="panel-head">
              <div>
                <small style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>EX-SITU / IN-SITU LOGISTICS BOOKING</small>
                <h3>Farmer Residue Management Dispatch Request</h3>
              </div>
              <span className="pill">Supportive · Non-Coercive</span>
            </div>

            {agriSuccess ? (
              <div className="notice" role="status">
                <CheckCircle2 size={16} /> Residue service request logged and routed to Action Review queue. Redirecting…
              </div>
            ) : (
              <form onSubmit={handleAgriSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <label>
                    Tehsil / District Operational Zone
                    <input
                      type="text"
                      value={farmerTehsil}
                      onChange={(e) => setFarmerTehsil(e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Farmland Acreage (Acres)
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={cropAcreage}
                      onChange={(e) => setCropAcreage(e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Machinery Service Requested
                    <select value={machineryNeeded} onChange={(e) => setMachineryNeeded(e.target.value)}>
                      <option value="Happy Seeder + In-situ Mulcher">Happy Seeder + In-situ Mulcher</option>
                      <option value="Ex-situ Straw Baler & Pellet Transport">Ex-situ Straw Baler & Pellet Transport</option>
                      <option value="Super SMS Fitted Harvester">Super SMS Fitted Harvester</option>
                    </select>
                  </label>

                  <label>
                    Sowing Window Remaining (Days)
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={sowingDeadlineDays}
                      onChange={(e) => setSowingDeadlineDays(e.target.value)}
                      required
                    />
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                  <small style={{ color: 'var(--text-muted)' }}>
                    <strong>Scientific Principle:</strong> Satellite thermal anomalies do NOT prove intentional burning. PRAN-NET facilitates logistical alternatives to enable clean residue management.
                  </small>

                  <button className="primary" type="submit" style={{ padding: '8px 16px', fontSize: '12px' }}>
                    <Wheat size={14} /> Book Machinery & Dispatch to Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
