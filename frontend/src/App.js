import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import ViewNotes from './ViewNotes';
import FAQ from './FAQ';
import Landing from "./Landing";
import Layout from './Layout';
import Dashboard from './Dashboard';
import Calendar from './Calendar';
import Assessments from './Assessments';
import TestWindow from './TestWindow';
import StudyGroups from './StudyGroups';
import GroupWorkspace from './GroupWorkspace';
import { NoteProvider } from './NoteContext';
import About from "./About";
import Contact from "./Contact";
import Privacy from "./Privacy";
import Terms from "./Terms";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Routes with Persistent Sidebar */}
      <Route element={
        <NoteProvider>
          <Layout />
        </NoteProvider>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/view" element={<ViewNotes />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/assessments" element={<Assessments />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/groups" element={<StudyGroups />} />
        <Route path="/groups/:groupId" element={<GroupWorkspace />} />
      </Route>

      {/* Standalone Routes (Focus Mode) */}
      <Route path="/test-window/:testId" element={<TestWindow />} />
    </Routes>
  );
}

export default App;
