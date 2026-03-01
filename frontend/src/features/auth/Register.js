import React, { useState } from "react";
import RegisterImage from "../../assets/register.jpg";
import { Link, useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";

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
        <div
            className="min-h-screen h-screen flex items-center justify-center overflow-hidden relative"
            style={{
                backgroundImage: `url(${RegisterImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* Home Button */}
            <Link
                to="/"
                className="absolute top-6 left-6 flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-md text-gray-700 font-bold hover:bg-white hover:text-[#38e07b] transition-all z-50"
            >
                <FaHome /> Home
            </Link>

            <div className="w-full flex justify-center">
                <div className="bg-white shadow-2xl rounded-2xl px-6 py-4 max-w-lg w-full my-12 mx-6 flex flex-col justify-center items-center">

                    <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
                        Create Your Account
                    </h2>

                    <p className="mb-3 text-center text-[#51946c]">
                        Join our community
                    </p>

                    <form
                        onSubmit={handleRegister}
                        className="flex flex-col gap-3 w-full"
                        autoComplete="off"
                    >
                        {/* ROLE */}
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                            className="w-full p-2 border rounded"
                        >
                            <option value="student">Student</option>
                            <option value="professor">Professor</option>
                        </select>

                        {/* NAME */}
                        <input
                            type="text"
                            placeholder="Name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded"
                        />

                        {/* EMAIL */}
                        <input
                            type="email"
                            placeholder="Email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded"
                        />

                        {/* PASSWORD */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border rounded"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-2 text-sm text-gray-500"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        {/* CONFIRM */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-black text-white py-2 rounded-full mt-4"
                        >
                            Register
                        </button>
                    </form>

                    <p className="text-center mt-3 text-sm">
                        Already a member?{" "}
                        <Link to="/login" className="text-[#38e07b] font-bold">
                            Log in
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
}

export default Register;
