import fs from 'node:fs';
import path from 'node:path';
import { env } from '$env/dynamic/private';

export async function load({ url }) {
    const lang = url.searchParams.get('lang') === 'th' ? 'th' : 'en';
    const token = url.searchParams.get('token');

    const fP = path.resolve(`src/lib/data/profile_${lang}.json`);
    let data;
    try {
        data = fs.readFileSync(fP, 'utf-8');
    } catch (e) {
        data = fs.readFileSync(path.resolve(`src/lib/data/profile_en.json`), 'utf-8');
    }

    const profile = JSON.parse(data);
    const expectedToken = env.SECRET_TOKEN || 'secure_token_123';

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