import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/auth.css';

const VerifyEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!/^\d{6}$/.test(otp)) {
            setError('Please enter the six-digit verification code.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    otp,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Email verification failed.');
                return;
            }

            if (!data.token) {
                setError('Verification succeeded, but no login token was returned.');
                return;
            }

            login(data);
            navigate('/');
        } catch (err) {
            setError('Unable to connect to the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError('');
        setMessage('');

        if (!email.trim()) {
            setError('Please enter your email address first.');
            return;
        }

        setResending(true);

        try {
            const res = await fetch('/api/auth/resend-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Could not resend the OTP.');
                return;
            }

            setOtp('');
            setMessage(data.message || 'A new OTP has been sent to your email.');
        } catch (err) {
            setError('Unable to connect to the server. Please try again.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Verify Your Email</h2>

                <p>Enter the six-digit code sent to your email address.</p>

                {error && (
                    <p role="alert" className="auth-error">
                        {error}
                    </p>
                )}

                {message && (
                    <p role="status" className="auth-success">
                        {message}
                    </p>
                )}

                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                />

                <input
                    type="text"
                    placeholder="Six-digit OTP"
                    value={otp}
                    onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                />

                <button type="submit" className="btn" disabled={loading || resending}>
                    {loading ? 'Verifying...' : 'Verify Email'}
                </button>

                <button
                    type="button"
                    className="btn"
                    onClick={handleResendOTP}
                    disabled={loading || resending}
                >
                    {resending ? 'Sending OTP...' : 'Resend OTP'}
                </button>

                <p>
                    Already verified? <Link to="/login">Login</Link>
                </p>

                <p>
                    Need to start again? <Link to="/register">Register</Link>
                </p>
            </form>
        </div>
    );
};

export default VerifyEmail;