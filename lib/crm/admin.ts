import type { Project } from '@/lib/crm/shared';

/** Admin is the only place email addresses are returned. */
export const adminView = (p: Project) => ({
  id: p.id, number: p.number, title: p.title, brief: p.brief, stage: p.stage, chat: p.chat, created: p.created,
  client: { name: p.client.name, email: p.client.email }, specialist: { name: p.specialist.name, email: p.specialist.email },
});
export type AdminProject = ReturnType<typeof adminView>;
