import { Link } from 'react-router-dom';
import { GraduationCap, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useSiteContent, getExtraData } from '@/hooks/useSiteContent';

interface FooterExtraData {
  quickLinks: string[];
  programs: string[];
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
}

const defaultExtraData: FooterExtraData = {
  quickLinks: ['About Us', 'Programs', 'Facilities', 'Admission', 'Gallery', 'Contact'],
  programs: ['Nursery & KG', 'Primary (1-5)', 'Middle School (6-8)', 'Secondary (9-10)'],
  socialLinks: { facebook: '#', twitter: '#', instagram: '#', youtube: '#' },
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { ref: footerRef, isVisible } = useScrollAnimation({ threshold: 0.1 });

  const { content } = useSiteContent('footer');
  const { content: contactContent } = useSiteContent('contact');
  const extraData = getExtraData<FooterExtraData>(content, defaultExtraData);

  const socialIcons = [
    { icon: Facebook, link: extraData.socialLinks?.facebook || '#' },
    { icon: Twitter, link: extraData.socialLinks?.twitter || '#' },
    { icon: Instagram, link: extraData.socialLinks?.instagram || '#' },
    { icon: Youtube, link: extraData.socialLinks?.youtube || '#' },
  ];

  return (
    <footer className="bg-foreground text-background">
      <div ref={footerRef} className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* School Info */}
          <div className={`space-y-4 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '0ms' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">{content?.title || 'Vivekananda International School'}</h3>
                <p className="text-sm text-background/70">{content?.subtitle || 'CBSE Affiliated School'}</p>
              </div>
            </div>
            <p className="text-background/80 text-sm leading-relaxed">
              {content?.description || "Nurturing young minds since establishment. We are committed to providing quality education that shapes tomorrow's leaders."}
            </p>
            <div className="flex gap-4">
              {socialIcons.map(({ icon: Icon, link }, index) => (
                <a 
                  key={index}
                  href={link} 
                  className={`w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-all duration-500 ${
                    isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  }`}
                  style={{ transitionDelay: `${200 + index * 50}ms` }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className={`transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '100ms' }}
          >
            <h4 className="font-display text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {extraData.quickLinks.map((link, index) => (
                <li 
                  key={link}
                  className={`transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                  style={{ transitionDelay: `${200 + index * 50}ms` }}
                >
                  <Link 
                    to={`/#${link.toLowerCase().replace(' ', '-')}`} 
                    className="text-background/80 hover:text-secondary transition-colors text-sm"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div className={`transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '200ms' }}
          >
            <h4 className="font-display text-lg font-semibold mb-4">Our Programs</h4>
            <ul className="space-y-3">
              {extraData.programs.map((program, index) => (
                <li 
                  key={program}
                  className={`transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                  style={{ transitionDelay: `${300 + index * 50}ms` }}
                >
                  <span className="text-background/80 text-sm">{program}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className={`transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '300ms' }}
          >
            <h4 className="font-display text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-4">
              {[
                { icon: MapPin, text: '123 Education Street, Knowledge City, State - 123456' },
                { icon: Phone, text: '+91 12345 67890' },
                { icon: Mail, text: 'info@vivekanandaschool.edu' },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <li 
                    key={index}
                    className={`flex items-start gap-3 transition-all duration-500 ${
                      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}
                    style={{ transitionDelay: `${400 + index * 75}ms` }}
                  >
                    <Icon className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-background/80 text-sm">{item.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`border-t border-background/20 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: '500ms' }}
        >
          <p className="text-background/60 text-sm text-center md:text-left">
            © {currentYear} {content?.title || 'Vivekananda International School'}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-background/60 hover:text-background text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-background/60 hover:text-background text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
