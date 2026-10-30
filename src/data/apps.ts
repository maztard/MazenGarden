export type AppId = 'photos' | 'socials' | 'projects' | 'writing' | 'rss';

export interface AppDefinition {
  id: AppId;
  label: string;
  icon: string;
  windowTitle: string;
  defaultOpen: boolean;
}

export const apps: AppDefinition[] = [
  { id: 'photos', label: 'Photos', icon: 'photos', windowTitle: 'MEET-MAZEN', defaultOpen: true },
  { id: 'socials', label: 'Socials', icon: 'contact', windowTitle: 'SOCIALS', defaultOpen: true },
  { id: 'projects', label: 'Projects', icon: 'projects', windowTitle: 'PROJECTS', defaultOpen: false },
  { id: 'writing', label: 'Writing', icon: 'writing', windowTitle: 'WRITING', defaultOpen: false },
  { id: 'rss', label: 'RSS', icon: 'rss', windowTitle: 'RSS', defaultOpen: false },
];
