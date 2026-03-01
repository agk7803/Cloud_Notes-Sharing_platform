function FAQ() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 transition-all duration-300">
          <header className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
              FAQ
            </h1>
            <p className="text-gray-500 text-lg">
              See answers to frequently asked questions here.
            </p>
          </header>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-center text-gray-500 italic">No questions listed yet.</p>
        </div>
      </div>
    </div>
  );
}
export default FAQ;
