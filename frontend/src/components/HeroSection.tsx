import React from 'react';
    import { Shield, Database, Lock } from 'lucide-react';

    const HeroSection = () => {
      return (
        <section id='hero' className="bg-gradient-to-br from-slate-50 to-cyan-50 py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">DataGuard</span>
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  Privacy-Preserving Data{' '}
                  <span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                    Anonymization
                  </span>
                </h1>
                
                <p className="text-xl text-slate-600 leading-relaxed">
                  Securely mask, anonymize, and share sensitive datasets while maintaining data utility and compliance with privacy regulations.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-cyan-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl">
                    Get Started
                  </button>
                  <button className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-xl font-semibold hover:border-slate-400 hover:bg-slate-50 transition-all">
                    Login
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-3 flex items-center justify-center py-8 bg-gradient-to-br from-slate-50 to-cyan-50 rounded-xl">
                      <Database className="w-16 h-16 text-cyan-500" />
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-cyan-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">Secure</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Lock className="w-6 h-6 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">Private</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Database className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">Compliant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    };

    export default HeroSection;