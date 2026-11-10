// country.service.js
// Provides comprehensive international country codes, dialing prefixes, flags, and low-latency geo-detection

export function getFlagEmoji(iso) {
  if (!iso || iso.length !== 2) return '🌐';
  try {
    return String.fromCodePoint(...[...iso.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
  } catch {
    return '🌐';
  }
}

export function getFlagUrl(iso) {
  if (!iso || iso.length !== 2) return null;
  return `https://flagcdn.com/w40/${iso.toLowerCase()}.png`;
}

// Master registry of world countries with ISO-3166-1 alpha-2, country name, dial code, and standard format placeholder
export const COUNTRIES = [
  // Frequently selected / popular countries
  { iso2: 'US', name: 'United States', dial: '+1', placeholder: '(555) 000-0000', priority: true },
  { iso2: 'GB', name: 'United Kingdom', dial: '+44', placeholder: '7911 123456', priority: true },
  { iso2: 'CA', name: 'Canada', dial: '+1', placeholder: '(555) 000-0000', priority: true },
  { iso2: 'IN', name: 'India', dial: '+91', placeholder: '98765 43210', priority: true },
  { iso2: 'AU', name: 'Australia', dial: '+61', placeholder: '412 345 678', priority: true },
  { iso2: 'DE', name: 'Germany', dial: '+49', placeholder: '1512 3456789', priority: true },
  { iso2: 'FR', name: 'France', dial: '+33', placeholder: '6 12 34 56 78', priority: true },
  { iso2: 'AE', name: 'United Arab Emirates', dial: '+971', placeholder: '50 123 4567', priority: true },
  { iso2: 'SG', name: 'Singapore', dial: '+65', placeholder: '8123 4567', priority: true },

  // All countries sorted alphabetically
  { iso2: 'AF', name: 'Afghanistan', dial: '+93', placeholder: '70 123 4567' },
  { iso2: 'AL', name: 'Albania', dial: '+355', placeholder: '67 212 3456' },
  { iso2: 'DZ', name: 'Algeria', dial: '+213', placeholder: '551 23 45 67' },
  { iso2: 'AD', name: 'Andorra', dial: '+376', placeholder: '312 345' },
  { iso2: 'AO', name: 'Angola', dial: '+244', placeholder: '923 123 456' },
  { iso2: 'AG', name: 'Antigua and Barbuda', dial: '+1268', placeholder: '464 1234' },
  { iso2: 'AR', name: 'Argentina', dial: '+54', placeholder: '9 11 2345-6789' },
  { iso2: 'AM', name: 'Armenia', dial: '+374', placeholder: '77 123456' },
  { iso2: 'AT', name: 'Austria', dial: '+43', placeholder: '664 123456' },
  { iso2: 'AZ', name: 'Azerbaijan', dial: '+994', placeholder: '50 123 45 67' },
  { iso2: 'BS', name: 'Bahamas', dial: '+1242', placeholder: '359 1234' },
  { iso2: 'BH', name: 'Bahrain', dial: '+973', placeholder: '3600 1234' },
  { iso2: 'BD', name: 'Bangladesh', dial: '+880', placeholder: '1712-345678' },
  { iso2: 'BB', name: 'Barbados', dial: '+1246', placeholder: '230 1234' },
  { iso2: 'BY', name: 'Belarus', dial: '+375', placeholder: '29 123-45-67' },
  { iso2: 'BE', name: 'Belgium', dial: '+32', placeholder: '470 12 34 56' },
  { iso2: 'BZ', name: 'Belize', dial: '+501', placeholder: '622-1234' },
  { iso2: 'BJ', name: 'Benin', dial: '+229', placeholder: '97 12 34 56' },
  { iso2: 'BM', name: 'Bermuda', dial: '+1441', placeholder: '505 1234' },
  { iso2: 'BT', name: 'Bhutan', dial: '+975', placeholder: '17 12 34 56' },
  { iso2: 'BO', name: 'Bolivia', dial: '+591', placeholder: '71234567' },
  { iso2: 'BA', name: 'Bosnia and Herzegovina', dial: '+387', placeholder: '61 123 456' },
  { iso2: 'BW', name: 'Botswana', dial: '+267', placeholder: '71 234 567' },
  { iso2: 'BR', name: 'Brazil', dial: '+55', placeholder: '(11) 91234-5678' },
  { iso2: 'BN', name: 'Brunei', dial: '+673', placeholder: '712 3456' },
  { iso2: 'BG', name: 'Bulgaria', dial: '+359', placeholder: '87 123 4567' },
  { iso2: 'BF', name: 'Burkina Faso', dial: '+226', placeholder: '70 12 34 56' },
  { iso2: 'BI', name: 'Burundi', dial: '+257', placeholder: '79 12 34 56' },
  { iso2: 'KH', name: 'Cambodia', dial: '+855', placeholder: '12 345 678' },
  { iso2: 'CM', name: 'Cameroon', dial: '+237', placeholder: '6 71 23 45 67' },
  { iso2: 'CV', name: 'Cape Verde', dial: '+238', placeholder: '991 12 34' },
  { iso2: 'KY', name: 'Cayman Islands', dial: '+1345', placeholder: '925 1234' },
  { iso2: 'CF', name: 'Central African Republic', dial: '+236', placeholder: '75 12 34 56' },
  { iso2: 'TD', name: 'Chad', dial: '+235', placeholder: '66 12 34 56' },
  { iso2: 'CL', name: 'Chile', dial: '+56', placeholder: '9 1234 5678' },
  { iso2: 'CN', name: 'China', dial: '+86', placeholder: '138 0013 8000' },
  { iso2: 'CO', name: 'Colombia', dial: '+57', placeholder: '300 1234567' },
  { iso2: 'KM', name: 'Comoros', dial: '+269', placeholder: '321 23 45' },
  { iso2: 'CG', name: 'Congo', dial: '+242', placeholder: '06 123 4567' },
  { iso2: 'CD', name: 'Congo, Democratic Republic', dial: '+243', placeholder: '812 345 678' },
  { iso2: 'CR', name: 'Costa Rica', dial: '+506', placeholder: '8312 3456' },
  { iso2: 'CI', name: "Cote d'Ivoire", dial: '+225', placeholder: '07 12 34 56' },
  { iso2: 'HR', name: 'Croatia', dial: '+385', placeholder: '91 234 5678' },
  { iso2: 'CU', name: 'Cuba', dial: '+53', placeholder: '5 1234567' },
  { iso2: 'CY', name: 'Cyprus', dial: '+357', placeholder: '96 123456' },
  { iso2: 'CZ', name: 'Czech Republic', dial: '+420', placeholder: '601 123 456' },
  { iso2: 'DK', name: 'Denmark', dial: '+45', placeholder: '20 12 34 56' },
  { iso2: 'DJ', name: 'Djibouti', dial: '+253', placeholder: '77 12 34 56' },
  { iso2: 'DM', name: 'Dominica', dial: '+1767', placeholder: '275 1234' },
  { iso2: 'DO', name: 'Dominican Republic', dial: '+1809', placeholder: '234 5678' },
  { iso2: 'EC', name: 'Ecuador', dial: '+593', placeholder: '99 123 4567' },
  { iso2: 'EG', name: 'Egypt', dial: '+20', placeholder: '100 123 4567' },
  { iso2: 'SV', name: 'El Salvador', dial: '+503', placeholder: '7012 3456' },
  { iso2: 'GQ', name: 'Equatorial Guinea', dial: '+240', placeholder: '222 123 456' },
  { iso2: 'ER', name: 'Eritrea', dial: '+291', placeholder: '7 123456' },
  { iso2: 'EE', name: 'Estonia', dial: '+372', placeholder: '5123 4567' },
  { iso2: 'ET', name: 'Ethiopia', dial: '+251', placeholder: '91 123 4567' },
  { iso2: 'FJ', name: 'Fiji', dial: '+679', placeholder: '701 2345' },
  { iso2: 'FI', name: 'Finland', dial: '+358', placeholder: '40 1234567' },
  { iso2: 'GA', name: 'Gabon', dial: '+241', placeholder: '06 12 34 56' },
  { iso2: 'GM', name: 'Gambia', dial: '+220', placeholder: '701 2345' },
  { iso2: 'GE', name: 'Georgia', dial: '+995', placeholder: '555 12 34 56' },
  { iso2: 'GH', name: 'Ghana', dial: '+233', placeholder: '24 123 4567' },
  { iso2: 'GR', name: 'Greece', dial: '+30', placeholder: '691 234 5678' },
  { iso2: 'GD', name: 'Grenada', dial: '+1473', placeholder: '403 1234' },
  { iso2: 'GT', name: 'Guatemala', dial: '+502', placeholder: '5123 4567' },
  { iso2: 'GN', name: 'Guinea', dial: '+224', placeholder: '621 12 34 56' },
  { iso2: 'GW', name: 'Guinea-Bissau', dial: '+245', placeholder: '955 12 34' },
  { iso2: 'GY', name: 'Guyana', dial: '+592', placeholder: '609 1234' },
  { iso2: 'HT', name: 'Haiti', dial: '+509', placeholder: '34 12 3456' },
  { iso2: 'HN', name: 'Honduras', dial: '+504', placeholder: '9123-4567' },
  { iso2: 'HK', name: 'Hong Kong', dial: '+852', placeholder: '9123 4567' },
  { iso2: 'HU', name: 'Hungary', dial: '+36', placeholder: '20 123 4567' },
  { iso2: 'IS', name: 'Iceland', dial: '+354', placeholder: '611 1234' },
  { iso2: 'ID', name: 'Indonesia', dial: '+62', placeholder: '812-3456-7890' },
  { iso2: 'IR', name: 'Iran', dial: '+98', placeholder: '912 345 6789' },
  { iso2: 'IQ', name: 'Iraq', dial: '+964', placeholder: '790 123 4567' },
  { iso2: 'IE', name: 'Ireland', dial: '+353', placeholder: '85 123 4567' },
  { iso2: 'IL', name: 'Israel', dial: '+972', placeholder: '50-123-4567' },
  { iso2: 'IT', name: 'Italy', dial: '+39', placeholder: '312 345 6789' },
  { iso2: 'JM', name: 'Jamaica', dial: '+1876', placeholder: '351 1234' },
  { iso2: 'JP', name: 'Japan', dial: '+81', placeholder: '90-1234-5678' },
  { iso2: 'JO', name: 'Jordan', dial: '+962', placeholder: '7 9012 3456' },
  { iso2: 'KZ', name: 'Kazakhstan', dial: '+7', placeholder: '701 123 4567' },
  { iso2: 'KE', name: 'Kenya', dial: '+254', placeholder: '712 345678' },
  { iso2: 'KW', name: 'Kuwait', dial: '+965', placeholder: '6012 3456' },
  { iso2: 'KG', name: 'Kyrgyzstan', dial: '+996', placeholder: '700 123 456' },
  { iso2: 'LA', name: 'Laos', dial: '+856', placeholder: '20 22 123 456' },
  { iso2: 'LV', name: 'Latvia', dial: '+371', placeholder: '21 234 567' },
  { iso2: 'LB', name: 'Lebanon', dial: '+961', placeholder: '70 123 456' },
  { iso2: 'LS', name: 'Lesotho', dial: '+266', placeholder: '5012 3456' },
  { iso2: 'LR', name: 'Liberia', dial: '+231', placeholder: '77 012 3456' },
  { iso2: 'LY', name: 'Libya', dial: '+218', placeholder: '91 234 5678' },
  { iso2: 'LI', name: 'Liechtenstein', dial: '+423', placeholder: '660 1234' },
  { iso2: 'LT', name: 'Lithuania', dial: '+370', placeholder: '612 34567' },
  { iso2: 'LU', name: 'Luxembourg', dial: '+352', placeholder: '621 123 456' },
  { iso2: 'MO', name: 'Macau', dial: '+853', placeholder: '6612 3456' },
  { iso2: 'MK', name: 'North Macedonia', dial: '+389', placeholder: '72 123 456' },
  { iso2: 'MG', name: 'Madagascar', dial: '+261', placeholder: '32 02 123 45' },
  { iso2: 'MW', name: 'Malawi', dial: '+265', placeholder: '99 123 4567' },
  { iso2: 'MY', name: 'Malaysia', dial: '+60', placeholder: '12-345 6789' },
  { iso2: 'MV', name: 'Maldives', dial: '+960', placeholder: '771-2345' },
  { iso2: 'ML', name: 'Mali', dial: '+223', placeholder: '65 12 34 56' },
  { iso2: 'MT', name: 'Malta', dial: '+356', placeholder: '9912 3456' },
  { iso2: 'MR', name: 'Mauritania', dial: '+222', placeholder: '22 12 34 56' },
  { iso2: 'MU', name: 'Mauritius', dial: '+230', placeholder: '5251 2345' },
  { iso2: 'MX', name: 'Mexico', dial: '+52', placeholder: '55 1234 5678' },
  { iso2: 'MD', name: 'Moldova', dial: '+373', placeholder: '621 12 345' },
  { iso2: 'MC', name: 'Monaco', dial: '+377', placeholder: '6 12 34 56 78' },
  { iso2: 'MN', name: 'Mongolia', dial: '+976', placeholder: '8812 3456' },
  { iso2: 'ME', name: 'Montenegro', dial: '+382', placeholder: '67 123 456' },
  { iso2: 'MA', name: 'Morocco', dial: '+212', placeholder: '612-345678' },
  { iso2: 'MZ', name: 'Mozambique', dial: '+258', placeholder: '84 123 4567' },
  { iso2: 'MM', name: 'Myanmar', dial: '+95', placeholder: '9 251 234 567' },
  { iso2: 'NA', name: 'Namibia', dial: '+264', placeholder: '81 123 4567' },
  { iso2: 'NP', name: 'Nepal', dial: '+977', placeholder: '984-1234567' },
  { iso2: 'NL', name: 'Netherlands', dial: '+31', placeholder: '6 12345678' },
  { iso2: 'NZ', name: 'New Zealand', dial: '+64', placeholder: '21 123 4567' },
  { iso2: 'NI', name: 'Nicaragua', dial: '+505', placeholder: '8712 3456' },
  { iso2: 'NE', name: 'Niger', dial: '+227', placeholder: '90 12 34 56' },
  { iso2: 'NG', name: 'Nigeria', dial: '+234', placeholder: '802 123 4567' },
  { iso2: 'NO', name: 'Norway', dial: '+47', placeholder: '412 34 567' },
  { iso2: 'OM', name: 'Oman', dial: '+968', placeholder: '9123 4567' },
  { iso2: 'PK', name: 'Pakistan', dial: '+92', placeholder: '301 2345678' },
  { iso2: 'PA', name: 'Panama', dial: '+507', placeholder: '6123-4567' },
  { iso2: 'PG', name: 'Papua New Guinea', dial: '+675', placeholder: '7012 3456' },
  { iso2: 'PY', name: 'Paraguay', dial: '+595', placeholder: '981 123456' },
  { iso2: 'PE', name: 'Peru', dial: '+51', placeholder: '912 345 678' },
  { iso2: 'PH', name: 'Philippines', dial: '+63', placeholder: '917 123 4567' },
  { iso2: 'PL', name: 'Poland', dial: '+48', placeholder: '512 345 678' },
  { iso2: 'PT', name: 'Portugal', dial: '+351', placeholder: '912 345 678' },
  { iso2: 'QA', name: 'Qatar', dial: '+974', placeholder: '3312 3456' },
  { iso2: 'RO', name: 'Romania', dial: '+40', placeholder: '712 345 678' },
  { iso2: 'RU', name: 'Russia', dial: '+7', placeholder: '912 345-67-89' },
  { iso2: 'RW', name: 'Rwanda', dial: '+250', placeholder: '788 123 456' },
  { iso2: 'SA', name: 'Saudi Arabia', dial: '+966', placeholder: '50 123 4567' },
  { iso2: 'SN', name: 'Senegal', dial: '+221', placeholder: '77 123 45 67' },
  { iso2: 'RS', name: 'Serbia', dial: '+381', placeholder: '60 1234567' },
  { iso2: 'SL', name: 'Sierra Leone', dial: '+232', placeholder: '76 123456' },
  { iso2: 'SK', name: 'Slovakia', dial: '+421', placeholder: '901 123 456' },
  { iso2: 'SI', name: 'Slovenia', dial: '+386', placeholder: '31 234 567' },
  { iso2: 'SO', name: 'Somalia', dial: '+252', placeholder: '61 2345678' },
  { iso2: 'ZA', name: 'South Africa', dial: '+27', placeholder: '71 123 4567' },
  { iso2: 'KR', name: 'South Korea', dial: '+82', placeholder: '10-1234-5678' },
  { iso2: 'ES', name: 'Spain', dial: '+34', placeholder: '612 34 56 78' },
  { iso2: 'LK', name: 'Sri Lanka', dial: '+94', placeholder: '71 234 5678' },
  { iso2: 'SD', name: 'Sudan', dial: '+249', placeholder: '91 234 5678' },
  { iso2: 'SE', name: 'Sweden', dial: '+46', placeholder: '70 123 45 67' },
  { iso2: 'CH', name: 'Switzerland', dial: '+41', placeholder: '78 123 45 67' },
  { iso2: 'TW', name: 'Taiwan', dial: '+886', placeholder: '912 345 678' },
  { iso2: 'TJ', name: 'Tajikistan', dial: '+992', placeholder: '91 812 3456' },
  { iso2: 'TZ', name: 'Tanzania', dial: '+255', placeholder: '712 345 678' },
  { iso2: 'TH', name: 'Thailand', dial: '+66', placeholder: '81 234 5678' },
  { iso2: 'TG', name: 'Togo', dial: '+228', placeholder: '90 12 34 56' },
  { iso2: 'TT', name: 'Trinidad and Tobago', dial: '+1868', placeholder: '291 1234' },
  { iso2: 'TN', name: 'Tunisia', dial: '+216', placeholder: '20 123 456' },
  { iso2: 'TR', name: 'Turkey', dial: '+90', placeholder: '501 234 56 78' },
  { iso2: 'UG', name: 'Uganda', dial: '+256', placeholder: '701 234567' },
  { iso2: 'UA', name: 'Ukraine', dial: '+380', placeholder: '50 123 4567' },
  { iso2: 'UY', name: 'Uruguay', dial: '+598', placeholder: '94 123 456' },
  { iso2: 'UZ', name: 'Uzbekistan', dial: '+998', placeholder: '90 123 45 67' },
  { iso2: 'VE', name: 'Venezuela', dial: '+58', placeholder: '412 1234567' },
  { iso2: 'VN', name: 'Vietnam', dial: '+84', placeholder: '91 234 56 78' },
  { iso2: 'YE', name: 'Yemen', dial: '+967', placeholder: '71 234 567' },
  { iso2: 'ZM', name: 'Zambia', dial: '+260', placeholder: '97 1234567' },
  { iso2: 'ZW', name: 'Zimbabwe', dial: '+263', placeholder: '71 234 5678' },
].map((item) => ({
  ...item,
  flagEmoji: getFlagEmoji(item.iso2),
  flagUrl: getFlagUrl(item.iso2),
}));

export const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.iso2 === 'US') || COUNTRIES[0];

// Memory cache for user's detected country
let detectedCountryCache = null;

/**
 * Fast asynchronous free geo-detection to detect user's country with low response time (<50ms).
 * Queries free APIs with 1.8s timeout and caches result in memory & localStorage.
 *
 * @returns {Promise<Object>} Detected country object or DEFAULT_COUNTRY
 */
export async function detectUserCountry() {
  if (detectedCountryCache) {
    return detectedCountryCache;
  }

  // Check client-side storage cache first (0ms latency)
  if (typeof window !== 'undefined' && window.localStorage) {
    const cachedIso = window.localStorage.getItem('leadora_user_country_iso');
    if (cachedIso) {
      const match = COUNTRIES.find((c) => c.iso2 === cachedIso.toUpperCase());
      if (match) {
        detectedCountryCache = match;
        return match;
      }
    }
  }

  // Asynchronous low-latency free API lookup
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    // ipwho.is is a free, high-speed, CORS-friendly geolocation API with <40ms response times
    const res = await fetch('https://ipwho.is/?fields=country_code,country_phone', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const iso = json.country_code;
      if (iso) {
        const match = COUNTRIES.find((c) => c.iso2 === iso.toUpperCase());
        if (match) {
          detectedCountryCache = match;
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('leadora_user_country_iso', match.iso2);
          }
          return match;
        }
      }
    }
  } catch {
    // Non-blocking fallback to default country
  }

  detectedCountryCache = DEFAULT_COUNTRY;
  return DEFAULT_COUNTRY;
}

