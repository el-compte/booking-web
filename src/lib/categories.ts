export const CATEGORIES = [
  { id: 'studios', label: 'Photo studios' },
  { id: 'podcast', label: 'Podcast rooms' },
  { id: 'meetings', label: 'Meeting rooms' },
  { id: 'rooftops', label: 'Rooftops' },
  { id: 'kitchens', label: 'Kitchens' },
  { id: 'wellness', label: 'Yoga & dance' },
  { id: 'creative', label: 'Ateliers' },
  { id: 'music', label: 'Music rooms' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export const isCategoryId = (value: string): value is CategoryId =>
  CATEGORIES.some((c) => c.id === value);
