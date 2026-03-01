import React from "react";
import { Link } from "react-router-dom";
import bgImage from '../../assets/register.jpg'; // Use your background image path
import logoImage from '../../assets/generated-image.png';

const Privacy = () => {
  return (
    <div
      className="relative flex flex-col w-full h-screen font-sans overflow-hidden"
      style={{
        fontFamily: 'Inter, "Noto Sans", sans-serif',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="layout-container flex flex-col h-full grow bg-green-50 bg-opacity-70 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 px-10 py-3 text-green-900">
          <div className="flex items-center gap-3 text-green-600">
            <img src={logoImage} alt="Logo" style={{ height: '35px', width: '35px', objectFit: 'contain' }} />
            <h2 className="text-green-900 text-xl font-bold leading-tight tracking-[-0.015em]">
              StuNotes
            </h2>
          </div>
          <div className="flex flex-1 justify-end gap-6 text-green-900 items-center">
            <nav className="flex items-center gap-6 text-green-900 font-semibold text-sm">
              <Link to="/" className="hover:text-green-700">
                Home
              </Link>

              <Link to="/contact" className="hover:text-green-900">Support</Link>
            </nav>
            <Link
              to="/login"
              className="flex min-w-[70px] max-w-[480px] cursor-pointer items-center justify-center rounded-md h-9 px-4 bg-green-700 text-white text-sm font-semibold tracking-[-0.015em] hover:bg-green-800 transition-colors"
            >
              Log in
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-col justify-start items-center px-6 pt-8 pb-6 h-full overflow-hidden">
          <div className="w-full max-w-5xl bg-green-100 bg-opacity-80 rounded-lg p-6 flex flex-col h-full">
            <div className="pb-4 text-center flex-none">
              <h1 className="text-green-900 text-3xl font-bold leading-tight">
                Privacy Policy
              </h1>
              <p className="mt-1 text-green-700 text-sm">Last updated: October 26, 2023</p>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm text-green-900 flex-grow overflow-y-hidden">
              <div className="bg-green-50 p-4 rounded-lg">
                <h2 className="text-green-700 text-lg font-semibold leading-tight">
                  Data Collection
                </h2>
                <p className="mt-2 leading-relaxed">
                  We collect essential account info (name, email) and usage data to enhance our services. Device and location data may also be collected.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h2 className="text-green-700 text-lg font-semibold leading-tight">
                  Data Usage
                </h2>
                <p className="mt-2 leading-relaxed">
                  Your data helps us operate, personalize, and improve our services. We do not sell your data. Sharing is limited to service provision or legal requirements.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h2 className="text-green-700 text-lg font-semibold leading-tight">
                  Data Security
                </h2>
                <p className="mt-2 leading-relaxed">
                  We employ robust security measures like encryption and access controls to protect your information against unauthorized access or destruction.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h2 className="text-green-700 text-lg font-semibold leading-tight">
                  Your Rights
                </h2>
                <p className="mt-2 leading-relaxed">
                  You can access, correct, or delete your personal data. You may also object to or restrict its processing. Contact us to exercise these rights.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h2 className="text-green-700 text-lg font-semibold leading-tight">
                  Policy Changes
                </h2>
                <p className="mt-2 leading-relaxed">
                  We may update this policy. Significant changes will be communicated by updating this page. Please review it periodically.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h2 className="text-green-700 text-lg font-semibold leading-tight">
                  Contact Us
                </h2>
                <p className="mt-2 leading-relaxed">
                  Questions? Email us at{" "}
                  <a href="mailto:privacy@stunotes.com" className="text-green-700 hover:underline">
                    rgitgroup17@gmail.com
                  </a>.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-green-100 mt-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
              <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-green-700 font-semibold text-sm">
                <Link to="/terms" className="hover:text-green-900">
                  Terms of Service
                </Link>
                <Link to="/privacy" className="hover:text-green-900">Privacy Policy</Link>
                <Link to="/contact" className="hover:text-green-900">Contact Us</Link>
              </div>
              <p className="text-green-700 text-sm font-normal mt-4 md:mt-0">
                © 2024 StuNotes. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Privacy;
