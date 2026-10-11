# PRAN-NET Scientific Methodology & Governance Framework
**Pran Operational Mitigation Network**
*Version: 0.3.0*

---

## 1. Indicative NAQI Breakpoint Derivation
Official India National Air Quality Index (NAQI) guidelines from the Central Pollution Control Board (CPCB) dictate 24-hour average concentrations for PM2.5 and PM10 sub-indices. In operational environments, waiting for 24-hour averages delays acute mitigation responses.

PRAN-NET computes an **indicative sub-index category** by mapping the latest hourly concentration against authoritative CPCB breakpoint intervals:

| Category | PM₂.₅ Breakpoint (µg/m³) | PM₁₀ Breakpoint (µg/m³) | CPCB Health Impact Descriptor |
|---|---|---|---|
| **Good** | 0 – 30 | 0 – 50 | Minimal impact |
| **Satisfactory** | 31 – 60 | 51 – 100 | Minor breathing discomfort to sensitive people |
| **Moderate** | 61 – 90 | 101 – 250 | Breathing discomfort to people with asthma and heart disease |
| **Poor** | 91 – 120 | 251 – 350 | Breathing discomfort to most people on prolonged exposure |
| **Very Poor** | 121 – 250 | 351 – 430 | Respiratory illness on prolonged exposure |
| **Severe** | > 250 | > 430 | Serious impacts on healthy and vulnerable populations |

*Rule:* The worst pollutant sub-index determines the composite station category (`max(PM2.5_rank, PM10_rank)`).

---

## 2. Multi-Station Spatial Conservative Selection
To protect populations from localized hot-spots that could be obscured by spatial averaging, PRAN-NET implements a conservative nearest-$k$ rule ($k=3$):
1. **Haversine Distance:** Computes Great-Circle distance between the operational zone coordinates $(\phi_1, \lambda_1)$ and each reporting monitor $(\phi_2, \lambda_2)$:
   $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
2. **Freshness Filter:** Only monitors with valid observations $\le 180$ minutes old are considered fresh. If all monitors are stale or missing, the system emits `NO_ADVICE`.
3. **Worst Category Selection:** Among fresh reporting monitors within the nearest 3, the monitor reporting the highest severity category is selected as decisive.
4. **Sensor Disagreement Guardrail:** If the difference between the maximum and minimum severity ranks among fresh monitors is $\ge 2$ categories (e.g., Severe vs. Moderate), the system flags `stations_disagree = true` and shifts the advisory code to `VERIFY_FIRST`.

---

## 3. Aerosol Size Ratio ($PM_{2.5} / PM_{10}$) Interpretation
The ratio of fine to coarse particles provides physical insight into the dominant generation mechanism:
- **Ratio $\ge 0.6$ (Fine Dominant):** Signifies combustion sources (high-temperature vehicular exhaust, biomass smoke) or secondary aerosol formation (sulfates/nitrates).
- **Ratio $\le 0.4$ (Coarse Dominant):** Signifies mechanical abrasion, windblown mineral crust, unpaved road dust resuspension, or construction activity.
- **Ratio $0.4 - 0.6$:** Mixed urban aerosol composite.

*Scientific Limitation:* The ratio is descriptive and contextual. It does **not** constitute legal proof or singular statutory attribution.

---

## 4. Atmospheric Bearing Screening
Wind vectors (speed and azimuth degrees from Open-Meteo Weather) indicate the direction of arriving air masses:
$$\theta_{\text{upwind}} = (\theta_{\text{wind}} + 180^\circ) \pmod{360^\circ}$$
- Identifies geographical sectors upwind of the monitored site.
- **Strict Limitation:** Spatial bearing screening is **not a calibrated Gaussian or Eulerian plume dispersion model**. PRAN-NET strictly refuses to fabricate speculative plume concentrations in µg/m³ downwind.

---

## 5. Indoor Steady-State Mass Balance
To evaluate indoor mitigation scenarios, PRAN-NET implements single-zone steady-state equilibrium:
$$C_{\text{in}} = \frac{P \cdot \text{ACH} \cdot C_{\text{out}}}{\text{ACH} + k_{\text{dep}} + \frac{\text{CADR}}{V}}$$
Where:
- $C_{\text{out}}$: Outdoor ambient concentration (µg/m³)
- $P$: Particle penetration factor through building envelope (default: 0.8)
- $\text{ACH}$: Air changes per hour (1/h)
- $k_{\text{dep}}$: Particle surface deposition rate (default: 0.24 1/h for PM2.5)
- $\text{CADR}$: Clean Air Delivery Rate of filtration units (m³/h)
- $V$: Enclosed room volume (m³)

*Operational Rule:* The indoor model is exploratory only. It is **never** used to evaluate or relax outdoor activity advisories.
