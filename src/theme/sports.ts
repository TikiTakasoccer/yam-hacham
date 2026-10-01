/* קטגוריות וענפים: שם, צבעים ואיזה ציור מוביל את ההירו */
export type SportId =
  | "fishing" | "surf" | "kite" | "windsurf" | "sup" | "kayak"
  | "footvolley" | "volleyball" | "matkot" | "swim" | "snorkel" | "beach";

export interface Category {
  id: string; name: string; tagline: string; sports: SportId[]; c1: string; c2: string; ink: string;
}
export interface SportMeta { id: SportId; name: string; short: string; c1: string; c2: string; tagline: string; }

export const CATEGORIES: Category[] = [
  { id: "surf",    name: "גלישה",        tagline: "גלים, רוח וקצף",               sports: ["surf", "kite", "windsurf"],            c1: "#0369a1", c2: "#22d3ee", ink: "#075985" },
  { id: "games",   name: "משחקי חוף",    tagline: "פוציוולי, כדורעף ומטקות",       sports: ["footvolley", "volleyball", "matkot"],  c1: "#ea580c", c2: "#fb7185", ink: "#9a3412" },
  { id: "paddle",  name: "חתירה",        tagline: "ים שקט וחתירה ארוכה",           sports: ["sup", "kayak"],                        c1: "#047857", c2: "#2dd4bf", ink: "#065f46" },
  { id: "water",   name: "שחייה וצלילה", tagline: "מים צלולים ובטוחים",            sports: ["swim", "snorkel"],                     c1: "#4338ca", c2: "#a78bfa", ink: "#3730a3" },
  { id: "fishing", name: "דיג",          tagline: "השעה, השיטה והפתיון",           sports: ["fishing"],                             c1: "#b45309", c2: "#fbbf24", ink: "#92400e" },
  { id: "beach",   name: "יום חוף",      tagline: "שמש, צל ורחצה",                 sports: ["beach"],                               c1: "#db2777", c2: "#fbbf24", ink: "#9d174d" },
];

export const SPORTS: Record<SportId, SportMeta> = {
  surf:       { id: "surf",       name: "גלישת גלים",     short: "גלים",      c1: "#0369a1", c2: "#38bdf8", tagline: "סוול, period ורוח מהיבשה" },
  kite:       { id: "kite",       name: "קייטסרפינג",     short: "קייט",      c1: "#0e7490", c2: "#22d3ee", tagline: "קשרים, משבים וכיוון בטוח" },
  windsurf:   { id: "windsurf",   name: "גלישת רוח",      short: "גלישת רוח", c1: "#1d4ed8", c2: "#60a5fa", tagline: "רוח יציבה ומפרש בגודל נכון" },
  sup:        { id: "sup",        name: "סאפ",            short: "סאפ",       c1: "#047857", c2: "#34d399", tagline: "ים פלטה ורוח חלשה" },
  kayak:      { id: "kayak",      name: "קיאק ים",        short: "קיאק",      c1: "#0f766e", c2: "#5eead4", tagline: "יוצאים נגד הרוח, חוזרים איתה" },
  footvolley: { id: "footvolley", name: "פוציוולי",       short: "פוציוולי",  c1: "#c2410c", c2: "#fbbf24", tagline: "כדורעף ברגליים – רגיש לכל משב" },
  volleyball: { id: "volleyball", name: "כדורעף חופים",   short: "כדורעף",    c1: "#be123c", c2: "#fb923c", tagline: "רוח, חום ושמש שוקעת" },
  matkot:     { id: "matkot",     name: "מטקות",          short: "מטקות",     c1: "#9f1239", c2: "#f472b6", tagline: "ראלי ארוך על החול הרטוב" },
  swim:       { id: "swim",       name: "שחייה בים",      short: "שחייה",     c1: "#4338ca", c2: "#38bdf8", tagline: "גלים, זרמים וטמפרטורה" },
  snorkel:    { id: "snorkel",    name: "שנורקל וצלילה",  short: "שנורקל",    c1: "#6d28d9", c2: "#22d3ee", tagline: "ראות לפי הים של אתמול" },
  fishing:    { id: "fishing",    name: "דיג",            short: "דיג",       c1: "#b45309", c2: "#fbbf24", tagline: "שיטה, פתיון ושעה" },
  beach:      { id: "beach",      name: "יום חוף",        short: "חוף",       c1: "#db2777", c2: "#fbbf24", tagline: "נוחות, UV ורחצה" },
};
export const categoryOf = (id: SportId) => CATEGORIES.find(c => c.sports.includes(id))!;
export const sportVars = (id: SportId | string) => {
  const s = (SPORTS as any)[id] ?? CATEGORIES.find(c => c.id === id);
  return { ["--c1" as any]: s.c1, ["--c2" as any]: s.c2 } as React.CSSProperties;
};

/* צבע ציון */
export const scoreColor = (s: number) => s >= 80 ? "#10b981" : s >= 65 ? "#65a30d" : s >= 50 ? "#d97706" : s >= 30 ? "#ea580c" : "#e11d48";
export const verdict = (s: number) => s >= 80 ? "מצוין" : s >= 65 ? "טוב" : s >= 50 ? "סביר" : s >= 30 ? "חלש" : "לא מתאים";