/**
 * Searches countries by query matching name, dial code, or iso code
 */
export function searchCountries(query) {
  if (!query || !query.trim()) {
    return COUNTRIES;
  }
  const clean = query.trim().toLowerCase().replace(/^\+/, '');
  return COUNTRIES.filter((c) => {
    const nameMatch = c.name.toLowerCase().includes(clean);
    const isoMatch = c.iso2.toLowerCase().includes(clean);
    const dialClean = c.dial.replace(/^\+/, '');
    const dialMatch = dialClean.startsWith(clean) || c.dial.includes(clean);
    return nameMatch || isoMatch || dialMatch;
  });
}

/**
 * Parses full phone string (e.g. "+91 98765 43210" or "+1-555-0199") into { country, nationalNumber }
 */
export function parsePhoneNumber(rawPhone, fallbackCountry = DEFAULT_COUNTRY) {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return {
      country: fallbackCountry,
      nationalNumber: '',
    };
  }

  const trimmed = rawPhone.trim();

  // If string starts with '+', search matching country by dial code
  if (trimmed.startsWith('+')) {
    // Sort by dial code length descending so +1242 matches before +1
    const sortedByDial = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
    for (const c of sortedByDial) {
      if (trimmed.startsWith(c.dial)) {
        const nationalPart = trimmed.slice(c.dial.length).trim().replace(/^[\s-]+/, '');
        return {
          country: c,
          nationalNumber: nationalPart,
        };
      }
    }
  }

  return {
    country: fallbackCountry,
    nationalNumber: trimmed,
  };
}

/**
 * Formats full phone number combining dial code and national number
 */
export function formatFullPhone(country, nationalNumber) {
  if (!nationalNumber || !nationalNumber.trim()) {
    return '';
  }
  const cleanNational = nationalNumber.trim();
  // If national number already has +, return it directly
  if (cleanNational.startsWith('+')) {
    return cleanNational;
  }
  const dial = country?.dial || DEFAULT_COUNTRY.dial;
  return `${dial} ${cleanNational}`;
}

