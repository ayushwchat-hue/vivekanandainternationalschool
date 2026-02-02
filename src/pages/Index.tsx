import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/home/HeroSection';
import SlidingGallery from '@/components/home/SlidingGallery';
import AboutSection from '@/components/home/AboutSection';
import ProgramsSection from '@/components/home/ProgramsSection';
import FacilitiesSection from '@/components/home/FacilitiesSection';
import GallerySection from '@/components/home/GallerySection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import ContactSection from '@/components/home/ContactSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <SlidingGallery />
        <AboutSection />
        <ProgramsSection />
        <FacilitiesSection />
        <GallerySection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
