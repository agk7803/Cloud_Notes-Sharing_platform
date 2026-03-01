import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import bgImage from '../../assets/register.jpg'; // Make sure this is the correct relative path
import logoImage from '../../assets/generated-image.png';

const Contact = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className="relative flex flex-col w-full h-screen font-sans overflow-hidden"
      style={{
        fontFamily: 'Inter, "Noto Sans", sans-serif',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <header className="flex items-center justify-between border-b border-green-200 px-8 py-3 bg-green-50 bg-opacity-70 text-green-900">
        <div className="flex items-center gap-3 text-green-600">
          <img src={logoImage} alt="Logo" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
          <h1 className="text-lg font-bold leading-tight tracking-tight">StudyHub</h1>
        </div>
        <nav className="flex gap-8 text-green-700 font-medium text-sm">
          <Link
            to="/"
            className="text-sm font-medium text-green-700 transition-colors hover:text-green-600"
          >
            Home
          </Link>
        </nav>
      </header>

      <main className="flex flex-col items-center justify-center px-6 py-4 flex-grow bg-green-50 bg-opacity-70">
        <section className="flex flex-col items-center text-center gap-2">
          <h2 className="text-green-900 text-3xl font-extrabold tracking-tight leading-snug">
            Contact Us
          </h2>
          <p className="text-green-700 text-base max-w-md">
            We're here to help! Reach out with any questions or feedback.
          </p>
        </section>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="w-full max-w-md space-y-4 mt-4"
        >
          <input
            aria-label="Name"
            name="name"
            type="text"
            placeholder="Your Name"
            className="block w-full rounded-md border border-green-300 bg-white px-3 py-2 text-base placeholder-green-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
          <input
            aria-label="Email"
            name="email"
            type="email"
            placeholder="Your Email"
            className="block w-full rounded-md border border-green-300 bg-white px-3 py-2 text-base placeholder-green-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
          <input
            aria-label="Subject"
            name="subject"
            type="text"
            placeholder="Subject of your message"
            className="block w-full rounded-md border border-green-300 bg-white px-3 py-2 text-base placeholder-green-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
          <textarea
            aria-label="Message"
            name="message"
            placeholder="Your message"
            className="block w-full min-h-[5rem] resize-none rounded-md border border-green-300 bg-white px-3 py-2 text-base placeholder-green-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-green-600 py-2 text-white font-semibold hover:bg-green-700 transition-colors"
          >
            Submit
          </button>
        </form>

        <footer className="w-full flex flex-col items-center mt-8">
          <h3 className="text-green-900 text-lg font-semibold mb-4">
            Contact Information
          </h3>
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-green-100 text-green-600 p-2">
                <span className="material-icons text-xl">email</span>
              </span>
              <span className="text-green-900 font-medium">
                rgitgroup17@gmail.com
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-green-100 text-green-600 p-2">
                <span className="material-icons text-xl">phone</span>
              </span>
              <span className="text-green-900 font-medium">
                +91 9321289044
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Contact;
