export interface AddressDetails {
  house_no?: string;
  moo?: string;
  soi?: string;
  village?: string;
  road?: string;
  sub_district?: string;
  district?: string;
  province?: string;
  country?: string;
  zip_code?: string;
  hidden?: boolean;
}

/**
 * Fallback when neither Baserow nor PRIVATE_ADDRESS_JSON env var is provided.
 * Contains ZERO sensitive street details in the git repository.
 */
export const defaultPrivateAddress: Record<'en' | 'th', AddressDetails> = {
  en: {
    province: 'Nonthaburi',
    country: 'Thailand'
  },
  th: {
    province: 'นนทบุรี',
    country: 'ไทย'
  }
};
