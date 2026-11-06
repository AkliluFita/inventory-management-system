export const sections = ["dashboard","inventory","sales","procurement","debts","imports","transfers","reports","branches"] as const;
export type Section = (typeof sections)[number];
