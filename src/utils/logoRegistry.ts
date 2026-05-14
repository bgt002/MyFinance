import type { ImageSourcePropType } from 'react-native';

// Logo registry for banks, card networks, and fintechs.
//
// 100% offline — every entry is a PNG file in /assets/logos/ bundled via
// require(). No runtime network, no API keys, no third-party SDKs.
//
// Source origins:
//   - Card networks, fintechs, and major banks (Visa, Mastercard, Chase, etc.):
//     rasterized at dev time from the simple-icons npm package (MIT), brand
//     color baked in via fill attribute.
//   - Remaining US banks (Capital One, Citi, U.S. Bank, PNC, etc.): fetched
//     once at dev time from a free favicon service.
//
// To upgrade a logo's resolution: drop a higher-res PNG into /assets/logos/
// using the same filename. No code changes needed.

export type LogoSlug =
  // Card networks
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'discover'
  | 'diners'
  | 'jcb'
  | 'apple_pay'
  | 'google_pay'
  // Fintechs
  | 'paypal'
  | 'venmo'
  | 'cashapp'
  | 'wise'
  | 'revolut'
  | 'chime'
  // Banks
  | 'chase'
  | 'bofa'
  | 'wells_fargo'
  | 'goldman'
  | 'barclays'
  | 'hsbc'
  | 'capital_one'
  | 'citi'
  | 'us_bank'
  | 'pnc'
  | 'td'
  | 'truist'
  | 'usaa'
  | 'ally'
  // Investment platforms
  | 'schwab'
  | 'fidelity'
  | 'vanguard';

export type LogoCategory = 'card-network' | 'fintech' | 'bank' | 'investment';

export type LogoEntry = {
  label: string;
  category: LogoCategory;
  source: ImageSourcePropType;
};

export const LOGO_REGISTRY: Record<LogoSlug, LogoEntry> = {
  // Card networks
  visa:        { label: 'Visa',             category: 'card-network', source: require('../../assets/logos/visa.png') },
  mastercard:  { label: 'Mastercard',       category: 'card-network', source: require('../../assets/logos/mastercard.png') },
  amex:        { label: 'American Express', category: 'card-network', source: require('../../assets/logos/amex.png') },
  discover:    { label: 'Discover',         category: 'card-network', source: require('../../assets/logos/discover.png') },
  diners:      { label: 'Diners Club',      category: 'card-network', source: require('../../assets/logos/diners.png') },
  jcb:         { label: 'JCB',              category: 'card-network', source: require('../../assets/logos/jcb.png') },
  apple_pay:   { label: 'Apple Pay',        category: 'card-network', source: require('../../assets/logos/apple_pay.png') },
  google_pay:  { label: 'Google Pay',       category: 'card-network', source: require('../../assets/logos/google_pay.png') },

  // Fintechs
  paypal:      { label: 'PayPal',           category: 'fintech',      source: require('../../assets/logos/paypal.png') },
  venmo:       { label: 'Venmo',            category: 'fintech',      source: require('../../assets/logos/venmo.png') },
  cashapp:     { label: 'Cash App',         category: 'fintech',      source: require('../../assets/logos/cashapp.png') },
  wise:        { label: 'Wise',             category: 'fintech',      source: require('../../assets/logos/wise.png') },
  revolut:     { label: 'Revolut',          category: 'fintech',      source: require('../../assets/logos/revolut.png') },
  chime:       { label: 'Chime',            category: 'fintech',      source: require('../../assets/logos/chime.png') },

  // Banks
  chase:       { label: 'Chase',            category: 'bank',         source: require('../../assets/logos/chase.png') },
  bofa:        { label: 'Bank of America',  category: 'bank',         source: require('../../assets/logos/bofa.png') },
  wells_fargo: { label: 'Wells Fargo',      category: 'bank',         source: require('../../assets/logos/wells_fargo.png') },
  goldman:     { label: 'Goldman Sachs',    category: 'investment',   source: require('../../assets/logos/goldman.png') },
  barclays:    { label: 'Barclays',         category: 'bank',         source: require('../../assets/logos/barclays.png') },
  hsbc:        { label: 'HSBC',             category: 'bank',         source: require('../../assets/logos/hsbc.png') },
  capital_one: { label: 'Capital One',      category: 'bank',         source: require('../../assets/logos/capital_one.png') },
  citi:        { label: 'Citi',             category: 'bank',         source: require('../../assets/logos/citi.png') },
  us_bank:     { label: 'U.S. Bank',        category: 'bank',         source: require('../../assets/logos/us_bank.png') },
  pnc:         { label: 'PNC',              category: 'bank',         source: require('../../assets/logos/pnc.png') },
  td:          { label: 'TD Bank',          category: 'bank',         source: require('../../assets/logos/td.png') },
  truist:      { label: 'Truist',           category: 'bank',         source: require('../../assets/logos/truist.png') },
  usaa:        { label: 'USAA',             category: 'bank',         source: require('../../assets/logos/usaa.png') },
  ally:        { label: 'Ally',             category: 'bank',         source: require('../../assets/logos/ally.png') },

  // Investment platforms
  schwab:      { label: 'Charles Schwab',   category: 'investment',   source: require('../../assets/logos/schwab.png') },
  fidelity:    { label: 'Fidelity',         category: 'investment',   source: require('../../assets/logos/fidelity.png') },
  vanguard:    { label: 'Vanguard',         category: 'investment',   source: require('../../assets/logos/vanguard.png') },
};

export const ALL_LOGO_SLUGS = Object.keys(LOGO_REGISTRY) as LogoSlug[];

export function logosByCategory(category: LogoCategory): LogoSlug[] {
  return ALL_LOGO_SLUGS.filter((slug) => LOGO_REGISTRY[slug].category === category);
}
