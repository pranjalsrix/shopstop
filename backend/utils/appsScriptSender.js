async function sendWithAppsScript(email, otp, options = {}) {
    const url = process.env.GOOGLE_APPS_SCRIPT_URL;
    const secret = process.env.GOOGLE_APPS_SCRIPT_SECRET;

    if (!url || !secret) {
        throw new Error('Google Apps Script configuration is missing');
    }

    const isOTP = otp !== null && otp !== undefined && String(otp) !== '';

    const payload = {
        secret,
        to: email,
        subject: options.subject || (
            isOTP ? `Your ShopStop OTP: ${otp}` : 'ShopStop notification'
        ),
        text: options.text || (
            isOTP
                ? `Your ShopStop code is ${otp}. It expires in 5 minutes.`
                : ''
        ),
        html: options.html || ''
    };

    if (isOTP) {
        payload.otp = String(otp);
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
        throw new Error(`Apps Script returned HTTP ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.error || 'Apps Script email failed');
    }
}

module.exports = { sendWithAppsScript };