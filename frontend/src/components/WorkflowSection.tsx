import React from 'react';
    import { Upload, Settings, Shield, Download, ArrowRight } from 'lucide-react';

    const WorkflowSection = () => {
      const steps = [
        { icon: Upload, title: 'Upload', color: 'from-blue-500 to-cyan-500' },
        { icon: Settings, title: 'Policy', color: 'from-cyan-500 to-emerald-500' },
        { icon: Shield, title: 'Anonymize', color: 'from-emerald-500 to-green-500' },
        { icon: Download, title: 'Download', color: 'from-green-500 to-teal-500' }
      ];

      return (
        <section id="workflow" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Simple workflow to transform your sensitive data into privacy-compliant datasets
              </p>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-y-0 lg:space-x-8">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center text-center group">
                    <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      <step.icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-6 h-6 text-slate-400 hidden lg:block" />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="mt-16 bg-gradient-to-br from-slate-50 to-cyan-50 rounded-2xl p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    Ready to get started?
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Join thousands of organizations using DataGuard to safely share and analyze sensitive data while maintaining privacy compliance.
                  </p>
                  <button className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-cyan-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl">
                    Get Started Now
                  </button>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-slate-700">Enterprise-grade security</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-slate-700">GDPR & HIPAA compliant</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-slate-700">24/7 support included</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    };

    export default WorkflowSection;