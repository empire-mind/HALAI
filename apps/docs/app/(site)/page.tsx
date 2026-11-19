import Link from 'next/link';
import { ArrowRight, CheckCircle2, CornerDownRight, ScanEye, ShieldCheck } from 'lucide-react';
import { siteMetadata } from '@/lib/halai-site';

export const metadata = siteMetadata('/', 'Your AI team. Your workspace.', 'HALAI by EmpireMind gives your AI team one workspace for agents, routines and approvals.');

const steps = [
  ['Give an agent a job', 'Connect a model you already use and give the agent a working folder, instructions and a task.'],
  ['See the work in progress', 'Follow the conversation, review the evidence and keep related work together in a room.'],
  ['Decide what happens next', 'Review proposed actions and approve the ones that are ready. Turn proven checks into routines.'],
];

export default function HomePage() {
  return (
    <>
      <section className="halai-hero halai-container">
        <div className="halai-hero-copy">
          <h1>Your AI team.<br />Your workspace.</h1>
          <p>Give your agents a place to work, a job to do and a clear point for you to step in.</p>
          <div className="halai-actions">
            <Link className="halai-button" href="/download">Get started <ArrowRight size={17} aria-hidden="true" /></Link>
            <Link className="halai-button halai-button-outline" href="/demo">Try the demo</Link>
          </div>
          <p className="halai-hero-note">Local-first workspace by EmpireMind</p>
        </div>
        <figure className="halai-workspace">
          <div className="halai-workspace-top">
            <img src="/app-icon.svg" alt="" width={24} height={24} />
            <strong>HALAI workspace</strong><span>Example</span>
          </div>
          <div className="halai-workspace-body">
            <div className="halai-workspace-rail">
              <span>Agents</span>
              <b><i /> Operations</b>
              <b><i /> Research</b>
              <b><i /> Quality</b>
            </div>
            <div className="halai-workspace-task">
              <span className="halai-sample-kicker">Operations</span>
              <strong>Prepare the weekly handover</strong>
              <p>Summarise the open items and flag anything that needs a decision.</p>
              <div className="halai-sample-row"><CheckCircle2 size={16} aria-hidden="true" /><span>Reviewed sample notes</span></div>
              <div className="halai-sample-row"><ScanEye size={16} aria-hidden="true" /><span>Draft ready for review</span></div>
              <div className="halai-sample-row halai-sample-approval"><ShieldCheck size={16} aria-hidden="true" /><span>Share the handover?</span></div>
            </div>
          </div>
          <figcaption><Link href="/demo">Walk through this example <ArrowRight size={14} aria-hidden="true" /></Link></figcaption>
        </figure>
      </section>
      <section className="halai-workflow">
        <div className="halai-container halai-workflow-inner">
          <h2>From a task to a decision</h2>
          <ol>
            {steps.map(([title, body]) => (
              <li key={title}><CornerDownRight size={18} aria-hidden="true" /><div><h3>{title}</h3><p>{body}</p></div></li>
            ))}
          </ol>
        </div>
      </section>
      <section className="halai-container halai-bottom">
        <div><h2>Start with one workflow</h2><p>Choose a task you can review and see what HALAI can take off your team’s plate.</p></div>
        <Link className="halai-button" href="/solutions">Explore workflows <ArrowRight size={17} aria-hidden="true" /></Link>
      </section>
    </>
  );
}
