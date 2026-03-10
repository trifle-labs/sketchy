const FIREBASE_API_KEY = 'AIzaSyC2-fomLqgCjb7ELwta1I9cEarPK8ziTGs';
const REFRESH_BUFFER_MS = 5 * 60 * 1000; // refresh 5 min before expiry

let cachedToken: string | null = null;
let expiresAt = 0;

export async function getComfyOrgToken(): Promise<string> {
  if (cachedToken && Date.now() < expiresAt - REFRESH_BUFFER_MS) {
    return cachedToken;
  }

  const email = process.env.COMFY_EMAIL;
  const password = process.env.COMFY_PASSWORD;

  if (!email || !password) {
    // Fall back to static token from env
    const staticToken = process.env.COMFY_ORG_TOKEN;
    if (!staticToken) throw new Error('No Comfy auth configured. Set COMFY_EMAIL+COMFY_PASSWORD or COMFY_ORG_TOKEN in .env');
    return staticToken;
  }

  console.log('Fetching fresh Comfy auth token...');

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );

  if (!res.ok) {
    throw new Error(`Firebase auth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json() as { idToken: string; expiresIn: string };
  cachedToken = data.idToken;
  expiresAt = Date.now() + parseInt(data.expiresIn, 10) * 1000;

  console.log(`Comfy auth token refreshed, valid for ${Math.round(parseInt(data.expiresIn) / 60)} min`);
  return cachedToken;
}
