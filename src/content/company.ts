import type { LocalizedString } from './products';

export interface SocialLink {
  platform: string;
  url: string;
  label: string;
}

export interface CompanyProfile {
  name: string;
  masthead: string;
  studioDateline: string;
  tagline: LocalizedString;
  email: string;
  phoneDisplay: string;
  phoneHref: string;
  address: LocalizedString;
  socials: SocialLink[];
  logoLight: string;
  logoDark: string;
}

export const company: CompanyProfile = {
  name: 'RideLink Techs',
  masthead: 'RideLink  Techs',
  studioDateline: 'Đà Nẵng, Việt Nam',
  tagline: {
    vi: 'Công ty phần mềm độc lập, làm tại Đà Nẵng.',
    en: 'An independent software company, based in Da Nang.',
  },
  email: 'support@ridelinktechs.com',
  phoneDisplay: '0967329308',
  phoneHref: '+84967329308',
  address: {
    vi: '14 Tân Thái 1, Phường Sơn Trà, Thành phố Đà Nẵng, Việt Nam',
    en: '14 Tan Thai 1, Son Tra Ward, Da Nang City, Vietnam',
  },
  socials: [
    {
      platform: 'facebook',
      url: 'https://www.facebook.com/ridelinktechs',
      label: 'Facebook',
    },
  ],
  logoLight: '/logo/logo-light.webp',
  logoDark: '/logo/logo-dark.webp',
};
