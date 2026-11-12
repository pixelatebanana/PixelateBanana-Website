// Types and rules shared by server and client code (no Node imports, so client components can use it).
export type Role = 'client' | 'specialist';
export type Stage = 'specification' | 'design' | 'production' | 'delivery' | 'complete';
export type Party = { name: string; email: string; salt: string; hash: string };
export type Project = { id: string; number: string; title: string; brief: string; stage: Stage; chat: 'open' | 'revoked'; created: string; client: Party; specialist: Party };
export type Message = { from: Role | 'admin' | 'system'; name: string; text: string; at: string };

export const STAGES: { key: Stage; label: string }[] = [
  { key: 'specification', label: 'Specification' },
  { key: 'design', label: 'Design' },
  { key: 'production', label: 'Production' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'complete', label: 'Complete' },
];
/** Client, specialist and admin can talk only while the specification and the design are being agreed. */
export const chatOpen = (p: Pick<Project, 'stage' | 'chat'>) => p.chat === 'open' && (p.stage === 'specification' || p.stage === 'design');

