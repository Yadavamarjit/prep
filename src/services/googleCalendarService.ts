import { GOOGLE_OAUTH_SCOPES } from '../constants';

const CLIENT_ID = (import.meta as any).env.VITE_CLIENT_ID;

export const getAccessToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!(window as any).google) {
      reject(new Error('Google Identity Services not loaded'));
      return;
    }

    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: GOOGLE_OAUTH_SCOPES.join(' '),
        callback: (response: any) => {
          if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error('Failed to get access token: ' + (response.error || 'Unknown error')));
          }
        },
      });
      client.requestAccessToken();
    } catch (error) {
      reject(error);
    }
  });
};

export const syncGoogleEvents = async (accessToken: string) => {
  const timeMin = new Date().toISOString();
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  return data.items || [];
};

export const createGoogleEvent = async (accessToken: string, event: any) => {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });
    return res.json();
};
