import React, { useState } from "react";
import { sendAcademicMessage } from "./aiService";
import ReactMarkdown from "react-markdown";


function AcademicAI() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = message;

    setChat((prev) => [...prev, { role: "user", content: userMessage }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await sendAcademicMessage(userMessage);
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: res.reply }
      ]);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: "Error getting response." }
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-gradient-to-br from-[#1dc962]/30 via-white to-[#1dc962]/10">

      {/* Header */}
      <div className="text-center pt-16">
        <h1 className="text-4xl font-bold text-gray-800">
          🎓 Academic AI
        </h1>
        <p className="text-gray-600 mt-3 text-lg">
          Ask doubts, generate summaries, and prepare smarter.
        </p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 mt-12 max-w-4xl mx-auto w-full px-8 space-y-6 overflow-y-auto">

        {chat.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-2xl font-semibold">
              How can I help you today?
            </p>
            <p className="mt-3 text-gray-400">
              Start by asking your academic question below.
            </p>
          </div>
        ) : (
          chat.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-6 py-3 rounded-2xl max-w-xl shadow-md ${
                  msg.role === "user"
                    ? "bg-[#1dc962] text-white"
                    : "bg-white border text-gray-800"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="text-gray-400 animate-pulse">
            AI is thinking...
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="w-full max-w-4xl mx-auto px-8 pb-8">
        <div className="bg-white shadow-xl rounded-2xl px-5 py-3 flex items-center border border-gray-200">

          <input
            type="text"
            placeholder="Ask your academic doubt..."
            className="flex-1 bg-transparent outline-none text-gray-700 text-lg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button
            onClick={handleSend}
            className="bg-[#1dc962] hover:bg-green-600 text-white px-6 py-2 rounded-xl transition shadow-md"
          >
            Send
          </button>

        </div>
      </div>

    </div>
  );
}

export default AcademicAI;
