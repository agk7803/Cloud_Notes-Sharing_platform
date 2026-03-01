import abt from '../../assets/about1.jpg';  // for professor teaching image (2nd)
import abtt from '../../assets/about2.jpg'; // for students collaborating image (1st)
import { Link } from "react-router-dom";
import React, { useEffect } from "react";
import logoImage from '../../assets/generated-image.png';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className="relative flex w-full min-h-screen flex-col group/design-root"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-green-200 bg-white/80 px-10 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-4 text-green-900">
          <img src={logoImage} alt="Logo" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
          <h2 className="text-xl font-bold tracking-tight text-green-900">StuNotes</h2>

        </div>
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/"
            className="text-sm font-medium text-green-700 transition-colors hover:text-green-600"
          >
            Home
          </Link>

          <Link to="/contact" className="text-sm text-green-700 hover:text-green-600">
            Support
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center rounded-md h-10 px-4 bg-green-600 text-white text-sm font-bold shadow-sm transition-all hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
          >
            <span className="truncate">Login</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 bg-green-50">
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-green-900 sm:text-5xl md:text-6xl">
                About <span className="text-green-600">Us</span>
              </h1>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-green-800 md:text-xl">
                Learn more about our mission to empower students and educators with innovative tools for academic success.
              </p>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24 bg-green-100">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-3xl font-bold tracking-tight text-green-600 sm:text-4xl">
                  Our Mission
                </h2>
                <p className="mt-4 text-lg text-green-800">
                  At StuNotes, our mission is to revolutionize the way students and educators interact with academic content.
                  We strive to create a collaborative platform that fosters learning, creativity, and academic excellence.
                  Our tools are designed to be intuitive, accessible, and adaptable to the diverse needs of our users.
                </p>
              </div>
              <div className="order-1 md:order-2">
                <img
                  alt="Students collaborating"
                  className="rounded-lg shadow-lg w-full h-auto border-4 border-green-200"
                  src={abtt}
                />
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="flex-shrink-0">
                <img
                  alt="Professor teaching"
                  className="rounded-lg shadow-lg w-full h-auto border-4 border-green-200"
                  src={abt}
                />
              </div>
              <div>
                <div className="text-left md:text-left mb-12">
                  <h2 className="text-3xl font-bold tracking-tight text-green-600 sm:text-4xl">
                    Our Core Values
                  </h2>
                  <p className="mt-4 text-lg text-green-800">
                    The principles that guide our work and define our culture.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="flex flex-col items-start text-left p-6 bg-white rounded-lg shadow-md transition-transform hover:scale-105 border-t-4 border-green-600">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
                      <svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg">
                        <path d="M251.76,88.94l-120-64a8,8,0,0,0-7.52,0l-120,64a8,8,0,0,0,0,14.12L32,117.87v48.42a15.91,15.91,0,0,0,4.06,10.65C49.16,191.53,78.51,216,128,216a130,130,0,0,0,48-8.76V240a8,8,0,0,0,16,0V199.51a115.63,115.63,0,0,0,27.94-22.57A15.91,15.91,0,0,0,224,166.29V117.87l27.76-14.81a8,8,0,0,0,0-14.12ZM128,200c-43.27,0-68.72-21.14-80-33.71V126.4l76.24,40.66a8,8,0,0,0,7.52,0L176,143.47v46.34C163.4,195.69,147.52,200,128,200Zm80-33.75a97.83,97.83,0,0,1-16,14.25V134.93l16-8.53ZM188,118.94l-.22-.13-56-29.87a8,8,0,0,0-7.52,14.12L171,128l-43,22.93L25,96,128,41.07,231,96Z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-green-900">Empowerment</h3>
                    <p className="mt-2 text-green-800">We empower students to take control of their learning journey.</p>
                  </div>
                  <div className="flex flex-col items-start text-left p-6 bg-white rounded-lg shadow-md transition-transform hover:scale-105 border-t-4 border-green-600">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
                      <svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg">
                        <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-green-900">Collaboration</h3>
                    <p className="mt-2 text-green-800">We believe in the power of shared learning experiences.</p>
                  </div>
                  <div className="flex flex-col items-start text-left p-6 bg-white rounded-lg shadow-md transition-transform hover:scale-105 border-t-4 border-green-600">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
                      <svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg">
                        <path d="M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104.49C39.74,56.83,78.26,17.14,125.88,16A88,88,0,0,1,216,104Zm-16,0a72,72,0,0,0-73.74-72c-39,.92-70.47,33.39-70.26,72.39a71.65,71.65,0,0,0,27.64,56.3A32,32,0,0,1,96,186v6h64v-6a32.15,32.15,0,0,1,12.47-25.35A71.65,71.65,0,0,0,200,104Zm-16.11-9.34a57.6,57.6,0,0,0-46.56-46.55,8,8,0,0,0-2.66,15.78c16.57,2.79,30.63,16.85,33.44,33.45A8,8,0,0,0,176,104a9,9,0,0,0,1.35-.11A8,8,0,0,0,183.89,94.66Z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-green-900">Innovation</h3>
                    <p className="mt-2 text-green-800">We are committed to continuous innovation and improvement.</p>
                  </div>
                  <div className="flex flex-col items-start text-left p-6 bg-white rounded-lg shadow-md transition-transform hover:scale-105 border-t-4 border-green-600">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
                      <svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg">
                        <path d="M208,40H48A16,16,0,0,0,32,56v58.78c0,89.61,75.82,119.34,91,124.39a15.53,15.53,0,0,0,10,0c15.2-5.05,91-34.78,91-124.39V56A16,16,0,0,0,208,40Zm0,74.79c0,78.42-66.35,104.62-80,109.18-13.53-4.51-80-30.69-80-109.18V56H208ZM82.34,141.66a8,8,0,0,1,11.32-11.32L112,148.68l50.34-50.34a8,8,0,0,1,11.32,11.32l-56,56a8,8,0,0,1-11.32,0Z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-green-900">Integrity</h3>
                    <p className="mt-2 text-green-800">We uphold the highest standards of integrity in all we do.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24 bg-green-100">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="lg:pr-8">
                <h2 className="text-3xl font-bold tracking-tight text-green-600 sm:text-4xl">
                  Benefits for Students
                </h2>
                <dl className="mt-10 space-y-10">
                  <div className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-600 text-white">
                        <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M24,128a8,8,0,0,1,8-8H224a8,8,0,0,1,0,16H32A8,8,0,0,1,24,128Zm8,56H224a8,8,0,0,0,0-16H32a8,8,0,0,0,0,16Zm0-112H224a8,8,0,0,0,0-16H32a8,8,0,0,0,0,16Z"></path>
                        </svg>
                      </div>
                      <p className="ml-16 text-lg leading-6 font-bold text-green-900">Organized Notes</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-green-800">
                      Keep all your notes organized in one place, easily accessible whenever you need them.
                    </dd>
                  </div>
                  <div className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-600 text-white">
                        <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M24,128a8,8,0,0,1,8-8H224a8,8,0,0,1,0,16H32A8,8,0,0,1,24,128Zm8,56H224a8,8,0,0,0,0-16H32a8,8,0,0,0,0,16Zm0-112H224a8,8,0,0,0,0-16H32a8,8,0,0,0,0,16Z"></path>
                        </svg>
                      </div>
                      <p className="ml-16 text-lg leading-6 font-bold text-green-900">Efficient Study</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-green-800">
                      Find exactly what you need quickly with our powerful search and filtering tools.
                    </dd>
                  </div>
                  <div className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-600 text-white">
                        <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M24,128a8,8,0,0,1,8-8H224a8,8,0,0,1,0,16H32A8,8,0,0,1,24,128Zm8,56H224a8,8,0,0,0,0-16H32a8,8,0,0,0,0,16Zm0-112H224a8,8,0,0,0,0-16H32a8,8,0,0,0,0,16Z"></path>
                        </svg>
                      </div>
                      <p className="ml-16 text-lg leading-6 font-bold text-green-900">Collaborative Learning</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-green-800">
                      Connect with peers and share notes to enhance your understanding of course material.
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="lg:pl-8">
                <h2 className="text-3xl font-bold tracking-tight text-green-600 sm:text-4xl">
                  Benefits for Educators
                </h2>
                <dl className="mt-10 space-y-10">
                  <div className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-600 text-white">
                        <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M24,128a8,8,0,0,1,8-8H224a8,8,0,0,1,0,16H32A8,8,0,0,1,24,128Zm8,56H224a8,8,0,0,0,0-16H32a8,8,0,0,0,0,16Zm0-112H224a8,8,0,0,0,0-16H32a8,8,0,0,0,0,16Z"></path>
                        </svg>
                      </div>
                      <p className="ml-16 text-lg leading-6 font-bold text-green-900">Engaging Content Delivery</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-green-800">
                      Create and deliver engaging course content that resonates with your students.
                    </dd>
                  </div>
                  <div className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-600 text-white">
                        <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M24,128a8,8,0,0,1,8-8H224a8,8,0,0,1,0,16H32A8,8,0,0,1,24,128Zm8,56H224a8,8,0,0,0,0-16H32a8,8,0,0,0,0,16Zm0-112H224a8,8,0,0,0,0-16H32a8,8,0,0,0,0,16Z"></path>
                        </svg>
                      </div>
                      <p className="ml-16 text-lg leading-6 font-bold text-green-900">Enhanced Student Interaction</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-green-800">
                      Foster a more interactive learning environment where students can actively participate.
                    </dd>
                  </div>
                  <div className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-600 text-white">
                        <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M24,128a8,8,0,0,1,8-8H224a8,8,0,0,1,0,16H32A8,8,0,0,1,24,128Zm8,56H224a8,8,0,0,0,0-16H32a8,8,0,0,0,0,16Zm0-112H224a8,8,0,0,0,0-16H32a8,8,0,0,0,0,16Z"></path>
                        </svg>
                      </div>
                      <p className="ml-16 text-lg leading-6 font-bold text-green-900">Performance Tracking</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-green-800">
                      Monitor student progress and identify areas where additional support may be needed.
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-green-50 border-t-2 border-green-200">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-sm text-green-700">© 2025 StuNotes. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
