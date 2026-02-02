import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/home/HeroSection';
import GallerySection from '@/components/home/GallerySection';
import AboutSection from '@/components/home/AboutSection';
import ProgramsSection from '@/components/home/ProgramsSection';
import FacilitiesSection from '@/components/home/FacilitiesSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import ContactSection from '@/components/home/ContactSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <GallerySection />
        <AboutSection />
        <ProgramsSection />
        <FacilitiesSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
