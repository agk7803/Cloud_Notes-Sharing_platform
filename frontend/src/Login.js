import React, { useState } from 'react';
import LoginImage from './assets/login.jpg';
import RegisterBg from './assets/register.jpg';
import { Link, useNavigate } from 'react-router-dom';

import { auth, googleProvider } from './firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithCredential,
  PhoneAuthProvider,
} from 'firebase/auth';

function Login() {
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const navigate = useNavigate();

  // Email/password login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };

  // Setup invisible reCAPTCHA
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => {
            /* reCAPTCHA solved */
          },
          defaultCountry: 'IN', // set your default country code here
        }
      );
    }
  };

  // Request OTP for phone login
  const requestOtp = async () => {
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setVerificationId(confirmationResult.verificationId);
      setShowOtpInput(true);
      alert('OTP sent to your phone.');
    } catch (error) {
      alert(error.message);
    }
  };

  // Verify OTP entered by user
  const verifyOtp = async () => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await signInWithCredential(auth, credential);
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${RegisterBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="relative flex flex-col md:flex-row max-w-5xl w-full mx-auto shadow-2xl rounded-2xl overflow-hidden bg-white">
        {/* Thin Black Line */}
        <div
          className="hidden md:block absolute left-1/2 top-1/4 h-1/2 w-px bg-black z-10"
          style={{ transform: 'translate(-50%, 0)' }}
        ></div>

        {/* Left Column: Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-8">
          <div className="w-full max-w-sm space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-center text-black mb-1">StudyCentral</h1>
              <h2 className="text-xl font-bold text-center text-[#38e07b]">Login to your account</h2>
              <p className="mt-2 text-center text-sm text-gray-600 font-black">Welcome back!</p>
            </div>

            {/* Email/Password Login Form */}
            <form onSubmit={handleEmailLogin} className="mt-6 space-y-6">
              <div className="rounded-md -space-y-px">
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
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:outline-none focus:ring-[#38e07b] focus:border-[#38e07b] sm:text-sm"
                  >
                    <option value="" disabled>
                      -- Select your role --
                    </option>
                    <option value="student">Student</option>
                    <option value="professor">Professor</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="email-address" className="sr-only">
                    Username or Email
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Username or Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#38e07b] focus:border-[#38e07b] focus:z-10 sm:text-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#38e07b] focus:border-[#38e07b] focus:z-10 sm:text-sm bg-gray-50"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end">
                <div className="text-sm">
                  <button type="button" onClick={() => { }} className="font-medium text-[#38e07b] hover:text-green-400 bg-transparent border-none cursor-pointer">
                    Forgot your password?
                  </button>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
                >
                  Login
                </button>
              </div>
            </form>

            {/* Or separator */}
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm text-gray-500">
                  <span className="px-2 bg-white">Or continue with</span>
                </div>
              </div>

              {/* Social auth buttons */}
              <div className="mt-4">
                <input
                  type="tel"
                  placeholder="Phone Number (for Phone Login)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#38e07b] focus:border-[#38e07b] sm:text-sm mb-3"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full inline-flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  aria-label="Sign in with Google"
                >
                  <svg width="22" height="22" viewBox="0 0 32 32" className="mr-2">
                    <g>
                      <path fill="#4285F4" d="M31.74 16.37a17.14 17.14 0 0 0-.16-2.86H16.12v5.43h8.77a7.53 7.53 0 0 1-3.24 4.94v4h5.18c3.04-2.8 4.79-6.93 4.79-11.51z" />
                      <path fill="#34A853" d="M16.12 32c4.38 0 8.06-1.44 10.75-3.93l-5.18-4c-1.44.97-3.3 1.54-5.57 1.54-4.29 0-7.94-2.89-9.24-6.78H1.54v4.19A16 16 0 0 0 16.12 32z" />
                      <path fill="#FBBC05" d="M6.87 18.83a9.62 9.62 0 0 1 0-6.03v-4.19H1.54a16.13 16.13 0 0 0 0 14.41z" />
                      <path fill="#EA4335" d="M16.12 6.36c2.39 0 4.54.82 6.23 2.42l4.66-4.45A16.05 16.05 0 0 0 16.12 0a16 16 0 0 0-14.58 8.61l5.33 4.29c1.29-3.89 4.95-6.78 9.25-6.78z" />
                    </g>
                  </svg>
                  Google
                </button>

                {/* Phone Login Button */}
                {!showOtpInput && (
                  <button
                    type="button"
                    onClick={requestOtp}
                    disabled={!phoneNumber}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    aria-label="Sign in with Phone"
                  >
                    <span className="material-icons">phone</span> Phone
                  </button>
                )}
              </div>
            </div>

            {/* Phone OTP Input */}
            {showOtpInput && (
              <div className="mt-4 space-y-2">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#38e07b] focus:border-[#38e07b] sm:text-sm"
                />
                <button
                  onClick={verifyOtp}
                  className="w-full py-2 px-4 bg-[#38e07b] text-white rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  Verify OTP
                </button>
              </div>
            )}

            <div id="recaptcha-container"></div>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-[#38e07b] hover:text-green-400">
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Illustration */}
        <div className="hidden md:flex w-1/2 items-center justify-center bg-white">
          <img src={LoginImage} alt="Login illustration" className="w-10/12 h-4/6 object-contain mx-auto" />
        </div>
      </div>
    </div>
  );
}

export default Login;