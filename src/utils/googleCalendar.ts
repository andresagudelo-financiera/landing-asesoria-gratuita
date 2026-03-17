

export async function getCoachesAvailability(coachEmails: string[], startDateISO: string, endDateISO: string): Promise<Record<string, any[]>> {
    const accessToken = await getGoogleAccessToken();

    const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            timeMin: startDateISO,
            timeMax: endDateISO,
            items: coachEmails.map(email => ({ id: email })),
            timeZone: 'America/Bogota'
        })
    });

    if (!response.ok) {
        throw new Error(`FreeBusy check failed: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    const result: Record<string, any[]> = {};
    for (const email of coachEmails) {
        result[email] = data.calendars[email]?.busy || [];
    }
    return result;
}

export async function checkCoachAvailability(coachEmail: string, dateStr: string): Promise<any[]> {
    const accessToken = await getGoogleAccessToken();

    // Convert YYYY-MM-DD to start and end
    const startDate = new Date(`${dateStr}T00:00:00-05:00`);
    const endDate = new Date(`${dateStr}T23:59:59-05:00`);

    const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            timeMin: startDate.toISOString(),
            timeMax: endDate.toISOString(),
            items: [{ id: coachEmail }],
            timeZone: 'America/Bogota'
        })
    });

    if (!response.ok) {
        throw new Error(`FreeBusy check failed: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    return data.calendars[coachEmail]?.busy || [];
}

export async function createGoogleMeetEvent(coachEmail: string, studentEmail: string, date: string, time: string, studentName: string) {
    const accessToken = await getGoogleAccessToken();

    // Format start time
    // `time` is like "14:00" or "09:30"
    const startTimeStr = `${date}T${time}:00-05:00`;
    const startDate = new Date(startTimeStr);

    // Add 45 minutes for duration
    const endDate = new Date(startDate.getTime() + 45 * 60 * 1000);

    const eventPayload = {
        summary: `Asesoría Gratuita - ${studentName}`,
        description: `Asesoría Gratuita. Contacto: ${studentEmail}`,
        start: {
            dateTime: startDate.toISOString(),
            timeZone: 'America/Bogota'
        },
        end: {
            dateTime: endDate.toISOString(),
            timeZone: 'America/Bogota'
        },
        attendees: [
            { email: coachEmail, responseStatus: 'accepted' },
            { email: studentEmail }
        ],
        conferenceData: {
            createRequest: {
                requestId: Math.random().toString(36).substring(7),
                conferenceSolutionKey: {
                    type: "hangoutsMeet"
                }
            }
        },
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 15 }
            ]
        }
    };

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventPayload)
    });

    if (!response.ok) {
        throw new Error(`Failed to create calendar event: ${response.status} - ${await response.text()}`);
    }

    return await response.json();
}

const CLIENT_ID = import.meta.env?.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env?.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = import.meta.env?.GOOGLE_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

let currentAccessToken = '';
let tokenExpirationTime = 0;

export async function getGoogleAccessToken() {
    if (currentAccessToken && Date.now() < tokenExpirationTime) {
        return currentAccessToken;
    }

    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                refresh_token: REFRESH_TOKEN,
                grant_type: 'refresh_token',
                redirect_uri: REDIRECT_URI
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Failed to refresh token: ${response.status} - ${errBody}`);
        }

        const data = await response.json();
        currentAccessToken = data.access_token;
        // Expire 5 minutes early to be safe
        tokenExpirationTime = Date.now() + (data.expires_in - 300) * 1000;

        return currentAccessToken;
    } catch (err) {
        console.error("Error obtaining Google token:", err);
        throw err;
    }
}
