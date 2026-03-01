import React, { useState, useEffect, useRef } from "react";
import { sendAcademicMessage } from "./aiService";
import ReactMarkdown from "react-markdown";

function AcademicAI() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const hasStarted = chat.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = message;

    setChat(prev => [...prev, { role: "user", content: userMessage }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await sendAcademicMessage(userMessage);
      setChat(prev => [
        ...prev,
        { role: "assistant", content: res.reply }
      ]);
    } catch {
      setChat(prev => [
        ...prev,
        { role: "assistant", content: "Error getting response." }
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col">

      {/* 🔹 HEADER */}
      <div className={`px-8 pt-10 transition-all duration-500 ${hasStarted ? "w-full" : "flex flex-col items-center justify-center flex-1"}`}>
        <div className={`w-full max-w-5xl mx-auto mb-8 transition-all duration-300 ${!hasStarted ? "text-center" : ""}`}>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            🎓 Academic AI
          </h1>

          {!hasStarted && (
            <p className="text-gray-500 text-lg mt-3">
              Ask doubts, generate summaries, and prepare smarter.
            </p>
          )}
        </div>
      </div>

      {/* 🔹 MESSAGES */}
      {hasStarted && (
        <div className="flex-1 overflow-y-auto px-8 mt-6 space-y-8 pb-40 max-w-3xl mx-auto">

          {chat.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              {msg.role === "user" ? (
                <div className="bg-black text-white px-5 py-3 rounded-2xl max-w-md shadow">
                  {msg.content}
                </div>
              ) : (
                <div className="bg-white/70 backdrop-blur-md border border-white/40 px-6 py-4 rounded-2xl max-w-2xl shadow text-gray-900 text-sm leading-relaxed">
                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="text-gray-600 animate-pulse">
              AI is thinking...
            </div>
          )}

          <div ref={messagesEndRef} />

        </div>
      )}

      {/* 🔹 INPUT (ALWAYS FIXED BOTTOM LIKE CHATGPT) */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center px-8">
        <div className="w-full max-w-3xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl flex items-center px-5 py-3">

          <input
            type="text"
            placeholder="Ask your academic doubt..."
            className="flex-1 bg-transparent outline-none text-gray-800"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button
            onClick={handleSend}
            className="bg-black text-white px-5 py-2 rounded-xl ml-3 hover:opacity-80 transition"
          >
            Send
          </button>

        </div>
      </div>

    </div>
  );
}

export default AcademicAI;
