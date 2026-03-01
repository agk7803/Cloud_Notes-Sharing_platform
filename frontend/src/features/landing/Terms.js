import React from "react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import logoImage from '../../assets/generated-image.png';

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div
      className="min-h-screen flex flex-col font-sans bg-white"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <header className="flex items-center justify-between border-b border-gray-200 px-10 py-3 bg-green-50">
        <div className="flex items-center gap-3 text-green-900">
          <img src={logoImage} alt="Logo" style={{ height: '35px', width: '35px', objectFit: 'contain' }} />
          <h2 className="text-gray-900 text-xl font-bold leading-tight tracking-[-0.015em]">
            StuNotes
          </h2>
        </div>
        <nav className="flex flex-1 justify-end gap-6">
          <div className="hidden items-center gap-6 md:flex">
            <Link to="/" className="hover:text-green-700">
              Home
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-10 px-5 bg-[#1dc962] text-gray-900 text-sm font-semibold leading-normal tracking-[-0.015em] hover:bg-green-500 transition-colors"
            >
              <span className="truncate">Log in</span>
            </a>
          </div>
        </nav>
      </header>
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 overflow-hidden">
        <div className="mx-auto max-w-6xl h-full overflow-hidden">
          <div className="mb-6 text-center">
            <h1 className="text-gray-900 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-gray-600">Last updated: October 26, 2023</p>
          </div>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3 max-h-full overflow-hidden">
            <div className="space-y-2 rounded-lg border border-gray-200 p-4 h-full flex flex-col">
              <h2 className="text-lg font-bold tracking-tight text-[#1dc91d]">
                1. Agreement
              </h2>
              <p className="text-sm leading-snug text-gray-700 flex-grow">
                By using StuNotes, you agree to these terms. We may update them, and your continued use is acceptance. If you disagree, stop using the service.
              </p>
            </div>
            <div className="space-y-2 rounded-lg border border-gray-200 p-4 h-full flex flex-col">
              <h2 className="text-lg font-bold tracking-tight text-[#1dc91d]">
                2. Our Service
              </h2>
              <p className="text-sm leading-snug text-gray-700 flex-grow">
                We provide an academic platform. The service can change or stop anytime. We are not liable for data loss from service interruptions.
              </p>
            </div>
            <div className="space-y-2 rounded-lg border border-gray-200 p-4 h-full flex flex-col">
              <h2 className="text-lg font-bold tracking-tight text-[#1dc91d]">
                3. Your Role
              </h2>
              <p className="text-sm leading-snug text-gray-700 flex-grow">
                Protect your account. You must be 13+ and follow all laws. Do not share illegal or inappropriate content. You're responsible for your account activity.
              </p>
            </div>
            <div className="space-y-2 rounded-lg border border-gray-200 p-4 h-full flex flex-col">
              <h2 className="text-lg font-bold tracking-tight text-[#1dc91d]">
                4. Our IP
              </h2>
              <p className="text-sm leading-snug text-gray-700 flex-grow">
                All content (software, text, logos) is owned by StuNotes or licensors and protected by law. Don't use our brand without written permission.
              </p>
            </div>
            <div className="space-y-2 rounded-lg border border-gray-200 p-4 h-full flex flex-col">
              <h2 className="text-lg font-bold tracking-tight text-[#1dc91d]">
                5. Disclaimers
              </h2>
              <p className="text-sm leading-snug text-gray-700 flex-grow">
                Service is "as is." We don't guarantee it will be error-free or uninterrupted. All warranties are disclaimed to the fullest extent permitted by law.
              </p>
            </div>
            <div className="space-y-2 rounded-lg border border-gray-200 p-4 h-full flex flex-col">
              <h2 className="text-lg font-bold tracking-tight text-[#1dc91d]">
                6. Termination
              </h2>
              <p className="text-sm leading-snug text-gray-700 flex-grow">
                We can suspend or terminate your access anytime, for any reason, which may delete your data. You can terminate your account by contacting us.
              </p>
            </div>
            <div className="space-y-2 rounded-lg border border-gray-200 p-4 md:col-span-2 lg:col-span-1 lg:col-start-2 h-full flex flex-col">
              <h2 className="text-lg font-bold tracking-tight text-[#1dc91d]">7. Governing Law</h2>
              <p className="text-sm leading-snug text-gray-700 flex-grow">
                These terms are governed by the laws of our operating jurisdiction. Disputes will be resolved in its courts.
              </p>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-gray-50 py-6">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link className="text-xs leading-5 text-gray-600 hover:text-gray-900" to="/privacy">Privacy Policy</Link>
            <Link className="text-xs leading-5 text-gray-600 hover:text-gray-900" to="/terms">Terms of Service</Link>
            <Link className="text-xs leading-5 text-gray-600 hover:text-gray-900" to="/contact">Contact Us</Link>

          </nav>
          <p className="mt-6 text-center text-xs leading-5 text-gray-500">© 2025 StuNotes. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
