import React from 'react';
    import { Shield, Users, BarChart3, FileCheck, Activity, Lock } from 'lucide-react';

    const FeaturesSection = () => {
      const features = [
        {
          icon: Shield,
          title: 'k-Anonymity',
          description: 'Ensure each record is indistinguishable from at least k-1 other records in the dataset.'
        },
        {
          icon: Users,
          title: 'l-Diversity',
          description: 'Guarantee diversity in sensitive attributes within each equivalence class.'
        },
        {
          icon: BarChart3,
          title: 'Differential Privacy',
          description: 'Add calibrated noise to provide mathematical privacy guarantees.'
        },
        {
          icon: Lock,
          title: 'RBAC Authentication',
          description: 'Role-based access control with enterprise-grade security protocols.'
        },
        {
          icon: Activity,
          title: 'Audit Logs',
          description: 'Complete audit trail of all data processing and access activities.'
        },
        {
          icon: FileCheck,
          title: 'Compliance Ready',
          description: 'Built-in support for GDPR, HIPAA, and other privacy regulations.'
        }
      ];

      return (
        <section id="features" className="py-20 bg-gradient-to-br from-slate-50 to-cyan-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Key Features
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Advanced privacy-preserving technologies to protect your sensitive data
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    };

    export default FeaturesSection;