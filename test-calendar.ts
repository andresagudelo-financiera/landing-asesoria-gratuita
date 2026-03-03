import { getGoogleAccessToken, checkCoachAvailability } from './src/utils/googleCalendar.ts';

async function test() {
    try {
        console.log("Getting token...");
        const token = await getGoogleAccessToken();
        console.log("Token starts with:", token.substring(0, 15));
        
        console.log("Testing availability for mariana.narvaez@financieramentecu.com...");
        const slots = await checkCoachAvailability('mariana.narvaez@financieramentecu.com', '2026-03-05');
        console.log("Result:", slots);
    } catch (e) {
        console.error("Test failed:", e.message);
    }
}

test();
