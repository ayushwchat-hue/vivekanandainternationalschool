import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Parent of Class 8 Student',
    content: 'The school has transformed my child\'s approach to learning. The teachers are dedicated and the facilities are excellent. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Parent of Class 5 Student',
    content: 'My daughter loves going to school every day. The creative teaching methods and caring environment have made a huge difference in her confidence.',
    rating: 5,
  },
  {
    name: 'Dr. Amit Patel',
    role: 'Parent of Class 10 Student',
    content: 'The academic rigor combined with extracurricular activities has prepared my son well for future challenges. The school truly nurtures all-round development.',
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-primary">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/20 rounded-full px-4 py-2 mb-4">
            <span className="text-sm font-medium text-primary-foreground">Testimonials</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
            What Parents Say
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Hear from our community about their experience with Vivekananda International School.
          </p>
        </div>
        
        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-primary-foreground rounded-2xl p-6 relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />
              
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>
              
              {/* Content */}
              <p className="text-foreground/80 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-semibold text-primary">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
