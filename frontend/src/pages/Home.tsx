import React from 'react';
    import Header from '../components/Header';
    import HeroSection from '../components/HeroSection';
    import ProcessSection from '../components/ProcessSection';
    import FeaturesSection from '../components/FeaturesSection';
    import WorkflowSection from '../components/WorkflowSection';
    import Footer from '../components/Footer';

    export default function Home() {
      return (
        <div className="min-h-screen bg-white">
          <Header />
          <main>
            <HeroSection />
            <ProcessSection />
            <FeaturesSection />
            <WorkflowSection />
          </main>
          <Footer />
        </div>
      );
    }