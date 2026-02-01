import { Baby, Backpack, GraduationCap, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const programs = [
  {
    icon: Baby,
    title: 'Nursery & Kindergarten',
    classes: 'Nursery, LKG, UKG',
    age: '3-6 years',
    description: 'A nurturing environment where young minds begin their educational journey through play-based learning.',
    features: ['Play-based learning', 'Motor skills development', 'Language & literacy', 'Creative expression'],
    color: 'secondary',
  },
  {
    icon: Backpack,
    title: 'Primary School',
    classes: 'Class 1-5',
    age: '6-11 years',
    description: 'Building strong foundations in core subjects with focus on holistic development.',
    features: ['Core academics', 'Sports & games', 'Arts & crafts', 'Value education'],
    color: 'primary',
  },
  {
    icon: BookOpen,
    title: 'Middle School',
    classes: 'Class 6-8',
    age: '11-14 years',
    description: 'Expanding horizons with deeper subject knowledge and skill development.',
    features: ['Advanced subjects', 'Lab practicals', 'Computer education', 'Personality development'],
    color: 'accent',
  },
  {
    icon: GraduationCap,
    title: 'Secondary School',
    classes: 'Class 9-10',
    age: '14-16 years',
    description: 'Preparing students for board examinations and future academic pursuits.',
    features: ['Board preparation', 'Career guidance', 'Competitive exams', 'Leadership programs'],
    color: 'secondary',
  },
];

const ProgramsSection = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation({ threshold: 0.5 });

  return (
    <section id="programs" className="py-16 md:py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div 
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-12 md:mb-16 transition-all duration-700 ease-out ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
            <span className="text-sm font-medium text-primary">Academic Programs</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Programs for Every Stage
          </h2>
          <p className="text-muted-foreground text-lg">
            From early childhood to secondary education, we offer comprehensive programs 
            designed to meet the unique needs of each developmental stage.
          </p>
        </div>
        
        {/* Programs Grid */}
        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((program, index) => {
            const Icon = program.icon;
            const colorClasses = {
              primary: 'bg-primary/10 text-primary',
              secondary: 'bg-secondary/10 text-secondary',
              accent: 'bg-accent/10 text-accent',
            };
            
            return (
              <div 
                key={program.title}
                className={`group bg-card rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-500 border border-border hover:-translate-y-1 ${
                  cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-xl ${colorClasses[program.color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
                  <Icon className="w-7 h-7" />
                </div>
                
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  {program.title}
                </h3>
                
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                    {program.classes}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {program.age}
                  </span>
                </div>
                
                <p className="text-muted-foreground text-sm mb-4">
                  {program.description}
                </p>
                
                <ul className="space-y-2">
                  {program.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        
        {/* CTA */}
        <div 
          ref={ctaRef}
          className={`text-center mt-12 transition-all duration-700 ease-out ${
            ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <Button asChild size="lg" className="gap-2">
            <Link to="/admission">
              Enroll Your Child Today
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
