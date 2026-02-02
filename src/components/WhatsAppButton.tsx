import { MessageCircle } from 'lucide-react';
import { useSiteContent, getExtraData } from '@/hooks/useSiteContent';

interface WhatsAppData {
  phoneNumber: string;
  message: string;
}

const defaultData: WhatsAppData = {
  phoneNumber: '919876543210',
  message: 'Hello! I would like to inquire about admissions at Vivekananda International School.',
};

const WhatsAppButton = () => {
  const { content, loading } = useSiteContent('whatsapp');
  const data = getExtraData<WhatsAppData>(content, defaultData);
  
  const phoneNumber = data.phoneNumber || defaultData.phoneNumber;
  const message = encodeURIComponent(data.message || defaultData.message);
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  if (loading) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="absolute right-16 bg-foreground text-background text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md">
        Chat with us
      </span>
    </a>
  );
};

export default WhatsAppButton;
