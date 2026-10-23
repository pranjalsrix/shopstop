
const nodemailer = require('nodemailer');
const { createOTPEmail } = require('./emailTemplate');

async function sendWithNodemailer(email, otp) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Email credentials are missing');
    }

    const { subject, html, text } = createOTPEmail(otp);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
    });

    try {
        await transporter.sendMail({
            from: `"ShopStop" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            text,
            html,
        });
    } finally {
        transporter.close();
    }
}

module.exports = { sendWithNodemailer };
