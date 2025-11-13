const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjM4MTQ2NywidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDBmQTgzNzk3MGZDNGM0YTNmZGI0OUQ0MEIzNTY2YjMwMzg1NzU5NjcifQ",
    payload: "eyJkb21haW4iOiJkYXJldXAudmVyY2VsLmFwcCJ9",
    signature: "MHhhY2NlN2UwZTcyMjJkMDM4NTU0MDc1YTM3NmMzZmUyYzdhZWU0YTdmYzc3OWFhZmQ4Mjk3MzNjNjYxMmVhMWQwNGZiM2RjNTQ4OTBjZGM1OWY3NTI0YmRmNzNlZGRmY2RjMGE5OWUwMWI2NTZkMmVkODQ1NTk4YzZiMzY3YzExMTFi"
  },
  miniapp: {
    version: "1",
    name: "DareUp",
    subtitle: "Community Challenges on Farcaster",
    description: "Accept dares, submit proofs, win rewards",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: "https://api.neynar.com/f/app/71b2ec3e-f75b-4917-b178-06bd17051bcd/event",
    primaryCategory: "social",
    tags: ["social", "games", "challenges", "community"],
    heroImageUrl: `${ROOT_URL}/blue-hero.png`, 
    tagline: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`,
  },
} as const;
