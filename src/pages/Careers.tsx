
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import HeroSection from '@/components/careers/HeroSection';
import BenefitsSection from '@/components/careers/BenefitsSection';
import OpenPositions from '@/components/careers/OpenPositions';
import JoinTeamCTA from '@/components/careers/JoinTeamCTA';
import MarketingCareers from '@/components/careers/MarketingCareers';

const CareersPage = () => {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="pt-16">
          <HeroSection />
          <BenefitsSection />
          <MarketingCareers />
          <OpenPositions />
          <JoinTeamCTA />
        </div>

        <div className="mt-auto">
          <Footer />
        </div>
      </div>
      <ScrollToTop />
    </>
  );
};

export default CareersPage;
