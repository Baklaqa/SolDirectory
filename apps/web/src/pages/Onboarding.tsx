import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MAX_DOCUMENT_BYTES, removeProviderDocument, saveOnboardingStep, uploadProviderDocument, type OnboardingVerification, type PolicyReviewData } from '../api/resources';
import { ApiError } from '../api/client';
import { useToast } from '../components/ui/Toast';
import { listActiveServices, type ActiveService } from '../api/serviceCatalogue';
import './Onboarding.css';

const STEPS = [
  { key: 'org', title: 'Organisation details', description: 'Basic organisation information' },
  { key: 'insurance', title: 'Insurance & registration', description: 'Compliance information' },
  { key: 'areas', title: 'Service areas & capacity', description: 'Where you work and how much you can take on' },
  { key: 'team', title: 'Team & clearances', description: 'Your roster and after-hours cover' },
  { key: 'policy', title: 'Incident & complaints policy', description: 'Required compliance document' },
  { key: 'declaration', title: 'Confirm your details', description: 'A short declaration' },
  { key: 'billing', title: 'Subscription & leads', description: 'Your current plan' },
];

interface ProviderData {
  legalEntityName?: string; abn?: string; tradingName?: string;
  registrationGroups?: string[]; serviceSuburbs?: string[]; travelRadiusKm?: number;
  weeklyCapacityHours?: number; rosterSize?: number; afterHoursCover?: string;
  incidentPolicyEscalation?: string; plan?: string;
}

