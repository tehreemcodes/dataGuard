import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import logo from '../assets/logo2.png';
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { auth, logout } = useAuth();   // ← Use AuthContext

  const loggedIn = Boolean(auth.token);
  const role = auth.role;
  const name = auth.name;

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b h-20 border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-full">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center space-x-3">
          <img src={logo} alt="DataGuard Logo" className="h-14 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {loggedIn ? (
            <>
              <Link to="/dashboard" className="text-slate-600 hover:text-slate-900">Dashboard</Link>
              <Link to="/upload" className="text-slate-600 hover:text-slate-900">Upload Dataset</Link>
              <Link to="/policies" className="text-slate-600 hover:text-slate-900">Policies</Link>

              {(role === "admin" || role === "compliance") && (
                <Link to="/audit" className="text-slate-600 hover:text-slate-900">Audit Logs</Link>
              )}
              {role === "admin" && (
                <Link to="/users" className="text-slate-600 hover:text-slate-900">Users</Link>
              )}

              <button
                onClick={logout}
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-slate-900">Login</Link>

              <Link
                to="/signup"
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-cyan-600 hover:to-emerald-600 transition"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden py-4 border-t bg-white border-gray-200 px-6">
          <nav className="flex flex-col space-y-4">

            {loggedIn ? (
              <>
                <Link to="/dashboard" className="text-slate-600">Dashboard</Link>
                <Link to="/upload" className="text-slate-600">Upload Dataset</Link>
                <Link to="/policies" className="text-slate-600">Policies</Link>

                {(role === "admin" || role === "compliance") && (
                  <Link to="/audit" className="text-slate-600">Audit Logs</Link>
                )}
                {role === "admin" && (
                  <Link to="/users" className="text-slate-600">Users</Link>
                )}

                <button
                  onClick={logout}
                  className="w-full bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600">Login</Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-4 py-2 rounded-lg"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
