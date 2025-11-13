const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

export async function sendNotification(fid: number, title: string, body: string) {
  if (!NEYNAR_API_KEY) {
    console.error('NEYNAR_API_KEY not configured');
    return;
  }

  try {
    const response = await fetch('https://api.neynar.com/v2/farcaster/notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': NEYNAR_API_KEY,
      },
      body: JSON.stringify({
        target_fid: fid,
        title,
        body,
        // Add other fields as needed
      }),
    });

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Notification sent:', result);
    return result;
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}
