import { Link } from 'react-router-dom';
import { GraduationCap, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* School Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">Vivekananda International School</h3>
                <p className="text-sm text-background/70">CBSE Affiliated School</p>
              </div>
            </div>
            <p className="text-background/80 text-sm leading-relaxed">
              Nurturing young minds since establishment. We are committed to providing quality education 
              that shapes tomorrow's leaders.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {['About Us', 'Programs', 'Facilities', 'Admission', 'Gallery', 'Contact'].map((link) => (
                <li key={link}>
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
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Our Programs</h4>
            <ul className="space-y-3">
              {['Nursery & KG', 'Primary (1-5)', 'Middle School (6-8)', 'Secondary (9-10)'].map((program) => (
                <li key={program}>
                  <span className="text-background/80 text-sm">{program}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                <span className="text-background/80 text-sm">
                  123 Education Street, Knowledge City, State - 123456
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary flex-shrink-0" />
                <span className="text-background/80 text-sm">+91 12345 67890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary flex-shrink-0" />
                <span className="text-background/80 text-sm">info@vivekanandaschool.edu</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/60 text-sm text-center md:text-left">
            © {currentYear} Vivekananda International School. All rights reserved.
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
