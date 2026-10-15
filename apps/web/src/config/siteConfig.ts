/**
 * Public contact/legal details shown in the header, footer and legal pages.
 *
 * The defaults are the business details the owner supplied in the "SolDirectory Legal and Policy Pages" document
 * (15 October 2026): Sol Business Consultant Pty Ltd, ABN 20 662 022 522, 97 John St, Glenroy VIC 3046. Each can be
 * overridden, or blanked to hide that line, with an environment variable in apps/web/.env (see .env.example):
 *   VITE_CONTACT_EMAIL, VITE_CONTACT_PHONE, VITE_CONTACT_ADDRESS, VITE_LEGAL_ENTITY, VITE_SUPPORT_HOURS
 * Setting a variable to a single space blanks it.
 */
const env = (import.meta as any).env ?? {};
const clean = (v: unknown, fallback: string): string => (typeof v === 'string' ? v.trim() : fallback);

export const siteConfig = {
  contactEmail: clean(env.VITE_CONTACT_EMAIL, 'directory@solbusinessconsultant.com.au'),
  contactPhone: clean(env.VITE_CONTACT_PHONE, '0460 003 494'),
  contactAddress: clean(env.VITE_CONTACT_ADDRESS, '97 John St, Glenroy VIC 3046'),
  legalEntity: clean(env.VITE_LEGAL_ENTITY, 'Sol Business Consultant Pty Ltd (ABN 20 662 022 522)'),
  supportHours: clean(env.VITE_SUPPORT_HOURS, 'Monday to Friday, 8am to 5.30pm Melbourne time'),
};

/** tel: links want digits only. */
export const phoneHref = (phone: string): string => `tel:${phone.replace(/[^\d+]/g, '')}`;
