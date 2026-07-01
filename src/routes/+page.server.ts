import { env } from '$env/dynamic/private';
import profileEn from '$lib/data/profile_en.json';
import profileTh from '$lib/data/profile_th.json';

export async function load({ url }) {
    const lang = url.searchParams.get('lang') === 'th' ? 'th' : 'en';
    const token = url.searchParams.get('token');

    // Deep clone the imported JSON so we can safely mutate it
    const profile = JSON.parse(JSON.stringify(lang === 'th' ? profileTh : profileEn));

    const expectedToken = env.SECRET_TOKEN || '0fcd3396-6726-4e47-9a6e-807f0abd70a7';

    if (token !== expectedToken) {
        // Hide sensitive information when the token is missing or invalid
        if (profile?.intro?.location) {
            profile.intro.location = {
                country: profile.intro.location.country || "Thailand",
                province: profile.intro.location.province || "Nonthaburi",
                hidden: true // Added flag so UI can potentially indicate it's hidden
            };
        }
    }

    return { profile, lang };
}