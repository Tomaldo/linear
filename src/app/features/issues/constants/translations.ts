import { IssuePriority } from '../types';

export const PRIORITY_LABELS: Record<IssuePriority, string> = {
  [IssuePriority.NoPriority]: 'Ingen prioritet',
  [IssuePriority.Urgent]: 'Haster',
  [IssuePriority.High]: 'Høy',
  [IssuePriority.Medium]: 'Medium',
  [IssuePriority.Low]: 'Lav'
};

// Map Linear status names to Norwegian translations
export const STATUS_TRANSLATIONS: Record<string, string> = {
  'Backlog': 'Backlog',
  'Todo': 'Neste',
  'In Progress': 'Under arbeid',
  'Done': 'Ferdig',
  'Canceled': 'Kansellert',
  'Duplicate': 'Duplikat'
};

export const UI_TEXTS = {
  filters: {
    allStatuses: 'Alle statuser',
    allPriorities: 'Alle prioriteter',
    allLabels: 'Alle etiketter',
    status: 'Status',
    priority: 'Prioritet',
    label: 'Etikett',
    assignee: 'Tildelt til'
  },
  issues: {
    title: 'Saker',
    showMore: 'Vis mer',
    noIssues: 'Ingen saker funnet',
    unassigned: 'Ikke tildelt',
    form: {
      title: 'Tittel',
      description: 'Beskrivelse',
      priority: 'Prioritet',
      submit: 'Lagre',
      submitting: 'Lagrer...',
      cancel: 'Avbryt',
      create: 'Opprett sak',
      edit: 'Rediger sak'
    },
    actions: {
      createIssue: 'Opprett sak',
      editIssue: 'Rediger sak',
      showMore: 'Vis mer',
      showLess: 'Vis mindre',
      addComment: 'Legg til kommentar'
    },
    labels: {
      noLabels: 'Ingen etiketter',
      addLabel: 'Legg til etikett'
    },
    status: {
      change: 'Endre status'
    },
    priority: {
      change: 'Endre prioritet',
      noPriority: 'Ingen prioritet',
      urgent: 'Haster',
      high: 'Høy',
      medium: 'Medium',
      low: 'Lav'
    }
  },
  errors: {
    generic: 'En feil oppstod. Vennligst prøv igjen.',
    retry: 'Prøv igjen',
    required: 'Dette feltet er påkrevd'
  }
};
