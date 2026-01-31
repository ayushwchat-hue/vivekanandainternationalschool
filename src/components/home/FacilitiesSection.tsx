import { FlaskConical, BookMarked, Trophy, Computer, Bus, Utensils } from 'lucide-react';
import scienceLabImage from '@/assets/science-lab.jpg';
import libraryImage from '@/assets/library.jpg';
import sportsImage from '@/assets/sports.jpg';

const facilities = [
  {
    icon: FlaskConical,
    title: 'Science Labs',
    description: 'State-of-the-art physics, chemistry, and biology laboratories for hands-on learning.',
    image: scienceLabImage,
  },
  {
    icon: BookMarked,
    title: 'Library',
    description: 'A vast collection of books, journals, and digital resources for curious minds.',
    image: libraryImage,
  },
  {
    icon: Trophy,
    title: 'Sports Complex',
    description: 'Multi-sport facilities including basketball, cricket, football, and athletics.',
    image: sportsImage,
  },
];

const additionalFacilities = [
  { icon: Computer, title: 'Computer Labs', description: 'Modern IT infrastructure with latest software' },
  { icon: Bus, title: 'Transportation', description: 'Safe and comfortable school buses covering all areas' },
  { icon: Utensils, title: 'Cafeteria', description: 'Hygienic food options with nutritious meals' },
];

const FacilitiesSection = () => {
  return (
    <section id="facilities" className="py-16 md:py-24 section-gradient">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-2 mb-4">
            <span className="text-sm font-medium text-accent">Our Facilities</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            World-Class Infrastructure
          </h2>
          <p className="text-muted-foreground text-lg">
            We provide modern facilities that enhance the learning experience and support 
            the overall development of our students.
          </p>
        </div>
        
        {/* Main Facilities */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {facilities.map((facility, index) => {
            const Icon = facility.icon;
            return (
              <div 
                key={facility.title}
                className="group relative rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300"
              >
                <img 
                  src={facility.image} 
                  alt={facility.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Icon className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-background">
                      {facility.title}
                    </h3>
                  </div>
                  <p className="text-background/80 text-sm">
                    {facility.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Additional Facilities */}
        <div className="grid sm:grid-cols-3 gap-6">
          {additionalFacilities.map((facility) => {
            const Icon = facility.icon;
            return (
              <div 
                key={facility.title}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border card-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground">{facility.title}</h4>
                  <p className="text-sm text-muted-foreground">{facility.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FacilitiesSection;
