import React, { useState } from 'react';
import RegisterImage from './assets/register.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { auth, googleProvider } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';

function Register() {
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // Email/password registration handler
  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update profile with name
      await updateProfile(userCredential.user, {
        displayName: name,
      });
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };

  // Google registration/login handler
  const handleGoogleRegister = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };

  // Phone registration placeholder
  const handlePhoneRegister = () => {
    alert("Phone registration requires additional verification and isn't implemented yet.");
  };

  return (
    <div
      className="min-h-screen h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${RegisterImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full flex justify-center">
        <div className="bg-white shadow-2xl rounded-2xl px-6 py-4 max-w-lg w-full my-12 mx-6 flex flex-col justify-center items-center">
          <h2
            className="text-2xl sm:text-3xl font-bold text-center text-[#0e1a13] mb-2"
            style={{ fontFamily: "'Newsreader', serif" }}
          >
            Create Your Account
          </h2>
          <p className="mb-3 text-center text-[#51946c] text-sm sm:text-base">
            Join our community of students and educators.
          </p>
          <form onSubmit={handleRegister} className="flex flex-col gap-2 sm:gap-3 w-full" autoComplete="off">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Select Role
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full p-2 border border-[#d1e6d9] rounded bg-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#38e07b] placeholder-gray-400 transition"
              >
                <option value="" disabled>
                  -- Select your role --
                </option>
                <option value="student">Student</option>
                <option value="professor">Professor</option>
              </select>
            </div>

            <input
              className="w-full p-2 border border-[#d1e6d9] rounded bg-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#38e07b] placeholder-gray-400 transition"
              type="text"
              placeholder="Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="w-full p-2 border border-[#d1e6d9] rounded bg-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#38e07b] placeholder-gray-400 transition"
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative">
              <input
                className="w-full p-2 border border-[#d1e6d9] rounded bg-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#38e07b] placeholder-gray-400 transition"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-gray-500 text-sm select-none"
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="relative mt-2">
              <input
                className="w-full p-2 border border-[#d1e6d9] rounded bg-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#38e07b] placeholder-gray-400 transition"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-gray-500 text-sm select-none"
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-2.5 rounded-full font-bold hover:bg-gray-800 transition text-base mt-4"
            >
              Register
            </button>
          </form>

          <div className="mt-5 text-center text-[#51946c]">
            <p className="text-xs sm:text-sm mb-3">Or register with</p>
            <div className="flex justify-center gap-6 items-center mb-4">
              {/* Google Icon Button */}
              <button
                type="button"
                onClick={handleGoogleRegister}
                className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-full bg-white hover:bg-gray-50 transition"
                aria-label="Register with Google"
              >
                {/* Google SVG */}
                <svg viewBox="0 0 32 32" width="20" height="20">
                  <g>
                    <path fill="#4285F4" d="M31.74 16.37a17.14 17.14 0 0 0-.16-2.86H16.12v5.43h8.77a7.53 7.53 0 0 1-3.24 4.94v4h5.18c3.04-2.8 4.79-6.93 4.79-11.51z" />
                    <path fill="#34A853" d="M16.12 32c4.38 0 8.06-1.44 10.75-3.93l-5.18-4c-1.44.97-3.3 1.54-5.57 1.54-4.29 0-7.94-2.89-9.24-6.78H1.54v4.19A16 16 0 0 0 16.12 32z" />
                    <path fill="#FBBC05" d="M6.87 18.83a9.62 9.62 0 0 1 0-6.03v-4.19H1.54a16.13 16.13 0 0 0 0 14.41z" />
                    <path fill="#EA4335" d="M16.12 6.36c2.39 0 4.54.82 6.23 2.42l4.66-4.45A16.05 16.05 0 0 0 16.12 0a16 16 0 0 0-14.58 8.61l5.33 4.29c1.29-3.89 4.95-6.78 9.25-6.78z" />
                  </g>
                </svg>
              </button>

              {/* Phone Icon Button Placeholder */}
              <button
                type="button"
                onClick={handlePhoneRegister}
                className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-full bg-white hover:bg-gray-50 transition"
                aria-label="Register with Phone"
              >
                <span className="material-icons" style={{ fontSize: 20, color: '#51946c' }}>
                  phone
                </span>
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-center mt-2 text-[#51946c]">
            Already a member?{' '}
            <Link to="/login" className="font-bold text-[#38e07b] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;