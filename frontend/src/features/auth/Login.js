import React, { useState, useRef } from "react";
import LoginImage from "../../assets/login.jpg";
import RegisterBg from "../../assets/register.jpg";
import { Link, useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";

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
        <div
            className="min-h-screen flex items-center justify-center relative"
            style={{
                backgroundImage: `url(${RegisterBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* Home */}
            <Link
                to="/"
                className="absolute top-6 left-6 flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-md font-bold text-gray-700 hover:text-[#38e07b]"
            >
                <FaHome /> Home
            </Link>

            <div className="relative flex flex-col md:flex-row max-w-5xl w-full shadow-2xl rounded-2xl bg-white overflow-hidden">

                {/* Left */}
                <div className="w-full md:w-1/2 flex justify-center p-8">

                    <div className="w-full max-w-sm space-y-5">

                        {/* Header */}
                        <div className="text-center">
                            <h1 className="text-3xl font-bold">StuNotes</h1>
                            <h2 className="text-lg text-[#38e07b] font-bold mt-1">
                                Login to your account
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Welcome back!
                            </p>
                        </div>

                        {/* Email Login */}
                        <form onSubmit={handleLogin} className="space-y-4">

                            <input
                                type="email"
                                placeholder="Username or Email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border p-2 rounded bg-gray-50"
                            />

                            <div className="relative">

                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border p-2 rounded bg-gray-50 pr-16"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2 text-sm text-gray-500"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>

                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-sm text-[#38e07b]"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-black text-white py-2 rounded-full"
                            >
                                Login
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
                        <div className="flex gap-3">

                            <button
                                onClick={handleGoogleLogin}
                                className="flex-1 border py-2 rounded hover:bg-gray-50 flex justify-center gap-2"
                            >
                                <img
                                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                    className="w-5"
                                    alt="Google"
                                />
                                Google
                            </button>

                            <button
                                onClick={() => setShowPhone(!showPhone)}
                                className="flex-1 border py-2 rounded hover:bg-gray-50"
                            >
                                📞 Phone
                            </button>

                        </div>

                        {/* Phone Input */}
                        {showPhone && !confirmation && (
                            <div className="space-y-2">

                                <input
                                    type="text"
                                    placeholder="+91XXXXXXXXXX"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full border p-2 rounded"
                                />

                                <button
                                    onClick={sendOTP}
                                    className="w-full bg-blue-500 text-white py-2 rounded"
                                >
                                    Send OTP
                                </button>

                            </div>
                        )}

                        {/* OTP */}
                        {confirmation && (
                            <div className="space-y-2">

                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full border p-2 rounded"
                                />

                                <button
                                    onClick={verifyOTP}
                                    className="w-full bg-green-500 text-white py-2 rounded"
                                >
                                    Verify OTP
                                </button>

                            </div>
                        )}

                        {/* Recaptcha */}
                        <div ref={recaptchaRef}></div>

                        {/* Register */}
                        <p className="text-center text-sm text-gray-600">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-[#38e07b] font-medium">
                                Register
                            </Link>
                        </p>

                    </div>
                </div>

                {/* Right */}
                <div className="hidden md:flex w-1/2 items-center justify-center">
                    <img
                        src={LoginImage}
                        alt="Login"
                        className="w-10/12 h-4/6 object-contain"
                    />
                </div>

            </div>
        </div>
    );
}

export default Login;
