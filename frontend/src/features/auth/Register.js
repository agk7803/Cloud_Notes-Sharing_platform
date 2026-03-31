import React, { useState } from "react";
import RegisterImage from "../../assets/register.jpg";
import { Link, useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { C } from "../../shared/theme";
import "../landing/Landing.css";

import {
    createUserWithEmailAndPassword,
    updateProfile,
} from "firebase/auth";

import { doc, setDoc } from "firebase/firestore";

import { auth, db } from "../../services/firebase";

function Register() {
    const [role, setRole] = useState("student");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            // Create user
            const res = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            // Set display name
            await updateProfile(res.user, {
                displayName: name,
            });

            // Save extra data in Firestore
            await setDoc(doc(db, "users", res.user.uid), {
                name,
                email,
                role,
                createdAt: new Date(),
            });

            // Save locally
            const token = await res.user.getIdToken();
            localStorage.setItem("user", JSON.stringify({ ...res.user, token }));

            navigate("/dashboard");
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="ne-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', overflowY: 'auto' }}>
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

            <div className="w-full flex justify-center">
                <div className="relative flex flex-col max-w-lg w-full"
                    style={{ 
                        zIndex: 10, background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(28px)',
                        borderRadius: '28px', border: '1px solid rgba(15, 23, 42, 0.08)',
                        boxShadow: '0 32px 64px rgba(15, 23, 42, 0.12)', padding: '28px 32px'
                    }}>

                    <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', textAlign: 'center', letterSpacing: '-0.8px' }}>
                        Create Account
                    </h2>

                    <p style={{ textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: 13, margin: '4px 0 20px' }}>
                        Join 50k+ students studying smarter
                    </p>

                    <form
                        onSubmit={handleRegister}
                        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                        autoComplete="off"
                    >
                        {/* ROLE */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', paddingLeft: 4 }}>Account Type</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                                style={{
                                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                                    border: '1px solid rgba(15, 23, 42, 0.08)', background: '#fff',
                                    fontSize: 14, fontWeight: 600, outline: 'none'
                                }}
                            >
                                <option value="student">Student</option>
                                <option value="professor">Professor</option>
                            </select>
                        </div>

                        {/* NAME */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', paddingLeft: 4 }}>Full Name</label>
                            <input
                                type="text"
                                placeholder="e.g. John Doe"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{
                                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                                    border: '1px solid rgba(15, 23, 42, 0.08)', background: '#fff',
                                    fontSize: 14, fontWeight: 600, outline: 'none'
                                }}
                            />
                        </div>

                        {/* EMAIL */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', paddingLeft: 4 }}>Email Address</label>
                            <input
                                type="email"
                                placeholder="name@email.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                                    border: '1px solid rgba(15, 23, 42, 0.08)', background: '#fff',
                                    fontSize: 14, fontWeight: 600, outline: 'none'
                                }}
                            />
                        </div>

                        {/* PASSWORD */}
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
                                        width: '100%', padding: '12px 16px', borderRadius: '12px',
                                        border: '1px solid rgba(15, 23, 42, 0.08)', background: '#fff',
                                        fontSize: 14, fontWeight: 600, outline: 'none'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', fontSize: 11, fontWeight: 800, color: '#0d9488', cursor: 'pointer'
                                    }}
                                >
                                    {showPassword ? "HIDE" : "SHOW"}
                                </button>
                            </div>
                        </div>

                        {/* CONFIRM */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', paddingLeft: 4 }}>Confirm Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{
                                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                                    border: '1px solid rgba(15, 23, 42, 0.08)', background: '#fff',
                                    fontSize: 14, fontWeight: 600, outline: 'none'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: '100%', padding: '14px', borderRadius: '99px',
                                background: `linear-gradient(135deg, ${C.teal} 0%, #0d9488 100%)`,
                                color: '#fff', fontWeight: 900, border: 'none', cursor: 'pointer',
                                boxShadow: '0 8px 24px rgba(13, 148, 136, 0.25)', transition: 'all 0.3s',
                                marginTop: 20
                            }}
                            className="btn-press"
                        >
                            Create Account
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, fontWeight: 600, color: '#64748b' }}>
                        Already a member?{" "}
                        <Link to="/login" style={{ color: C.teal, fontWeight: 900, textDecoration: 'none' }}>
                            Log in to Account
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
}

export default Register;
