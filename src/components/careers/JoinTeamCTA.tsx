
import React from 'react';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

const JoinTeamCTA = () => {
  const scrollToMarketingCareers = () => {
    const section = document.getElementById('marketing-careers');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-tobecatAccent-purple py-16">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Join Our Team?</h2>
        <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
          Take the first step towards joining a company that values innovation, growth, and making a real impact.
        </p>
        <Button 
          size="lg"
          className="bg-white text-tobecatAccent-purple hover:bg-gray-100"
          onClick={scrollToMarketingCareers}
        >
          <Briefcase className="mr-2 h-5 w-5" />
          Explore Job Openings
        </Button>
      </div>
    </section>
  );
};

export default JoinTeamCTA;
