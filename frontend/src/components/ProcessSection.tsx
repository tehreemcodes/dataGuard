import React from 'react';
    import { Upload, Settings, Shield, Download } from 'lucide-react';

    const ProcessSection = () => {
      const steps = [
        {
          icon: Upload,
          title: 'Upload Dataset',
          description: 'Securely upload your sensitive data files through our encrypted platform.'
        },
        {
          icon: Settings,
          title: 'Define Policy',
          description: 'Configure anonymization rules and privacy parameters for your specific needs.'
        },
        {
          icon: Shield,
          title: 'Run Anonymization',
          description: 'Apply advanced privacy-preserving techniques to protect sensitive information.'
        },
        {
          icon: Download,
          title: 'Download Output',
          description: 'Receive your anonymized dataset ready for safe sharing and analysis.'
        }
      ];

      return (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                What DataGuard Does
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Transform your sensitive data into privacy-compliant datasets in four simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-cyan-200 to-emerald-200 -translate-x-8"></div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    };

    export default ProcessSection;