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
  'Todo': 'Å gjøre',
  'In Progress': 'Under arbeid',
  'Done': 'Ferdig',
  'Canceled': 'Kansellert',
  'Duplicate': 'Duplikat'
};

// Map Linear label names to Norwegian translations
export const LABEL_TRANSLATIONS: Record<string, string> = {
  'Bug': 'Feil',
  'Feature': 'Funksjonalitet',
  'Improvement': 'Forbedring',
  'Documentation': 'Dokumentasjon',
  'Design': 'Design',
  'Testing': 'Testing',
  'Security': 'Sikkerhet',
  'Performance': 'Ytelse',
  'Technical Debt': 'Teknisk gjeld',
  'Research': 'Undersøkelse',
  'Discussion': 'Diskusjon',
  'Question': 'Spørsmål',
  'Enhancement': 'Forbedring',
  'Maintenance': 'Vedlikehold'
};

export const UI_TEXTS = {
  filters: {
    allStatuses: 'Alle statuser',
    allPriorities: 'Alle prioriteter',
    allLabels: 'Alle etiketter',
    status: 'Status',
    priority: 'Prioritet',
    label: 'Etikett'
  },
  issues: {
    noIssuesFound: 'Ingen saker funnet med valgte filtre.',
    showMore: 'Vis mer',
    showLess: 'Vis mindre',
    createIssue: 'Opprett sak',
    priority: {
      noPriority: 'Ingen prioritet',
      urgent: 'Haster',
      high: 'Høy',
      medium: 'Medium',
      low: 'Lav'
    },
    form: {
      title: 'Tittel',
      description: 'Beskrivelse',
      creating: 'Oppretter...',
      create: 'Opprett sak'
    }
  },
  errors: {
    generic: 'En feil oppstod. Vennligst prøv igjen.',
    retry: 'Prøv igjen',
    required: 'Dette feltet er påkrevd'
  }
};
