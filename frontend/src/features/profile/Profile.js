import React, { useState, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCamera } from "react-icons/fa";
import { useNotes } from "../notes/NoteContext";
import api from "../../services/api";

export default function Profile() {
  const outlet = useOutletContext() || {};
  const { user, refreshUser } = outlet;

  const streak = outlet.streak || 0;
  const { notes } = useNotes();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.fullName || user?.name || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(
    user?.profilePicture || user?.photoURL || ""
  );
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalNotes = notes.length;

  // Handle file selection
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setImgError(false); // Reset error on new selection
    }
  };

  // ✅ FIXED handleSave (ONLY ONE FUNCTION)
  const handleSave = async () => {
    try {
      setLoading(true);

      let updatedPhotoURL =
        user?.profilePicture || user?.photoURL || "";

      // 1️⃣ Upload image if selected
      if (file) {
        const formData = new FormData();
        formData.append("image", file);

        const uploadRes = await api.post(
          "/upload/profile-pic",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        updatedPhotoURL = uploadRes.data.imageUrl;
      }

      await api.put("/users/update-profile", {
        name: name,
        profilePicture: updatedPhotoURL,
      });

      // Update localStorage to keep it in sync
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ 
        ...storedUser, 
        displayName: name, 
        photoURL: updatedPhotoURL 
      }));

      if (refreshUser) refreshUser();
      alert("Profile updated successfully!");

    } catch (err) {
      console.error("Profile Update Error:", err);
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <header className="flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                My Profile
              </h1>
              <p className="text-gray-500 text-lg">
                Manage your personal information and account settings
              </p>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:border-green-400 hover:text-green-600 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <FaArrowLeft className="text-gray-400 transition-transform duration-300" />
              Back
            </button>
          </header>
        </div>

        {/* LEFT PROFILE CARD */}
        <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center text-center relative">

          <div className="relative mb-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
              autoComplete="off"
            />

            {(preview && !imgError) ? (
              <img
                src={preview}
                alt="Profile"
                onError={() => setImgError(true)}
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-r from-[#1dc962] to-green-400 flex items-center justify-center text-4xl font-bold text-white shadow-md">
                {(name?.[0] || "U").toUpperCase()}
              </div>
            )}

            <div
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow cursor-pointer hover:scale-105 transition"
            >
              <FaCamera className="text-[#1dc962]" />
            </div>
          </div>

          <h2 className="text-xl font-bold mb-1">{name}</h2>
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
