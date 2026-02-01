import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useSiteContent, getExtraData } from '@/hooks/useSiteContent';

interface ContactItem {
  title: string;
  content: string[];
}

interface ContactExtraData {
  contactItems: ContactItem[];
}

const defaultContactItems: ContactItem[] = [
  { title: 'Address', content: ['123 Education Street, Knowledge City,', 'State - 123456'] },
  { title: 'Phone', content: ['+91 12345 67890', '+91 98765 43210'] },
  { title: 'Email', content: ['info@vivekanandaschool.edu', 'admissions@vivekanandaschool.edu'] },
  { title: 'Office Hours', content: ['Monday - Saturday: 8:00 AM - 4:00 PM', 'Sunday: Closed'] },
];

const iconMap: Record<string, typeof MapPin> = {
  Address: MapPin,
  Phone: Phone,
  Email: Mail,
  'Office Hours': Clock,
};

const bgColorMap: Record<string, string> = {
  Address: 'bg-primary',
  Phone: 'bg-secondary',
  Email: 'bg-accent',
  'Office Hours': 'bg-muted',
};

const ContactSection = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const { ref: leftRef, isVisible: leftVisible } = useScrollAnimation({ threshold: 0.15 });
  const { ref: rightRef, isVisible: rightVisible } = useScrollAnimation({ threshold: 0.15 });

  const { content } = useSiteContent('contact');
  const extraData = getExtraData<ContactExtraData>(content, { contactItems: defaultContactItems });
  const contactItems = extraData.contactItems || defaultContactItems;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Message Sent!',
      description: "We'll get back to you within 24 hours.",
    });

    setFormData({ name: '', email: '', phone: '', message: '' });
    setIsLoading(false);
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Info */}
          <div 
            ref={leftRef}
            className={`space-y-8 transition-all duration-700 ease-out ${
              leftVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
                <span className="text-sm font-medium text-primary">{content?.subtitle || 'Get in Touch'}</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {content?.title || 'Contact Us'}
              </h2>
              <p className="text-muted-foreground text-lg">
                {content?.description || "We're here to answer your questions and help you with the admission process."}
              </p>
            </div>
            
            <div className="space-y-6">
              {contactItems.map((item, index) => {
                const Icon = iconMap[item.title] || MapPin;
                const bgColor = bgColorMap[item.title] || 'bg-muted';
                const iconColor = item.title === 'Office Hours' ? 'text-foreground' : 'text-primary-foreground';
                
                return (
                  <div 
                    key={item.title}
                    className={`flex items-start gap-4 transition-all duration-500 ${
                      leftVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{ transitionDelay: `${300 + index * 100}ms` }}
                  >
                    <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${iconColor}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                      {item.content.map((line, i) => (
                        <p key={i} className="text-muted-foreground">{line}</p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Contact Form */}
          <div 
            ref={rightRef}
            className={`bg-card rounded-2xl p-6 md:p-8 card-shadow border border-border transition-all duration-700 ease-out delay-200 ${
              rightVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            <h3 className="font-display text-2xl font-bold text-foreground mb-6">
              Send us a Message
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-12"
                />
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-12"
                />
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="h-12"
                />
              </div>
              
              <Textarea
                placeholder="Your Message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={5}
                className="resize-none"
              />
              
              <Button type="submit" size="lg" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? (
                  'Sending...'
                ) : (
                  <>
                    Send Message
                    <Send className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
