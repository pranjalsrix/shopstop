const { sendWithAppsScript } = require('./appsScriptSender');

async function sendEmail({ email, subject, message, text }) {
    if (!email || !subject || (!message && !text)) {
        throw new Error('Email, subject and message are required');
    }

    await sendWithAppsScript(email, null, {
        subject,
        html: message || '',
        text: text || ''
    });
}

module.exports = sendEmail;