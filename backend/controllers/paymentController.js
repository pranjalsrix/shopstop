
const Razorpay = require('razorpay');
const crypto = require('crypto');

const createOrder = async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({
        message: 'Razorpay is not configured. Check the backend environment variables.',
      });
    }

    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: 'A valid payment amount is required.',
      });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await instance.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `shopstop_${Date.now()}`,
    });

    return res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
    });
  } catch (error) {
    console.error('Razorpay order creation failed:', error.message);

    return res.status(500).json({
      message: 'Unable to initialize payment. Check your Razorpay test credentials and backend logs.',
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return res.status(500).json({
        message: 'Payment verification is not configured on the server.',
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: 'Required payment verification details are missing.',
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const receivedBuffer = Buffer.from(razorpay_signature, 'hex');

    const valid =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!valid) {
      return res.status(400).json({
        message: 'Payment signature is invalid.',
      });
    }

    return res.status(200).json({
      message: 'Payment verified successfully.',
    });
  } catch (error) {
    console.error('Payment verification failed:', error.message);

    return res.status(500).json({
      message: 'Unable to verify payment.',
    });
  }
};

module.exports = { createOrder, verifyPayment };
