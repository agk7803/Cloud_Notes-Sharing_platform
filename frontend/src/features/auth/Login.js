import React, { useState, useRef } from "react";
import LoginImage from "../../assets/login.jpg";
import RegisterBg from "../../assets/register.jpg";
import { Link, useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { C } from "../../shared/theme";
import "../landing/Landing.css";

import {
    signInWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail,
    RecaptchaVerifier,
    signInWithPhoneNumber,
} from "firebase/auth";

import { auth, googleProvider } from "../../services/firebase";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Phone auth
    const [showPhone, setShowPhone] = useState(false);
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmation, setConfirmation] = useState(null);

    const recaptchaRef = useRef(null);

    const navigate = useNavigate();

    /* ================= EMAIL LOGIN ================= */

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await signInWithEmailAndPassword(auth, email, password);
            const token = await res.user.getIdToken();

            localStorage.setItem("user", JSON.stringify({ ...res.user, token }));
            navigate("/dashboard");
        } catch (err) {
            alert(err.message);
        }
    };

    /* ================= GOOGLE LOGIN ================= */

    const handleGoogleLogin = async () => {
        try {
            const res = await signInWithPopup(auth, googleProvider);
            const token = await res.user.getIdToken();

            localStorage.setItem("user", JSON.stringify({ ...res.user, token }));
            navigate("/dashboard");
        } catch (err) {
            alert(err.message);
        }
    };

    /* ================= FORGOT PASSWORD ================= */

    const handleForgotPassword = async () => {
        if (!email) {
            alert("Enter your email first");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            alert("Reset link sent to your email");
        } catch (err) {
            alert(err.message);
        }
    };

    /* ================= RECAPTCHA ================= */

    const setupRecaptcha = () => {
        if (window.recaptchaVerifier) return;

        window.recaptchaVerifier = new RecaptchaVerifier(
            recaptchaRef.current,
            {
                size: "invisible",
                callback: () => {
                    console.log("Recaptcha solved");
                },
            },
            auth
        );

        window.recaptchaVerifier.render();
    };

    /* ================= PHONE LOGIN ================= */

    const sendOTP = async () => {
        if (!phone) {
            alert("Enter phone number with country code");
            return;
        }

        try {
            setupRecaptcha();

            const appVerifier = window.recaptchaVerifier;

            const result = await signInWithPhoneNumber(
                auth,
                phone,
                appVerifier
            );

            setConfirmation(result);
            alert("OTP sent");
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const verifyOTP = async () => {
        try {
            const res = await confirmation.confirm(otp);
            const token = await res.user.getIdToken();

            localStorage.setItem("user", JSON.stringify({ ...res.user, token }));
            navigate("/dashboard");
        } catch {
            alert("Invalid OTP");
        }
    };

    return (
        <div className="ne-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            {/* VIVID BACKGROUND FOUNDATION */}
            <div className="ne-bg">
                <div className="ne-bg__blob" style={{ background: 'rgba(126, 200, 200, 0.65)', top: '5%', left: '-5%', width: '60vw', height: '60vw' }} />
                <div className="ne-bg__blob" style={{ background: 'rgba(249, 168, 201, 0.45)', bottom: '5%', right: '0%', width: '50vw', height: '50vw', animationDelay: '-5s' }} />
                <div className="ne-bg__blob" style={{ background: 'rgba(254, 215, 170, 0.35)', top: '25%', left: '40%', width: '45vw', height: '45vw', animationDelay: '-8s' }} />
                <div className="ne-bg__blob" style={{ background: 'rgba(126, 200, 200, 0.4)', bottom: '15%', left: '10%', width: '40vw', height: '40vw', animationDelay: '-3s' }} />
            </div>
            <div className="ne-grid" style={{ opacity: 0.8 }} />

            {/* Home Pill */}
            <Link
                to="/"
                className="ne-btn-back"
                style={{ position: 'absolute', top: 24, left: 24, zIndex: 100, textDecoration: 'none' }}
            >
                <FaHome size={14} /> Back to Home
            </Link>

            <div className="relative flex flex-col md:flex-row max-w-5xl w-full"
                style={{ 
                    zIndex: 10, background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(28px)',
                    borderRadius: '28px', border: '1px solid rgba(15, 23, 42, 0.08)',
                    boxShadow: '0 32px 64px rgba(15, 23, 42, 0.12)', overflow: 'hidden'
                }}>

                {/* Left */}
                <div className="w-full md:w-1/2 flex justify-center p-8">

                    <div className="w-full max-w-sm space-y-5">

                        {/* Header */}
                        <div className="text-center">
                            <h1 style={{ fontSize: 40, fontWeight: 900, color: '#0f172a', letterSpacing: '-1.5px' }}>StuNotes</h1>
                            <h2 style={{ fontSize: 18, color: '#0d9488', fontWeight: 900, margin: '8px 0 4px' }}>
                                Login to your account
                            </h2>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>
                                Welcome back!
                            </p>
                        </div>

                        {/* Email Login */}
                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', paddingLeft: 4 }}>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        width: '100%', padding: '14px 20px', borderRadius: '14px',
                                        border: '1px solid rgba(15, 23, 42, 0.08)', background: '#fff',
                                        fontSize: 14, fontWeight: 600, outline: 'none', transition: 'all 0.3s'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', paddingLeft: 4 }}>Security Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{
                                            width: '100%', padding: '14px 20px', borderRadius: '14px',
                                            border: '1px solid rgba(15, 23, 42, 0.08)', background: '#fff',
                                            fontSize: 14, fontWeight: 600, outline: 'none', transition: 'all 0.3s'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', fontSize: 11, fontWeight: 800, color: C.teal, cursor: 'pointer'
                                        }}
                                    >
                                        {showPassword ? "HIDE" : "SHOW"}
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, fontWeight: 800, color: C.teal, cursor: 'pointer' }}
                                >
                                    Forgot security password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                style={{
                                    width: '100%', padding: '14px', borderRadius: '99px',
                                    background: `linear-gradient(135deg, ${C.teal} 0%, #0d9488 100%)`,
                                    color: '#fff', fontWeight: 900, border: 'none', cursor: 'pointer',
                                    boxShadow: `0 8px 24px rgba(13, 148, 136, 0.25)`, transition: 'all 0.3s',
                                    marginTop: 8
                                }}
                                className="btn-press"
                            >
                                Login to Account
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-3">

                            <div className="flex-1 h-px bg-gray-300"></div>

                            <span className="text-sm text-gray-500">
                                Or continue with
                            </span>

                            <div className="flex-1 h-px bg-gray-300"></div>

                        </div>

                        {/* Social */}
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={handleGoogleLogin}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '14px', background: '#fff',
                                    border: '1px solid rgba(15, 23, 42, 0.08)', fontWeight: 900,
                                    fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.3s'
                                }}
                                className="btn-alt"
                            >
                                <img
                                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                    style={{ width: 18 }}
                                    alt="Google"
                                />
                                Google
                            </button>

                            <button
                                onClick={() => setShowPhone(!showPhone)}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '14px', background: '#fff',
                                    border: '1px solid rgba(15, 23, 42, 0.08)', fontWeight: 900,
                                    fontSize: 13, cursor: 'pointer', transition: 'all 0.3s'
                                }}
                                className="btn-alt"
                            >
                                📞 Mobile
                            </button>
                        </div>

                        {/* Phone Input */}
                        {showPhone && !confirmation && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <input
                                    type="text"
                                    placeholder="+91 XXXXX XXXXX"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    style={{
                                        width: '100%', padding: '14px 20px', borderRadius: '14px',
                                        border: '1px solid rgba(15, 23, 42, 0.08)', background: '#fff',
                                        fontSize: 14, fontWeight: 600, outline: 'none'
                                    }}
                                />
                                <button
                                    onClick={sendOTP}
                                    style={{
                                        width: '100%', padding: '12px', borderRadius: '99px',
                                        background: `linear-gradient(135deg, ${C.teal} 0%, #0d9488 100%)`,
                                        color: '#fff', fontWeight: 900, border: 'none', cursor: 'pointer',
                                        boxShadow: `0 8px 20px rgba(13, 148, 136, 0.2)`
                                    }}
                                >
                                    GET VERIFICATION CODE
                                </button>
                            </div>
                        )}

                        {/* OTP */}
                        {confirmation && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    style={{
                                        width: '100%', padding: '14px 20px', borderRadius: '14px',
                                        border: '1px solid rgba(15, 23, 42, 0.08)', background: '#fff',
                                        fontSize: 14, fontWeight: 600, outline: 'none'
                                    }}
                                />
                                <button
                                    onClick={verifyOTP}
                                    style={{
                                        width: '100%', padding: '12px', borderRadius: '99px',
                                        background: `linear-gradient(135deg, ${C.teal} 0%, #0d9488 100%)`,
                                        color: '#fff', fontWeight: 900, border: 'none', cursor: 'pointer',
                                        boxShadow: `0 8px 20px rgba(13, 148, 136, 0.2)`
                                    }}
                                >
                                    VERIFY & LOGIN
                                </button>
                            </div>
                        )}

                        {/* Recaptcha */}
                        <div ref={recaptchaRef}></div>

                        {/* Register */}
                        <p style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#64748b' }}>
                            Don't have an account?{" "}
                            <Link to="/register" style={{ color: C.teal, fontWeight: 900, textDecoration: 'none' }}>
                                Create Account
                            </Link>
                        </p>

                    </div>
                </div>

                {/* Right */}
                <div className="hidden md:flex w-1/2 items-center justify-center" 
                     style={{ background: '#ffffff', borderLeft: '1px solid rgba(15, 23, 42, 0.05)' }}>
                    <img
                        src={LoginImage}
                        alt="LoginIllustration"
                        style={{ width: '85%', height: '70%', objectFit: 'contain', mixBlendMode: 'multiply' }}
                    />
                </div>

            </div>
        </div>
    );
}

export default Login;
