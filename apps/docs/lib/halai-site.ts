import type { Metadata } from 'next';
import { sitePageUrl } from './shared';

type Action = { label: string; href: string };
type Section = { title: string; body: string; link?: Action };
type SitePage = {
  title: string;
  description: string;
  action?: Action;
  sections?: Section[];
};

export const sitePages = {
  product: {
    title: 'One desk for your AI team',
    description: 'Set up agents for specific jobs, give them the tools they need and review the actions they take.',
    action: { label: 'Try the workspace demo', href: '/demo' },
    sections: [
      { title: 'Give each agent a job', body: 'Choose the engine, instructions and working folder for each agent. Group related work into conversations and rooms.', link: { label: 'Agents and tasks', href: '/docs/features/bots-and-tasks' } },
      { title: 'Make approvals part of the workflow', body: 'See the proposed action, review its context and decide before the agent proceeds where approval is required.', link: { label: 'Approvals and inspector', href: '/docs/features/approvals-and-inspector' } },
      { title: 'Run it where your work lives', body: 'Use your own computer or connect to a server you operate. Connect providers and tools from settings.', link: { label: 'Self-hosting', href: '/docs/self-hosting' } },
      { title: 'Return to work in progress', body: 'Review conversations, follow active tasks and set routines for checks you want to run again.', link: { label: 'Routines', href: '/docs/features/automation' } },
    ],
  },
  download: {
    title: 'Get HALAI running',
    description: 'Start with the HALAI source or check published builds for your platform.',
    action: { label: 'Read installation instructions', href: '/docs/getting-started/installation' },
    sections: [
      { title: 'macOS', body: 'Build and test on Apple silicon or Intel. Check the release notes for the architecture and signing status of any published installer.' },
      { title: 'Windows', body: 'Follow the source setup for the desktop candidate. Windows installers require package and launch verification.' },
      { title: 'Ubuntu', body: 'Run the desktop candidate or use the self-hosting reference to prepare a server you control.', link: { label: 'Self-hosting guide', href: '/docs/self-hosting' } },
    ],
  },
  demo: {
    title: 'A business task, from request to decision',
    description: 'Step through a sample operations task and see how an approval changes the outcome.',
  },
  solutions: {
    title: 'Start with work your team already does',
    description: 'Give an agent one repeatable task, a clear scope and a person to review the result.',
    action: { label: 'Prepare a rollout brief', href: '/contact' },
    sections: [
      { title: 'Operations', body: 'Review open handovers, assemble a daily brief from approved sources and surface the actions a manager should confirm.' },
      { title: 'Client delivery', body: 'Prepare an update from project notes and evidence. Put the draft in front of its owner before it leaves the workspace.' },
      { title: 'Knowledge and research', body: 'Give a research agent a defined folder and source list. Ask for the answer, references and unresolved questions together.' },
      { title: 'Engineering and QA', body: 'Run a targeted check in an isolated workspace. Capture the tested revision, observed results and any open release gates.' },
    ],
  },
  guides: {
    title: 'Learn HALAI by doing one job',
    description: 'These guides start with a working workspace and build up to repeatable workflows.',
    sections: [
      { title: 'Create your first agent', body: 'Connect a supported engine and give the agent a small task with a clear expected result.', link: { label: 'First agent guide', href: '/docs/getting-started/first-bot' } },
      { title: 'Review a proposed action', body: 'Use an approval for a consequential action. Keep a record of who decided and what happened.', link: { label: 'Approval guide', href: '/docs/features/approvals-and-inspector' } },
      { title: 'Schedule a recurring check', body: 'Choose a task that is already understood, then verify one scheduled run and its output.', link: { label: 'Automation guide', href: '/docs/features/automation' } },
      { title: 'Pair a second device', body: 'Choose a connection path you control and verify access from the paired device.', link: { label: 'Pair an iPhone', href: '/docs/mobile/ios-companion' } },
    ],
  },
  pricing: {
    title: 'Choose how to run HALAI',
    description: 'The open-source core runs on infrastructure you provide. Provider subscriptions and hosting have their own costs.',
    sections: [
      { title: 'Self-hosted core', body: 'Use the open-source HALAI runtime on your computer or server. Choose and manage your own model providers.', link: { label: 'Get started', href: '/download' } },
      { title: 'Business rollout', body: 'Prepare a brief covering your team size, workflows and hosting requirements. Pricing and delivery scope are agreed separately.' },
    ],
  },
  business: {
    title: 'Bring HALAI into your business',
    description: 'Start with a workflow you can measure, then decide what to connect, who can approve actions and where the workspace runs.',
    action: { label: 'Prepare a rollout brief', href: '/contact' },
    sections: [
      { title: 'Pilot one team', body: 'Define the workspace owner, the tasks it can run and the evidence you will use to accept the pilot.' },
      { title: 'Use your own infrastructure', body: 'Choose a local or self-hosted deployment and decide which providers, connectors and identity services it may use.', link: { label: 'Review deployment options', href: '/docs/self-hosting' } },
      { title: 'Integration and delivery partners', body: 'Use the rollout brief to describe the customer environment, the services to integrate and the site or app owner.' },
    ],
  },
  contact: {
    title: 'Prepare a HALAI rollout brief',
    description: 'Record your team size, hosting preference and the workflow you want to pilot.',
  },
  security: {
    title: 'Set the scope before connecting tools',
    description: 'Use local workspaces, explicit connections and review steps to control what agents can access and do.',
    sections: [
      { title: 'Connected accounts', body: 'Keep provider credentials in the workspace configuration or approved secret store. Review the permissions when connecting an account.', link: { label: 'Permissions and secrets', href: '/docs/security/permissions-and-secrets' } },
      { title: 'Actions and approvals', body: 'Establish which actions require a decision. Keep an approval in scope when adding a tool or changing a workflow.', link: { label: 'Approvals and inspector', href: '/docs/features/approvals-and-inspector' } },
      { title: 'Devices and remote access', body: 'Pair only the devices your workspace owner approves. Review existing sessions when people or devices change.', link: { label: 'Network access and pairing', href: '/docs/self-hosting/networking' } },
    ],
  },
  privacy: {
    title: 'Understand where your data goes',
    description: 'The workspace you run, the providers you choose and the accounts you connect each handle different parts of a task.',
    sections: [
      { title: 'This site’s rollout brief', body: 'The brief is assembled in your browser. It downloads as a text file. A configured contact link opens your mail app so you can review the brief before sending it.' },
      { title: 'Using the workspace', body: 'Your deployment stores its own configuration and conversation history. Connected providers and tools handle requests according to the permissions and services you choose.', link: { label: 'Technical security guidance', href: '/docs/security' } },
    ],
  },
  releases: {
    title: 'HALAI release history',
    description: 'Follow the HALAI repository for versioned builds, notes and the release history of this distribution.',
    action: { label: 'Open HALAI releases on GitHub', href: 'https://github.com/empire-mind/HALAI/releases' },
    sections: [
      { title: 'Read the notes first', body: 'Check platform, signing and compatibility details with each published build.' },
      { title: 'Building from source', body: 'Pin a revision when evaluating the runtime so results can be reproduced.', link: { label: 'Source installation', href: '/docs/getting-started/installation' } },
    ],
  },
  compare: {
    title: 'Evaluate an AI workspace on your own work',
    description: 'Use the same sample task, model and workspace permissions when comparing tools.',
    action: { label: 'Run the HALAI demo', href: '/demo' },
    sections: [
      { title: 'Give it a realistic task', body: 'Use a representative task and approved sample data. Measure completion, evidence and the decisions it hands to an operator.' },
      { title: 'Check deployment fit', body: 'Compare engine support, who controls the host, which actions can be approved and how results are reviewed.' },
      { title: 'Check the operating cost', body: 'Include provider usage, infrastructure and the time your team spends preparing, reviewing and recovering tasks.' },
    ],
  },
} satisfies Record<string, SitePage>;

export type SitePageKey = keyof typeof sitePages;
export function isSitePage(key: string): key is SitePageKey {
  return Object.hasOwn(sitePages, key);
}

export const sitePaths = ['/', ...Object.keys(sitePages).map((key) => `/${key}`)];

export function siteMetadata(path: string, title: string, description: string): Metadata {
  const canonical = sitePageUrl(path);
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical } };
}
