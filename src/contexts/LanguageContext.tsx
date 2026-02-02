import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

const translations: Translations = {
  // Navbar
  'nav.home': { en: 'Home', hi: 'होम' },
  'nav.about': { en: 'About', hi: 'हमारे बारे में' },
  'nav.programs': { en: 'Programs', hi: 'कार्यक्रम' },
  'nav.facilities': { en: 'Facilities', hi: 'सुविधाएं' },
  'nav.admission': { en: 'Admission', hi: 'प्रवेश' },
  'nav.contact': { en: 'Contact', hi: 'संपर्क' },
  'nav.gallery': { en: 'Gallery', hi: 'गैलरी' },
  
  // Common
  'common.learnMore': { en: 'Learn More', hi: 'और जानें' },
  'common.applyNow': { en: 'Apply Now', hi: 'अभी आवेदन करें' },
  'common.readMore': { en: 'Read More', hi: 'और पढ़ें' },
  'common.submit': { en: 'Submit', hi: 'जमा करें' },
  
  // Hero Section
  'hero.title': { en: 'Vivekananda International School', hi: 'विवेकानंद इंटरनेशनल स्कूल' },
  'hero.subtitle': { en: 'CBSE Affiliated School', hi: 'सीबीएसई संबद्ध विद्यालय' },
  'hero.description': { en: 'Nurturing Excellence, Building Tomorrow\'s Leaders', hi: 'उत्कृष्टता का पोषण, कल के नेताओं का निर्माण' },
  
  // About Section
  'about.title': { en: 'About Us', hi: 'हमारे बारे में' },
  'about.subtitle': { en: 'Building Future Leaders Since Establishment', hi: 'स्थापना के बाद से भविष्य के नेताओं का निर्माण' },
  
  // Programs Section
  'programs.title': { en: 'Our Programs', hi: 'हमारे कार्यक्रम' },
  'programs.subtitle': { en: 'Comprehensive Education for Every Stage', hi: 'हर चरण के लिए व्यापक शिक्षा' },
  
  // Facilities Section
  'facilities.title': { en: 'Our Facilities', hi: 'हमारी सुविधाएं' },
  'facilities.subtitle': { en: 'State-of-the-Art Infrastructure', hi: 'अत्याधुनिक बुनियादी ढांचा' },
  
  // Contact Section
  'contact.title': { en: 'Contact Us', hi: 'संपर्क करें' },
  'contact.subtitle': { en: 'Get in Touch With Us', hi: 'हमसे संपर्क करें' },
  
  // Footer
  'footer.rights': { en: 'All rights reserved', hi: 'सर्वाधिकार सुरक्षित' },
  
  // Gallery
  'gallery.title': { en: 'Photo Gallery', hi: 'फोटो गैलरी' },
  'gallery.subtitle': { en: 'Capturing Memorable Moments', hi: 'यादगार पलों को कैद करना' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
