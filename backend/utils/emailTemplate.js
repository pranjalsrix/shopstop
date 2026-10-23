
function createOTPEmail(otp) {
    return {
        subject: `Your ShopStop verification code: ${otp}`,

        text: `Your ShopStop verification code is ${otp}. It expires in 5 minutes. If you did not request this, you can ignore this email.`,

        html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #111827; font-size: 24px;">
          Welcome to ShopStop!
        </h2>

        <p style="color: #4b5563;">
          Use the verification code below to verify your email address.
        </p>

        <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; text-align: center;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;">
            ${otp}
          </span>
        </div>

        <p style="color: #6b7280; margin-top: 24px;">
          This code expires in 5 minutes.
        </p>

        <p style="color: #9ca3af; font-size: 12px;">
          If you did not request this code, you can ignore this email.
        </p>

        <p style="color: #9ca3af; font-size: 12px;">
          &mdash; The ShopStop Team
        </p>
      </div>
    `,
    };
}

module.exports = { createOTPEmail };
