
const { sendWithNodemailer } = require('./nodemailerSender');
const { sendWithAppsScript } = require('./appsScriptSender');

async function sendOTPEmail(email, otp) {
  try {
    await sendWithNodemailer(email, otp);
    console.log('ShopStop OTP sent through Nodemailer');
    return;
  } catch (primaryError) {
    console.warn(
      'Nodemailer failed; trying Apps Script:',
      primaryError.code || primaryError.message
    );
  }

  try {
    await sendWithAppsScript(email, otp);
    console.log('ShopStop OTP sent through Apps Script');
  } catch (fallbackError) {
    console.error('Both email providers failed:', fallbackError.message);
    throw new Error('Email delivery failed');
  }
}

module.exports = { sendOTPEmail };
