const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const credentialsPath = process.env.FIREBASE_CREDENTIALS_PATH || 'serviceAccountKey.json';
let firebaseInitialized = false;

try {
    const absoluteCredPath = path.resolve(__dirname, '..', credentialsPath);
    if (fs.existsSync(absoluteCredPath)) {
        const serviceAccount = require(absoluteCredPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        firebaseInitialized = true;
        console.log('Firebase Admin SDK initialized successfully.');
    } else {
        console.warn(
            `Firebase service account not found at '${absoluteCredPath}'. ` +
            'FCM alerts will operate in SIMULATOR/MOCK mode (logging to console).'
        );
    }
} catch (e) {
    console.error('Failed to initialize Firebase Admin SDK. Operating in SIMULATOR mode.', e);
}

async function sendMulticastNotification(title, body, tokens) {
    if (!tokens || tokens.length === 0) {
        return { successCount: 0, failureCount: 0, message: 'No tokens provided.' };
    }

    console.log(`[FCM BROADCAST] Title: "${title}" | Body: "${body.replace(/\n/g, ' ')}" | Token Count: ${tokens.length}`);

    if (!firebaseInitialized) {
        console.log('[FCM SIMULATOR] Dispatched simulated push alert successfully to tokens: ', tokens);
        return { successCount: tokens.length, failureCount: 0, simulated: true };
    }

    try {
        const payload = {
            notification: {
                title: title,
                body: body
            },
            tokens: tokens
        };

        const response = await admin.messaging().sendEachForMulticast(payload);
        console.log(`FCM Multicast complete: ${response.successCount} sent, ${response.failureCount} failed.`);
        return {
            successCount: response.successCount,
            failureCount: response.failureCount,
            simulated: false
        };
    } catch (e) {
        console.error('Error sending FCM multicast alerts: ', e);
        return { successCount: 0, failureCount: tokens.length, error: e.message };
    }
}

async function notifyUsersForJob(job, users) {
    const recipientTokens = [];

    users.forEach(user => {
        if (!user.fcmToken) return;

        // In Mongoose, array fields are native JS arrays
        const subscribedStates = user.states || [];
        const subscribedOrgs = user.organizations || [];
        const subscribedQuals = user.qualifications || [];

        const matchState = subscribedStates.length === 0 || subscribedStates.includes(job.state);
        const matchOrg = subscribedOrgs.length === 0 || subscribedOrgs.includes(job.organization);
        
        // Qualification match (case insensitive contains checks)
        const matchQual = subscribedQuals.length === 0 || !job.qualification || subscribedQuals.some(q => 
            (job.qualification || '').toLowerCase().includes(q.toLowerCase())
        );

        if (matchState && matchOrg && matchQual) {
            recipientTokens.push(user.fcmToken);
        }
    });

    if (recipientTokens.length === 0) {
        console.log(`No users matched preferences for job notification: ${job.title} (${job.organization})`);
        return 0;
    }

    // Format Alert Body
    const title = `🔥 New ${job.organization} Recruitment Released`;
    
    let lastDateStr = 'Refer official announcement';
    if (job.application_last_date) {
        try {
            const dateObj = new Date(job.application_last_date);
            const options = { day: 'numeric', month: 'short', year: 'numeric' };
            lastDateStr = dateObj.toLocaleDateString('en-IN', options);
        } catch (e) {}
    }
    
    const vacanciesStr = job.vacancies ? job.vacancies.toLocaleString('en-IN') : 'Not Specified';

    const body = 
        `Organization: ${job.organization}\n` +
        `Posts: ${vacanciesStr}\n` +
        `Last Date: ${lastDateStr}\n\n` +
        `Tap to view details.`;

    const result = await sendMulticastNotification(title, body, recipientTokens);
    return result.successCount || 0;
}

module.exports = {
    sendMulticastNotification,
    notifyUsersForJob
};
