import { Target, Eye, Heart, Lightbulb } from 'lucide-react';
import classroomImage from '@/assets/classroom.jpg';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const AboutSection = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation({ threshold: 0.15 });

  return (
    <section id="about" className="py-16 md:py-24 section-gradient">
      <div className="container mx-auto px-4">
        <div ref={sectionRef} className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className={`relative transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
          }`}>
            <div className="relative rounded-2xl overflow-hidden card-shadow">
              <img 
                src={classroomImage} 
                alt="Students learning in classroom" 
                className="w-full h-80 md:h-96 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <Heart className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-background font-semibold">Caring Environment</p>
                    <p className="text-background/70 text-sm">Every child matters to us</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Card */}
            <div className={`absolute -bottom-6 right-4 bg-card p-4 rounded-xl card-shadow border border-border hidden md:block transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Innovative Learning</p>
                  <p className="text-xs text-muted-foreground">Modern Teaching Methods</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className={`space-y-6 transition-all duration-700 ease-out delay-200 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
          }`}>
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2">
              <span className="text-sm font-medium text-primary">About Our School</span>
            </div>
            
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Excellence in Education Since Establishment
            </h2>
            
            <p className="text-muted-foreground text-lg leading-relaxed">
              Vivekananda International School is dedicated to providing holistic education 
              that nurtures intellectual, physical, and emotional growth. Our CBSE curriculum 
              combined with innovative teaching methods prepares students for future success.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6 pt-4">
              <div className={`flex items-start gap-4 transition-all duration-500 delay-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground mb-1">Our Mission</h4>
                  <p className="text-sm text-muted-foreground">
                    To provide quality education through innovative teaching, fostering creativity and critical thinking.
                  </p>
                </div>
              </div>
              
              <div className={`flex items-start gap-4 transition-all duration-500 delay-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground mb-1">Our Vision</h4>
                  <p className="text-sm text-muted-foreground">
                    To be a premier educational institution that inspires students to become global citizens.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
