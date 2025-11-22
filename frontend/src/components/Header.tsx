import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import logo from '../assets/logo2.png'; 

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b h-20 border-gray-100 sticky top-0 z-50 items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* LEFT SIDE: LOGO + NAME */}
          <div className="flex items-center space-x-3">
            <a href="#hero" className="text-slate-600 hover:text-slate-900 transition-colors"><img 
              src={logo} 
              alt="DataGuard Logo" 
              className="h-16 w-auto object-contain" 
            /></a>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#workflow" className="text-slate-600 hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
            <a href="/login" className="text-slate-600 hover:text-slate-900 transition-colors">Login</a>
            <a 
              href="/dashboard" 
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-cyan-600 hover:to-emerald-600 transition-all"
            >
              Dashboard
            </a>
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</a>
              <a href="#workflow" className="text-slate-600 hover:text-slate-900 transition-colors">How It Works</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
              <a href="/login" className="text-slate-600 hover:text-slate-900 transition-colors">Login</a>
              <a 
                href="/dashboard" 
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-cyan-600 hover:to-emerald-600 transition-all inline-block text-center"
              >
                Dashboard
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
