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
    subtitle: "Western-Style Community Challenges",
    description: "Accept daring challenges, submit epic proofs, win ETH rewards in this wild west of community dares!",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/A%20vintage%20western-st.png`,
    splashImageUrl: `${ROOT_URL}/A%20vintage%20western-st.png`,
    splashBackgroundColor: "#8B4513",
    homeUrl: ROOT_URL,
    webhookUrl: "https://api.neynar.com/f/app/71b2ec3e-f75b-4917-b178-06bd17051bcd/event",
    primaryCategory: "social",
    tags: ["social", "games", "challenges", "community", "rewards", "web3"],
    heroImageUrl: `${ROOT_URL}/A%20vintage%20western-st.png`,
    tagline: "Ride or Die: Community Dares for the Bold",
    ogTitle: "DareUp - Western-Style Community Challenges on Farcaster",
    ogDescription: "Join the wild west of community dares! Accept challenges, submit proofs, win ETH rewards. 🤠⚡",
    ogImageUrl: `${ROOT_URL}/A%20vintage%20western-st.png`,
  },
} as const;
