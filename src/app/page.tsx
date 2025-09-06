import CompanyLogos from "@/components/atoms/company-logos";
import LightRays from "@/components/atoms/LightRays";
import FeaturesGrid from "@/components/molecules/features-grid";
import CTASection from "@/components/organisms/cta-section";
import Footer from "@/components/organisms/footer";
import HeroSection from "@/components/organisms/hero-section";
import Navbar from "@/components/organisms/navbar";

export default function HomePage() {
  const scrollThreshold = 500;
  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ACE1AF"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          scrollThreshold={scrollThreshold}
          className="w-full h-full"
        />
      </div>

      <div className="min-h-screen bg-transparent relative z-10">
        {/* Navigation */}
        <Navbar scrollThreshold={scrollThreshold} />

        {/* Main content with top padding to account for fixed navbar */}
        <div className="pt-24">
          {/* Hero Section */}
          <HeroSection />

          {/* Company Logos Carousel */}
          <CompanyLogos />

          {/* Features Grid */}
          <FeaturesGrid />

          {/* CTA Section */}
          <CTASection />

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </>
  );
}
