import React from 'react';
import bannerImage from '../../assets/land.jpg';
import anyImg from '../../assets/any.jpg';
import prof from '../../assets/prof.jpg';
import cross from '../../assets/cross.jpg';
import logoImage from '../../assets/generated-image.png';
import { Link } from 'react-router-dom'; // Import Link for routing



function Landing() {
  const smoothScrollToId = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <div
      className="relative flex h-screen flex-col bg-[#f8fbfa] group/design-root overflow-x-hidden overflow-y-auto custom-scrollbar"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-gray-200 px-10 py-4">
          <div className="flex items-center gap-3 text-gray-800">
            <img src={logoImage} alt="Logo" style={{ height: '60px', width: '60px', objectFit: 'contain' }} />
            <h2 className="text-xl font-bold tracking-tight">StuNotes</h2>
          </div>
          <nav className="flex items-center gap-8">
            <a
              href="#home"
              onClick={(e) => smoothScrollToId(e, 'home')}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Home
            </a>
            <a
              href="#key-features"
              onClick={(e) => smoothScrollToId(e, 'key-features')}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Features
            </a>
            <Link
              to="/contact"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Contact
            </Link>




            <a
              href="/login"
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-10 px-5 bg-[#1dc962] text-gray-900 text-sm font-semibold leading-normal tracking-[-0.015em] hover:bg-green-500 transition-colors"
            >
              <span className="truncate">Login</span>
            </a>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {/* Hero Section */}
          <section
            id="home"
            className="relative flex min-h-[60vh] items-center justify-center bg-cover bg-center py-20"
            style={{
              backgroundImage:
                `linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0.1)), url(${bannerImage})`,
            }}
          >
            <div className="container mx-auto px-4 text-center text-white">
              <h1 className="text-5xl font-extrabold leading-tight tracking-tighter md:text-6xl">
                Share and Discover Notes Effortlessly.
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-black-200">
                Access academic notes, collaborate with your peers, and study smarter.
              </p>
              <div className="mt-8 flex justify-center">
                <a
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full h-12 px-12 bg-[#1dc962] text-gray-900 text-base font-semibold leading-normal tracking-[-0.015em] hover:bg-green-500 transition-colors"
                >
                  <span className="truncate">Get Started</span>
                </a>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="bg-white py-20 sm:py-24">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <div className="flex justify-center items-center gap-4 mb-6">
                  {/* Icons */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-[#1dc962]">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      ></path>
                    </svg>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-[#1dc962]">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      ></path>
                    </svg>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-[#1dc962]">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      ></path>
                    </svg>
                  </div>
                </div>
                <h2 className="text-4xl font-extrabold tracking-tighter text-gray-900">
                  How It Works
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                  Our platform is designed to make sharing and accessing academic
                  materials as simple as possible. We connect students and educators
                  to foster a community of collaborative learning and knowledge
                  exchange.
                </p>
              </div>
            </div>
          </section>

          {/* Key Features Section */}
          <section
            id="key-features"
            className="bg-[#1dc962] py-20 sm:py-24"
          >
            <div className="container mx-auto px-4">
              <div className="text-center">
                <h2 className="text-4xl font-extrabold tracking-tighter text-white">
                  Key Features
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-green-100">
                  StuNotes offers a comprehensive suite of tools designed to enhance your learning experience.
                </p>
              </div>
              <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Feature 1 */}
                <div className="flex flex-col items-center text-center gap-4 rounded-lg border border-green-300 bg-green-100 p-8 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-200 text-[#1dc962]">
                    <svg
                      fill="currentColor"
                      height="28px"
                      viewBox="0 0 256 256"
                      width="28px"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M88,96a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,96Zm8,40h64a8,8,0,0,0,0-16H96a8,8,0,0,0,0,16Zm32,16H96a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16ZM224,48V156.69A15.86,15.86,0,0,1,219.31,168L168,219.31A15.86,15.86,0,0,1,156.69,224H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48ZM48,208H152V160a8,8,0,0,1,8-8h48V48H48Zm120-40v28.7L196.69,168Z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#065f46]">Intuitive Note-Taking</h3>
                  <p className="text-green-700">
                    Create, organize, and access your notes effortlessly with our user-friendly interface.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="flex flex-col items-center text-center gap-4 rounded-lg border border-green-300 bg-green-100 p-8 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-200 text-[#1dc962]">
                    <svg
                      fill="currentColor"
                      height="28px"
                      viewBox="0 0 256 256"
                      width="28px"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#065f46]">Collaborative Learning</h3>
                  <p className="text-green-700">
                    Share notes, work on projects together, and learn from your peers in real-time.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="flex flex-col items-center text-center gap-4 rounded-lg border border-green-300 bg-green-100 p-8 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-200 text-[#1dc962]">
                    <svg
                      fill="currentColor"
                      height="28px"
                      viewBox="0 0 256 256"
                      width="28px"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#065f46]">Smart Search</h3>
                  <p className="text-green-700">
                    Find exactly what you need with our powerful search functionality, saving you time and effort.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Stay Connected Section */}
          <section className="bg-white py-20 sm:py-24">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <h2 className="text-4xl font-extrabold tracking-tighter text-gray-900">
                  Stay Connected, Wherever You Are
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                  With StuNotes, your notes are always within reach, ensuring you
                  never miss a beat.
                </p>
              </div>
              <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Connected Feature 1 */}
                <div className="flex flex-col gap-4">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg shadow-md"
                    style={{ backgroundImage: `url(${anyImg})` }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Anywhere Access</h3>
                    <p className="mt-1 text-gray-600">
                      Access your notes from any device, anytime, ensuring you're
                      always prepared.
                    </p>
                  </div>
                </div>

                {/* Connected Feature 2 */}
                <div className="flex flex-col gap-4">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg shadow-md"
                    style={{ backgroundImage: `url(${cross})` }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Cross-Device Sync</h3>
                    <p className="mt-1 text-gray-600">
                      Seamlessly sync your notes across all your devices, keeping your
                      information up-to-date.
                    </p>
                  </div>
                </div>

                {/* Connected Feature 3 */}
                <div className="flex flex-col gap-4">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg shadow-md"
                    style={{ backgroundImage: `url(${prof})` }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Professor Resources</h3>
                    <p className="mt-1 text-gray-600">Professors can upload lecture materials, verify note quality, and manage shared content effortlessly.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer id="support-footer" className="bg-gray-100 border-t border-gray-200">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div className="flex items-center gap-3">
                <img src={logoImage} alt="Logo" style={{ height: '40px', width: '40px', objectFit: 'contain' }} />
                <h2 className="text-lg font-bold text-gray-800">StuNotes</h2>
              </div>
              <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                <Link
                  to="/about"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Contact
                </Link>
                <Link
                  to="/privacy"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Terms of Service
                </Link>
              </nav>

              <p className="text-sm text-gray-500">© 2025 StuNotes. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Landing;
