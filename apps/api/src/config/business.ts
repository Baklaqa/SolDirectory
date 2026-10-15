/**
 * Who operates SolDirectory, as shown in email footers, the contact details of automated messages and the SMS sender text.
 * The values are the business details the owner supplied in the Build Blueprint (A1). Each can be overridden with an
 * environment variable.
 */
const env = (key: string, fallback: string): string => {
  const v = process.env[key];
  return typeof v === 'string' && v.trim() ? v.trim() : fallback;
};

export const BUSINESS = {
  operator: env('BUSINESS_OPERATOR', 'Sol Business Consultant Pty Ltd'),
  abn: env('BUSINESS_ABN', '20 662 022 522'),
  address: env('BUSINESS_ADDRESS', '97 John St, Glenroy VIC 3046'),
  phone: env('BUSINESS_PHONE', '0460 003 494'),
  email: env('BUSINESS_EMAIL', 'directory@solbusinessconsultant.com.au'),
  hours: env('BUSINESS_HOURS', 'Monday to Friday, 8am to 5.30pm (Melbourne time)'),
};

/** One line for the footer of every email. */
export const BUSINESS_LINE =
  `SolDirectory is operated by ${BUSINESS.operator} (ABN ${BUSINESS.abn}), ${BUSINESS.address}. ` +
  `Phone ${BUSINESS.phone}. Email ${BUSINESS.email}.`;