// Self-contained — getOnboarding didn't exist as a frontend call
// before this fix, so rather than assume an unconfirmed addition to
// api/resources.ts, this fetches directly the same way adminResources.ts does.
const API_URL = (import.meta as any).env?.VITE_API_URL ?? '/api';
function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('sd_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
interface AttestationData {
  registrationStatus: 'registered' | 'not_registered'; insuranceHeld: boolean; insuranceExpiry: string;
  workerScreening: boolean; codeOfConduct: boolean; truthful: boolean;
}
const formatSize = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
const STEP_KEYS = STEPS.map((s) => s.key);

async function fetchOnboarding(): Promise<{
  steps: { key: string; complete: boolean }[]; provider: ProviderData;
  policyDocument: { filename: string; size: number; review: PolicyReviewData | null } | null; attestation: AttestationData | null; verification: OnboardingVerification | null;
}> {
  const res = await fetch(`${API_URL}/onboarding`, { headers: authHeaders() });
  if (!res.ok) throw new ApiError((await res.json()).error ?? 'Request failed', res.status);
  return res.json();
}

// Registration group options now come from the real service
// catalogue (fetched below) rather than this hardcoded list.
const SUBURB_OPTIONS = ['Bankstown', 'Parramatta', 'Liverpool', 'Blacktown', 'Auburn', 'Lidcombe', 'Canterbury', 'Marrickville'];

/** The points a policy is missing: the needed ones first, the good-practice ones tucked behind a toggle so the list stays short. */
function ReviewLists({ review }: { review: PolicyReviewData }) {
  const needed = review.missing.filter((m) => m.essential);
  const extra = review.missing.filter((m) => !m.essential);
  const item = (m: { key: string; label: string; advice: string }, soft: boolean) => (
    <li key={m.key}>
      <strong>{m.label}</strong>{soft ? <span className="ob-review-tag ob-review-tag-soft">good to add</span> : <span className="ob-review-tag">needed</span>}
      <span className="ob-review-advice">{m.advice}</span>
    </li>
  );
  return (
    <>
      {needed.length > 0 && <ul className="ob-review-list">{needed.map((m) => item(m, false))}</ul>}
      {extra.length > 0 && (
        <details className="ob-review-more">
          <summary>{extra.length} more {extra.length === 1 ? 'idea' : 'ideas'} that are good practice</summary>
          <ul className="ob-review-list">{extra.map((m) => item(m, true))}</ul>
        </details>
      )}
    </>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [pageLoading, setPageLoading] = useState(true);
  const [registrationGroupOptions, setRegistrationGroupOptions] = useState<ActiveService[]>([]);

  useEffect(() => {
    listActiveServices('provider').then((res) => setRegistrationGroupOptions(res.items)).catch(() => {});
  }, []);
  const [pageError, setPageError] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState<boolean[]>(new Array(STEPS.length).fill(false));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const showToast = useToast();

  // Field state — all pre-filled from real backend data on load.
  const [legalEntityName, setLegalEntityName] = useState('');
  const [abn, setAbn] = useState('');
  const [tradingName, setTradingName] = useState('');
  const [registrationGroups, setRegistrationGroups] = useState<string[]>([]);
  const [serviceSuburbs, setServiceSuburbs] = useState<string[]>([]);
  const [travelRadiusKm, setTravelRadiusKm] = useState(20);
  const [weeklyCapacityHours, setWeeklyCapacityHours] = useState(40);
  const [rosterSize, setRosterSize] = useState(1);
  const [afterHoursCover, setAfterHoursCover] = useState('');
  const [incidentPolicyEscalation, setIncidentPolicyEscalation] = useState('');
  const [plan, setPlan] = useState('starter');
  const [policyFile, setPolicyFile] = useState<{ name: string; size?: number; status: 'uploading' | 'uploaded' | 'error'; progress: number; message?: string; review?: PolicyReviewData | null } | null>(null);
  // The declaration step.
  const [registrationStatus, setRegistrationStatus] = useState<'' | 'registered' | 'not_registered'>('');
  const [insuranceHeld, setInsuranceHeld] = useState(false);
  const [insuranceExpiry, setInsuranceExpiry] = useState('');
  const [workerScreening, setWorkerScreening] = useState(false);
  const [codeOfConduct, setCodeOfConduct] = useState(false);
  const [truthful, setTruthful] = useState(false);
  // What the automatic checks found, and whether the provider has opened a step again to fix something.
  const [verification, setVerification] = useState<OnboardingVerification | null>(null);
  const [fixing, setFixing] = useState(false);

  const savedTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    fetchOnboarding()
      .then((res) => {
        setDone(STEPS.map((s) => res.steps.find((rs) => rs.key === s.key)?.complete ?? false));
        const p = res.provider;
        setLegalEntityName(p.legalEntityName ?? '');
        setAbn(p.abn ?? '');
        setTradingName(p.tradingName ?? '');
        setRegistrationGroups(p.registrationGroups ?? []);
        setServiceSuburbs(p.serviceSuburbs ?? []);
        if (p.travelRadiusKm) setTravelRadiusKm(p.travelRadiusKm);
        if (p.weeklyCapacityHours) setWeeklyCapacityHours(p.weeklyCapacityHours);
        if (p.rosterSize) setRosterSize(p.rosterSize);
        setAfterHoursCover(p.afterHoursCover ?? '');
        setIncidentPolicyEscalation(p.incidentPolicyEscalation ?? '');
        setPlan(p.plan ?? 'starter');
        if (res.policyDocument) setPolicyFile({ name: res.policyDocument.filename, size: res.policyDocument.size, status: 'uploaded', progress: 100, review: res.policyDocument.review });
        if (res.attestation) {
          setRegistrationStatus(res.attestation.registrationStatus);
          setInsuranceHeld(res.attestation.insuranceHeld);
          setInsuranceExpiry(res.attestation.insuranceExpiry);
          setWorkerScreening(res.attestation.workerScreening);
          setCodeOfConduct(res.attestation.codeOfConduct);
          setTruthful(res.attestation.truthful);
        }
        setVerification(res.verification);
        // First incomplete step becomes the starting point, so a
        // returning provider lands where they left off rather than
        // always back at step 1. A link from an email (?step=insurance) opens that step to fix it.
        const firstIncomplete = STEPS.findIndex((s) => !res.steps.find((rs) => rs.key === s.key)?.complete);
        const wanted = STEP_KEYS.indexOf(params.get('step') ?? '');
        if (wanted >= 0) { setStepIndex(wanted); setFixing(true); }
        else setStepIndex(firstIncomplete === -1 ? STEPS.length - 1 : firstIncomplete);
      })
      .catch((err) => setPageError(err instanceof ApiError ? err.message : 'Unable to load your onboarding progress.'))
      .finally(() => setPageLoading(false));
  }, []);

  const step = STEPS[stepIndex];
  const completedCount = done.filter(Boolean).length;
  const progressPct = Math.round((completedCount / STEPS.length) * 100);
  const allComplete = completedCount === STEPS.length && !fixing;

  // A step is reachable if it's already complete, is the current
  // step, or is the very next step after the last completed one —
  // no skipping ahead into steps that were never opened.
  function isStepLocked(i: number): boolean {
    if (done[i]) return false;
    const firstIncomplete = done.findIndex((d) => !d);
    return i > (firstIncomplete === -1 ? STEPS.length : firstIncomplete);
  }

  function goToStep(i: number) {
    if (isStepLocked(i)) return;
    setDirection(i > stepIndex ? 'forward' : 'backward');
    setStepIndex(i);
    setError('');
  }

  function toggleInArray(list: string[], value: string, setList: (v: string[]) => void) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function handlePolicyUpload(file: File) {
    // Plain checks first, so a wrong file is explained straight away instead of after an upload.
    if (!/\.(pdf|docx)$/i.test(file.name)) { setPolicyFile({ name: file.name, status: 'error', progress: 0, message: /\.doc$/i.test(file.name) ? 'Older .doc files are not accepted. Please save the policy as a PDF or a .docx file and upload that.' : 'Please choose a PDF or a Word (.docx) file.' }); return; }
    if (file.size > MAX_DOCUMENT_BYTES) { setPolicyFile({ name: file.name, status: 'error', progress: 0, message: `That file is ${formatSize(file.size)}. The limit is 10 MB.` }); return; }
    if (file.size === 0) { setPolicyFile({ name: file.name, status: 'error', progress: 0, message: 'That file is empty. Please choose the document again.' }); return; }
    setPolicyFile({ name: file.name, size: file.size, status: 'uploading', progress: 0 });
    setError('');
    try {
      const result = await uploadProviderDocument('incident_policy', file, (progress) => setPolicyFile((f) => (f ? { ...f, progress } : f)));
      setPolicyFile({ name: file.name, size: file.size, status: 'uploaded', progress: 100, review: result.review });
      showToast('Policy document uploaded.');
    } catch (err) {
      setPolicyFile({ name: file.name, size: file.size, status: 'error', progress: 0, message: err instanceof ApiError ? err.message : 'The upload failed. Please try again.' });
    }
  }

  async function handlePolicyRemove() {
    setPolicyFile(null);
    removeProviderDocument('incident_policy').catch(() => {});
  }

  function buildStepData(): Record<string, unknown> {
    switch (step.key) {
      case 'org': return { legalEntityName, abn, tradingName };
      case 'insurance': return { registrationGroups };
      case 'areas': return { serviceSuburbs, travelRadiusKm, weeklyCapacityHours };
      case 'team': return { rosterSize, afterHoursCover };
      case 'policy': return { incidentPolicyEscalation };
      case 'declaration': return { registrationStatus, insuranceHeld, insuranceExpiry, workerScreening, codeOfConduct, truthful };
      default: return {};
    }
  }

  async function saveAndContinue() {
    setError('');
    setSaving(true);
    setJustSaved(false);
    try {
      const saved = await saveOnboardingStep(step.key, buildStepData());
      if (saved.verification) setVerification(saved.verification);
      setDone((d) => { const next = [...d]; next[stepIndex] = true; return next; });
      setJustSaved(true);
      clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setJustSaved(false), 2500);
      if (fixing && done.every((d, i) => d || i === stepIndex)) {
        setFixing(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (stepIndex < STEPS.length - 1) {
        setDirection('forward');
        setStepIndex(stepIndex + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setFixing(false);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to save your changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="ob-page">
        <div className="ob-skel-intro" />
        <div className="ob-layout">
          <div className="ob-skel-stepper" />
          <div className="ob-skel-panel" />
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="ob-error-state">
        <p className="ob-error-title">Unable to load onboarding</p>
        <p>{pageError}</p>
        <button className="ob-retry-btn" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="ob-page">
      <div className="ob-intro">
        <h1 className="ob-intro-heading">Complete your provider profile</h1>
        <p className="ob-intro-sub">A few quick steps to get your organisation ready to receive relevant enquiries and leads.</p>
        {!allComplete && (
          <div className="ob-progress-summary">
            <span>Step {stepIndex + 1} of {STEPS.length}</span>
            <span className="ob-progress-dot" />
            <span>{progressPct}% complete</span>
          </div>
        )}
      </div>

      {allComplete ? (
        <div className="ob-complete-state">
          <span className="ob-complete-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="10" /><path d="m7.5 12.5 3 3 6-6.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <h2>{verification?.status === 'needs_attention' ? 'Almost there' : "You're all set"}</h2>
          <p>
            {!verification ? 'Your provider onboarding is complete.'
              : verification.status === 'checked' ? 'We checked your details and everything is confirmed. We have emailed you the result.'
              : verification.status === 'in_review' ? 'Your onboarding is complete. There is one thing our team will confirm, shown below.'
              : 'Your onboarding is saved, but a few things need fixing before your details can be confirmed.'}
          </p>
          {verification && verification.checks.some((c) => c.result !== 'pass') && (
            <ul className="ob-checks" aria-label="Things to fix or confirm">
              {verification.checks.filter((c) => c.result !== 'pass').map((c) => (
                <li key={c.key + c.message} className={`ob-check-item ob-check-${c.result}`}>
                  <span>{c.message}</span>
                  <button type="button" className="ob-check-fix" onClick={() => { const i = STEP_KEYS.indexOf(c.fixStep ?? 'org'); setFixing(true); setStepIndex(i < 0 ? 0 : i); window.scrollTo({ top: 0 }); }}>
                    {c.result === 'fail' ? 'Fix this' : 'Check this'}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button className="ob-continue-btn" onClick={() => navigate('/dashboard')}>Go to dashboard →</button>
        </div>
      ) : (
        <div className="ob-layout">
          <aside className="ob-stepper" aria-label="Onboarding steps">
            <p className="ob-stepper-eyebrow">Onboarding</p>
            {STEPS.map((s, i) => {
              const locked = isStepLocked(i);
              const state = done[i] ? 'done' : i === stepIndex ? 'current' : locked ? 'locked' : 'upcoming';
              return (
                <button
                  key={s.key}
                  className={`ob-step ob-step-${state}`}
                  onClick={() => goToStep(i)}
                  disabled={locked}
                  aria-current={i === stepIndex ? 'step' : undefined}
                >
                  <span className="ob-step-marker-col">
                    <span className="ob-step-marker">
                      {done[i] ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m5 12.5 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      ) : i + 1}
                    </span>
                    {i < STEPS.length - 1 && <span className={`ob-step-connector ${done[i] ? 'ob-step-connector-done' : ''}`} />}
                  </span>
                  <span className="ob-step-text">
                    <span className="ob-step-title">{s.title}</span>
                    <span className="ob-step-desc">{s.description}</span>
                  </span>
                </button>
              );
            })}
          </aside>

          <div className="ob-mobile-progress">
            <p className="ob-mobile-step-label">Step {stepIndex + 1} of {STEPS.length}</p>
            <h2 className="ob-mobile-step-title">{step.title}</h2>
            <div className="ob-mobile-bar-track"><div className="ob-mobile-bar-fill" style={{ width: `${progressPct}%` }} /></div>
          </div>

          <div className="ob-panel">
            <div key={step.key} className={`ob-step-content ob-anim-${direction}`}>
              <p className="ob-step-eyebrow">Step {stepIndex + 1} of {STEPS.length}</p>
              <h2 className="ob-step-heading">{step.title}</h2>

              {step.key === 'org' && (
                <>
                  <p className="ob-step-intro">Tell us about your organisation so we can set up your provider profile.</p>
                  <div className="ob-field-grid">
                    <div className="ob-field ob-field-full">
                      <label className="ob-field-label" htmlFor="ob-legal-name">Legal entity name</label>
                      <input id="ob-legal-name" className="ob-input" value={legalEntityName} onChange={(e) => setLegalEntityName(e.target.value)} />
                    </div>
                    <div className="ob-field">
                      <label className="ob-field-label" htmlFor="ob-abn">ABN</label>
                      <p className="ob-field-helper">Enter your 11-digit Australian Business Number</p>
                      <input id="ob-abn" className="ob-input" value={abn} onChange={(e) => setAbn(e.target.value)} placeholder="81 442 003 91" />
                    </div>
                    <div className="ob-field">
                      <label className="ob-field-label" htmlFor="ob-trading-name">Trading name</label>
                      <p className="ob-field-helper">If different from your legal name</p>
                      <input id="ob-trading-name" className="ob-input" value={tradingName} onChange={(e) => setTradingName(e.target.value)} />
                    </div>
                  </div>
                </>
              )}

              {step.key === 'insurance' && (
                <>
                  <p className="ob-step-intro">Which registration groups does your organisation hold?</p>
                  <div className="ob-chip-group">
                    {registrationGroupOptions.map((g) => (
                      <button key={g.id} type="button" className={`ob-chip ${registrationGroups.includes(g.name) ? 'ob-chip-selected' : ''}`} onClick={() => toggleInArray(registrationGroups, g.name, setRegistrationGroups)}>
                        {g.name}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step.key === 'areas' && (
                <>
                  <p className="ob-step-intro">Where do you work, and how much capacity do you have?</p>
                  <div className="ob-field ob-field-full">
                    <label className="ob-field-label">Service suburbs</label>
                    <div className="ob-chip-group">
                      {SUBURB_OPTIONS.map((s) => (
                        <button key={s} type="button" className={`ob-chip ${serviceSuburbs.includes(s) ? 'ob-chip-selected' : ''}`} onClick={() => toggleInArray(serviceSuburbs, s, setServiceSuburbs)}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="ob-field-grid">
                    <div className="ob-field">
                      <label className="ob-field-label" htmlFor="ob-radius">Travel radius (km)</label>
                      <input id="ob-radius" type="number" className="ob-input" value={travelRadiusKm} onChange={(e) => setTravelRadiusKm(Number(e.target.value))} />
                    </div>
                    <div className="ob-field">
                      <label className="ob-field-label" htmlFor="ob-capacity">Weekly capacity (hours)</label>
                      <input id="ob-capacity" type="number" className="ob-input" value={weeklyCapacityHours} onChange={(e) => setWeeklyCapacityHours(Number(e.target.value))} />
                    </div>
                  </div>
                </>
              )}

              {step.key === 'team' && (
                <>
                  <p className="ob-step-intro">Tell us about your roster and after-hours cover.</p>
                  <div className="ob-field-grid">
                    <div className="ob-field">
                      <label className="ob-field-label" htmlFor="ob-roster">Roster size</label>
                      <input id="ob-roster" type="number" className="ob-input" value={rosterSize} onChange={(e) => setRosterSize(Number(e.target.value))} />
                    </div>
                    <div className="ob-field ob-field-full">
                      <label className="ob-field-label" htmlFor="ob-afterhours">After-hours cover</label>
                      <textarea id="ob-afterhours" className="ob-textarea" value={afterHoursCover} onChange={(e) => setAfterHoursCover(e.target.value)} rows={3} placeholder="Describe how after-hours enquiries are handled" />
                    </div>
                  </div>
                </>
              )}

              {step.key === 'policy' && (
                <>
                  <p className="ob-step-intro">Upload your incident and complaints policy, and describe your escalation process.</p>
                  <div className="ob-field ob-field-full">
                    <label className="ob-field-label" id="ob-policy-label">Policy document</label>
                    <p className="ob-field-helper">A PDF or Word (.docx) file, up to 10 MB. We scan it for viruses and read it to see what it covers.</p>
                    {policyFile?.status === 'uploading' && (
                      <div className="ob-upload-progress" role="status" aria-live="polite">
                        <span>Uploading {policyFile.name}… {policyFile.progress}%</span>
                        <div className="ob-upload-bar" aria-hidden="true"><div style={{ width: `${policyFile.progress}%` }} /></div>
                      </div>
                    )}
                    {policyFile?.status === 'uploaded' && (
                      <div className="ob-upload-done" role="status">
                        <span>✓ {policyFile.name}{policyFile.size ? ` (${formatSize(policyFile.size)})` : ''} is uploaded</span>
                        <button type="button" onClick={handlePolicyRemove}>Remove</button>
                      </div>
                    )}
                    {policyFile?.status === 'uploaded' && policyFile.review && (
                      <div className={`ob-review ob-review-${policyFile.review.status}`} role="status">
                        {policyFile.review.status === 'ok' && (
                          <>
                            <p className="ob-review-title">✓ We read your policy. Everything needed is there{policyFile.review.missing.length ? `, and it covers ${policyFile.review.covered} of ${policyFile.review.total} points in all.` : '.'}</p>
                            <ReviewLists review={policyFile.review} />
                          </>
                        )}
                        {policyFile.review.status === 'unreadable' && <p className="ob-review-title">We could not check your policy. {policyFile.review.note}</p>}
                        {policyFile.review.status === 'gaps' && (
                          <>
                            <p className="ob-review-title">We read your policy. It covers {policyFile.review.covered} of {policyFile.review.total} points. {policyFile.review.missing.some((m) => m.essential) ? 'These are needed and not there yet:' : 'Everything needed is there.'}</p>
                            <ReviewLists review={policyFile.review} />
                            <p className="ob-review-note">Add these to your policy, then upload it again. If a point is covered in different words, you can carry on and our team will see it. This is an automatic read to help you spot gaps; it is not legal advice.</p>
                          </>
                        )}
                        <label className="ob-review-replace">Upload an updated policy<input type="file" hidden accept=".pdf,.docx" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) handlePolicyUpload(f); }} /></label>
                      </div>
                    )}
                    {policyFile?.status === 'error' && (
                      <div className="ob-upload-error" role="alert">
                        <p>{policyFile.message}</p>
                        <label className="ob-upload-box ob-upload-box-small">
                          Choose a file
                          <input type="file" hidden accept=".pdf,.docx" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) handlePolicyUpload(f); }} />
                        </label>
                      </div>
                    )}
                    {!policyFile && (
                      <label className="ob-upload-box" aria-labelledby="ob-policy-label">
                        Upload document
                        <input type="file" hidden accept=".pdf,.docx" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) handlePolicyUpload(f); }} />
                      </label>
                    )}
                  </div>
                  <div className="ob-field ob-field-full">
                    <label className="ob-field-label" htmlFor="ob-escalation">Escalation process</label>
                    <textarea id="ob-escalation" className="ob-textarea" value={incidentPolicyEscalation} onChange={(e) => setIncidentPolicyEscalation(e.target.value)} rows={3} />
                  </div>
                </>
              )}

              {step.key === 'declaration' && (
                <>
                  <p className="ob-step-intro">Please confirm the points below. It takes about a minute.</p>
                  <fieldset className="ob-field ob-field-full ob-fieldset">
                    <legend className="ob-field-label">Is your organisation registered with the NDIS Quality and Safeguards Commission?</legend>
                    <label className="ob-radio"><input type="radio" name="ob-reg" checked={registrationStatus === 'registered'} onChange={() => setRegistrationStatus('registered')} /> Yes, we are registered</label>
                    <label className="ob-radio"><input type="radio" name="ob-reg" checked={registrationStatus === 'not_registered'} onChange={() => setRegistrationStatus('not_registered')} /> No, we are not registered</label>
                  </fieldset>
                  <div className="ob-field ob-field-full">
                    <label className="ob-check"><input type="checkbox" checked={insuranceHeld} onChange={(e) => setInsuranceHeld(e.target.checked)} /> We hold current public liability insurance.</label>
                    {insuranceHeld && (
                      <div className="ob-field ob-indent">
                        <label className="ob-field-label" htmlFor="ob-insurance-expiry">Insurance expires on</label>
                        <input id="ob-insurance-expiry" type="date" className="ob-input" value={insuranceExpiry} onChange={(e) => setInsuranceExpiry(e.target.value)} />
                      </div>
                    )}
                  </div>
                  <div className="ob-field ob-field-full">
                    <label className="ob-check"><input type="checkbox" checked={workerScreening} onChange={(e) => setWorkerScreening(e.target.checked)} /> Everyone who works directly with participants has, or is getting, any worker screening check their work requires.</label>
                  </div>
                  <div className="ob-field ob-field-full">
                    <label className="ob-check"><input type="checkbox" checked={codeOfConduct} onChange={(e) => setCodeOfConduct(e.target.checked)} /> We follow the NDIS Code of Conduct and handle incidents and complaints as our policy says.</label>
                  </div>
                  <div className="ob-field ob-field-full">
                    <label className="ob-check"><input type="checkbox" checked={truthful} onChange={(e) => setTruthful(e.target.checked)} /> The details I have given are true, and I am authorised to give them for this organisation.</label>
                  </div>
                  <p className="ob-field-helper">We check your ABN against the NDIS Commission register and email you the result. We may ask for evidence of any of these points.</p>
                </>
              )}

              {step.key === 'billing' && (
                <>
                  <p className="ob-step-intro">Your current plan determines how many leads you can unlock.</p>
                  <div className="ob-plan-card">
                    <span className="ob-plan-label">Current plan</span>
                    <span className="ob-plan-name">{plan}</span>
                    <a href="/plans" className="ob-plan-link">Manage plan →</a>
                  </div>
                </>
              )}

              {error && <p className="ob-error-inline" role="alert">{error}</p>}
            </div>

            <div className="ob-footer">
              <div>
                {stepIndex > 0 && <button className="ob-back-btn" onClick={() => goToStep(stepIndex - 1)}>← Back</button>}
              </div>
              <div className="ob-footer-right">
                {justSaved && <span className="ob-saved-indicator">✓ Saved</span>}
                <button className="ob-continue-btn" disabled={saving} onClick={saveAndContinue}>
                  {saving ? 'Saving…' : stepIndex === STEPS.length - 1 ? 'Finish onboarding →' : 'Save & continue →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
