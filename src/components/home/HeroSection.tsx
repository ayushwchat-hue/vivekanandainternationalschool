import { Link } from 'react-router-dom';
import { ArrowRight, Award, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-school.jpg';
import { useEffect, useState } from 'react';

const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-out ${
          isLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
        }`}
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 hero-overlay" />
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm border border-secondary/30 rounded-full px-4 py-2 mb-6 transition-all duration-700 ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
          style={{ transitionDelay: '200ms' }}
          >
            <Award className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">CBSE Affiliated School</span>
          </div>
          
          {/* Main Heading */}
          <h1 className={`font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-background mb-6 transition-all duration-700 ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '400ms' }}
          >
            Welcome to{' '}
            <span className="text-secondary">Vivekananda</span>{' '}
            International School
          </h1>
          
          {/* Subtitle */}
          <p className={`text-lg md:text-xl text-background/80 max-w-2xl mx-auto mb-8 transition-all duration-700 ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '600ms' }}
          >
            Nurturing Minds, Building Futures. A premier institution committed to 
            excellence in education from Nursery to Class 10.
          </p>
          
          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '800ms' }}
          >
            <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 h-12 text-base gap-2">
              <Link to="/admission">
                Apply for Admission
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-background/30 text-background hover:bg-background/10 px-8 h-12 text-base">
              <Link to="/#about">
                Learn More
              </Link>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-12 md:mt-16">
            {[
              { icon: Users, value: '1500+', label: 'Students', delay: '1000ms' },
              { icon: BookOpen, value: '50+', label: 'Expert Teachers', delay: '1100ms' },
              { icon: Award, value: '20+', label: 'Years Excellence', delay: '1200ms' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={stat.label}
                  className={`text-center p-4 rounded-xl bg-background/5 backdrop-blur-sm border border-background/10 transition-all duration-700 ease-out ${
                    isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
                  }`}
                  style={{ transitionDelay: stat.delay }}
                >
                  <Icon className="w-6 h-6 md:w-8 md:h-8 text-secondary mx-auto mb-2" />
                  <div className="font-display text-2xl md:text-4xl font-bold text-background">{stat.value}</div>
                  <div className="text-xs md:text-sm text-background/70">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: '1400ms' }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-background/50 flex items-start justify-center p-1 animate-bounce">
          <div className="w-1.5 h-3 bg-background/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
