'use client';

import { useState, type FormEvent } from 'react';
import { Download } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const DEFAULT_SEATS = 2;
const MAX_SEATS = 500;

function TeamSizeInput({ value }: { value: number }) {
  return <label>Team size<input name="seats" type="number" min={1} max={MAX_SEATS} defaultValue={value} required /></label>;
}

export function TeamRolloutPlan() {
  return (
    <section className="halai-brief halai-page-actions">
      <form action="/contact" method="get">
        <h2>Plan a team rollout</h2>
        <TeamSizeInput value={DEFAULT_SEATS} />
        <button className="halai-button" type="submit">Continue to rollout brief</button>
      </form>
    </section>
  );
}

export function RolloutBriefFromPlan({ email }: { email: string }) {
  const value = Number(useSearchParams().get('seats'));
  const seats = Number.isInteger(value) && value >= 1 && value <= MAX_SEATS ? value : DEFAULT_SEATS;
  return <RolloutBrief key={seats} email={email} seats={seats} />;
}

export function RolloutBrief({ email, seats = DEFAULT_SEATS }: { email: string; seats?: number }) {
  const [brief, setBrief] = useState('');
  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBrief([
      'HALAI rollout brief',
      '',
      `Organisation: ${String(data.get('organisation')).trim()}`,
      `Team size: ${data.get('seats')}`,
      `Hosting preference: ${data.get('hosting')}`,
      '',
      'Pilot workflow',
      String(data.get('workflow')).trim(),
    ].join('\n'));
  }

  function download() {
    const url = URL.createObjectURL(new Blob([brief], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'HALAI-rollout-brief.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="halai-brief">
      <form onSubmit={prepare} onInput={() => setBrief('')}>
        <label>Organisation<input name="organisation" autoComplete="organization" maxLength={100} required /></label>
        <div className="halai-form-row">
          <TeamSizeInput value={seats} />
          <label>Hosting preference<select name="hosting" defaultValue="Self-hosted">
            <option>Self-hosted</option>
            <option>Local desktops</option>
            <option>Discuss with EmpireMind</option>
          </select></label>
        </div>
        <label>Pilot workflow<textarea name="workflow" rows={5} maxLength={1000} required /></label>
        <button className="halai-button" type="submit">Prepare brief</button>
      </form>
      <div aria-live="polite">
        {brief && (
          <section className="halai-brief-output">
            <h2>Your rollout brief</h2>
            <pre>{brief}</pre>
            <div className="halai-actions">
              <button className="halai-button" type="button" onClick={download}><Download size={16} aria-hidden="true" />Download brief</button>
              {email && <a className="halai-button halai-button-outline" href={`mailto:${email}?subject=${encodeURIComponent('HALAI rollout brief')}&body=${encodeURIComponent(brief)}`}>Open email draft</a>}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
