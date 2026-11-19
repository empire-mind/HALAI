'use client';

import { useRef, useState } from 'react';
import { CheckCircle2, ClipboardList, ShieldCheck } from 'lucide-react';

const workflows = {
  handover: {
    label: 'Weekly handover',
    task: 'Review the sample notes and prepare a handover with open actions.',
    result: 'The draft includes the pending delivery, an owner and a review date.',
    action: 'Share the sample handover with the operations room.',
  },
  quality: {
    label: 'Release review',
    task: 'Summarise the sample build results and flag checks still open.',
    result: 'Build and type checks passed in the example. A device test is still open.',
    action: 'Mark the sample release ready for review.',
  },
} as const;

type Workflow = keyof typeof workflows;
type Decision = 'approved' | 'denied' | null;

export function Demo() {
  const [workflow, setWorkflow] = useState<Workflow>('handover');
  const [decision, setDecision] = useState<Decision>(null);
  const feedback = useRef<HTMLParagraphElement>(null);
  const approve = useRef<HTMLButtonElement>(null);
  const sample = workflows[workflow];

  function decide(next: Decision) {
    setDecision(next);
    if (next) feedback.current?.focus();
    else requestAnimationFrame(() => approve.current?.focus());
  }

  return (
    <div className="halai-demo">
      <fieldset>
        <legend>Choose a sample workflow</legend>
        {Object.entries(workflows).map(([key, item]) => (
          <label className="halai-choice" key={key}>
            <input type="radio" name="workflow" value={key} checked={workflow === key} onChange={() => {
              setWorkflow(key as Workflow);
              setDecision(null);
            }} />
            {item.label}
          </label>
        ))}
      </fieldset>
      <section aria-label="Sample task">
        <h2><ClipboardList size={20} aria-hidden="true" /> Request</h2>
        <p>{sample.task}</p>
        <h2><CheckCircle2 size={20} aria-hidden="true" /> Result</h2>
        <p>{sample.result}</p>
        <h2><ShieldCheck size={20} aria-hidden="true" /> Approval</h2>
        <p>{sample.action}</p>
        <p className="halai-demo-note">This example runs in your browser using sample data.</p>
        <p ref={feedback} tabIndex={-1} className="halai-decision" role="status">
          {decision === 'approved' ? 'Approved. The sample action can proceed.'
            : decision === 'denied' ? 'Denied. The sample draft stays in review.'
              : 'Waiting for a decision.'}
        </p>
        <div className="halai-actions">
          <button ref={approve} type="button" className="halai-button" disabled={decision !== null} onClick={() => decide('approved')}>Approve</button>
          <button type="button" className="halai-button halai-button-outline" disabled={decision !== null} onClick={() => decide('denied')}>Deny</button>
          {decision && <button type="button" className="halai-text-link" onClick={() => decide(null)}>Reset</button>}
        </div>
      </section>
    </div>
  );
}
