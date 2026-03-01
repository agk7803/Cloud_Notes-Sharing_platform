function ChatMessage({ role, content }) {
    const isUser = role === "user";

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
            <div
                className={`max-w-xl px-4 py-3 rounded-2xl shadow-sm ${isUser
                        ? "bg-[#1dc962] text-white"
                        : "bg-white border text-gray-800"
                    }`}
            >
                {content}
            </div>
        </div>
    );
}

export default ChatMessage;
