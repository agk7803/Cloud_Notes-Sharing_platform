import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCamera } from "react-icons/fa";
import { useNotes } from "./NoteContext";
import api from "./api/axios";

export default function Profile() {
  const outlet = useOutletContext() || {};
  const user = outlet.user;
  console.log("User object:", user);

  const streak = outlet.streak || 0;

  const { notes } = useNotes();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);

  const totalNotes = notes.length;

  const handleSave = async () => {
  try {
    setLoading(true);

    await api.put(`/users/update-profile/${user._id}`, {
      name,
    });

    alert("Profile updated successfully!");

  } catch (err) {
    console.error(err);
    alert("Error updating profile");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#1dc962] font-semibold mb-8 hover:opacity-80"
      >
        <FaArrowLeft />
        Back to Dashboard
      </button>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">

        {/* LEFT PROFILE CARD */}
        <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center text-center relative">

          <div className="relative mb-6">
            <div className="w-28 h-28 rounded-full bg-gradient-to-r from-[#1dc962] to-green-400 flex items-center justify-center text-4xl font-bold text-white shadow-md">
              {user?.name?.[0] || "U"}
            </div>

            <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow cursor-pointer hover:scale-105 transition">
              <FaCamera className="text-[#1dc962]" />
            </div>
          </div>

          <h2 className="text-xl font-bold mb-1">{user?.name}</h2>
          <p className="text-gray-500 text-sm mb-6">{user?.email}</p>

          <div className="w-full border-t pt-6 grid grid-cols-2 gap-4 text-sm">

            <div>
              <p className="font-bold text-2xl text-[#1dc962]">
                {totalNotes}
              </p>
              <p className="text-gray-500">Total Notes</p>
            </div>

            <div>
              <p className="font-bold text-2xl text-[#1dc962]">
                {streak}
              </p>
              <p className="text-gray-500">Day Streak</p>
            </div>

          </div>

        </div>

        {/* RIGHT SETTINGS PANEL */}
        <div className="md:col-span-2 bg-white rounded-3xl shadow-xl p-10">

          <h3 className="text-2xl font-bold mb-8">
            Account Settings
          </h3>

          <div className="space-y-6">

            <div>
              <label className="block text-sm font-semibold mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#1dc962] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-3 rounded-xl border bg-gray-100 text-gray-500"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className="mt-4 bg-gradient-to-r from-[#1dc962] to-green-400 text-white px-8 py-3 rounded-xl font-semibold shadow hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
