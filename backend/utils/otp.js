
const crypto = require('crypto');

const otpStore = new Map();

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RATE_LIMIT_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 3;
const MAX_ATTEMPTS = 5;

function generateOTP() {
    return crypto.randomInt(100000, 1000000).toString();
}

function saveOTP(email) {
    const now = Date.now();
    const existing = otpStore.get(email);

    let windowStart = existing?.windowStart ?? now;
    let count = existing?.count ?? 0;

    if (existing && now - windowStart >= RATE_LIMIT_MS) {
        windowStart = now;
        count = 0;
    }

    if (count >= MAX_REQUESTS) {
        const waitMin = Math.ceil(
            (RATE_LIMIT_MS - (now - windowStart)) / 60000
        );

        throw new Error(
            `Too many OTP requests. Try again in ${waitMin} minute(s).`
        );
    }

    const otp = generateOTP();

    otpStore.set(email, {
        otp,
        expiresAt: now + OTP_EXPIRY_MS,
        count: count + 1,
        windowStart,
        attempts: 0,
    });

    return otp;
}

function verifyOTP(email, inputOtp) {
    const entry = otpStore.get(email);

    if (!entry) {
        return {
            valid: false,
            reason: 'No OTP found. Please register or request a new OTP.',
        };
    }

    if (Date.now() >= entry.expiresAt) {
        otpStore.delete(email);

        return {
            valid: false,
            reason: 'OTP has expired. Please request a new one.',
        };
    }

    if (entry.attempts >= MAX_ATTEMPTS) {
        otpStore.delete(email);

        return {
            valid: false,
            reason: 'Too many incorrect attempts. Please request a new OTP.',
        };
    }

    if (entry.otp !== String(inputOtp).trim()) {
        entry.attempts += 1;

        return {
            valid: false,
            reason: 'Invalid OTP. Please try again.',
        };
    }

    otpStore.delete(email);

    return { valid: true };
}

module.exports = { saveOTP, verifyOTP };
