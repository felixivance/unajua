const CATEGORY_ICONS: Record<string, string> = {
  "kenyan-brands": "🏷️",
  "kenyan-companies": "🏢",
  "kenyan-places": "📍",
  "kenyan-people": "🌟",
  "kenya-trivia": "🇰🇪",
  nostalgia: "📼",
  "county-rebus": "🧩",
};

export function iconForCategory(slug: string) {
  return CATEGORY_ICONS[slug] ?? "🎯";
}
