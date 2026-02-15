import React from "react";

function ModeSelector({ mode, setMode }) {
    return (
        <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={{ marginBottom: "15px", padding: "6px" }}
        >
            <option value="doubt">Doubt Solver</option>
            <option value="coding">Coding Assistant</option>
            <option value="math">Math Mode</option>
            <option value="exam">Exam Prep</option>
            <option value="summary">Summarizer</option>
            <option value="quiz">Quiz Me</option>
        </select>
    );
}

export default ModeSelector;
