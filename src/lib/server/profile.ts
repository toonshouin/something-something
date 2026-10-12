import type { IProfileResp } from '../../types/index';
import type { AddressDetails } from './privateAddress.ts';

export function visibleProfile(
  source: IProfileResp,
  revealAddress = false,
  privateAddress?: AddressDetails
): IProfileResp {
  const profile = structuredClone(source);
  if (revealAddress && privateAddress) {
    profile.intro.location = {
      ...privateAddress,
      province: (typeof source.intro.location === 'object' && source.intro.location.province) || privateAddress.province,
      country: (typeof source.intro.location === 'object' && source.intro.location.country) || privateAddress.country
    };
  } else {
    const loc = source.intro.location;
    profile.intro.location = typeof loc === 'string'
      ? { hidden: true }
      : { province: loc.province, country: loc.country, hidden: true };
  }

  profile.projects = profile.projects.filter((item) => !item.hide);
  profile.technologies = profile.technologies.filter((item) => !item.hide);
  profile.workExperiences = profile.workExperiences.filter((item) => !item.hide);
  profile.educations = profile.educations.filter((item) => !item.hide);
  profile.certifications = profile.certifications.filter((item) => !item.hide);
  return profile;
}
