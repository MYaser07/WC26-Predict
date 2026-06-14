import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Leaderboard from './pages/Leaderboard';
import Groups from './pages/Groups';
import Admin from './pages/Admin';
import MyPicks from './pages/MyPicks';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <img src="/wc26-logo.png" alt="" className="h-12 w-12 object-contain animate-pulse" />
    </div>
  );
  if (!user) return <Navigate to="/register" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <div className="app-bg">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
          <Route path="/mypicks" element={<ProtectedRoute><MyPicks /></ProtectedRoute>} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
