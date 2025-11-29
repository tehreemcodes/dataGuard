import React from 'react';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './src/pages/Home';
import NotFound from './src/pages/NotFound';
import Login from './src/pages/Login';
import Signup from './src/pages/Signup';
import Dashboard from "./src/pages/Dashboard";
import UploadDataset from "./src/pages/UploadDataset";
import ClassifyDataset from "./src/pages/ClassifyDataset";
import CreatePolicy from "./src/pages/CreatePolicy";
import RunJob from "./src/pages/RunJob";

import ProtectedRoute from "./src/components/ProtectedRoutes";

const App: React.FC = () => {
  return (
    <Theme appearance="inherit" radius="large" scaling="100%">
      <Router>
        <main className="min-h-screen font-inter">

          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Application Area */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={["admin", "analyst", "compliance"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/upload"
              element={
                <ProtectedRoute roles={["admin", "analyst"]}>
                  <UploadDataset />
                </ProtectedRoute>
              }
            />

            <Route
              path="/classify/:id"
              element={
                <ProtectedRoute roles={["admin", "analyst"]}>
                  <ClassifyDataset />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-policy/:id"
              element={
                <ProtectedRoute roles={["admin", "analyst"]}>
                  <CreatePolicy />
                </ProtectedRoute>
              }
            />

            <Route
              path="/run-job/:id"
              element={
                <ProtectedRoute roles={["admin", "analyst", "compliance"]}>
                  <RunJob />
                </ProtectedRoute>
              }
            />

            {/* Future Expansion: Uncomment when ready
            <Route
              path="/policies"
              element={
                <ProtectedRoute roles={["admin", "analyst"]}>
                  <Policies />
                </ProtectedRoute>
              }
            />

            <Route
              path="/audit"
              element={
                <ProtectedRoute roles={["admin", "compliance"]}>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            */}
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            newestOnTop
            closeOnClick
            pauseOnHover
          />
        </main>
      </Router>
    </Theme>
  );
};

export default App;
