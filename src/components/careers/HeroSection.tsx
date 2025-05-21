
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const scrollToPositions = () => {
    const section = document.getElementById('open-positions');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-gradient-to-b from-tobecatBlue-600 to-tobecatBlue-800 text-white py-20">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Join Our Team</h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Be part of a team that's passionate about creating innovative digital solutions 
          that help businesses grow.
        </p>
        <Button 
          className="bg-white text-tobecatBlue-700 hover:bg-gray-100"
          size="lg"
          onClick={scrollToPositions}
        >
          Browse Open Positions
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
