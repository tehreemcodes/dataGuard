import React from 'react';
    import { Github, Shield } from 'lucide-react';

    const Footer = () => {
      return (
        <footer className="bg-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold">DataGuard</span>
                </div>
                <p className="text-slate-300 leading-relaxed max-w-md">
                  Privacy-preserving data anonymization platform for secure data sharing and compliance.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-3 text-slate-300">
                  <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#workflow" className="hover:text-white transition-colors">How It Works</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <ul className="space-y-3 text-slate-300">
                  <li><a href="/login" className="hover:text-white transition-colors">Login</a></li>
                  <li><a href="https://github.com" className="hover:text-white transition-colors flex items-center space-x-2">
                    <Github className="w-4 h-4" />
                    <span>GitHub Repository</span>
                  </a></li>
                  <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="/support" className="hover:text-white transition-colors">Support</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-slate-400 text-sm">
                © 2025 DataGuard. All rights reserved.
              </p>
              
            </div>
          </div>
        </footer>
      );
    };

    export default Footer;