import { useEffect, useState } from 'react';
import { Image as ImageIcon, Play, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category: string | null;
  media_type: string;
  created_at: string;
}

const GallerySection = () => {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation({ threshold: 0.1 });

  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await supabase
        .from('gallery')
        .select('id, title, image_url, category, media_type, created_at')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(12);

      setImages(data || []);
      setLoading(false);
    };

    fetchGallery();
  }, []);

  const openLightbox = (item: GalleryItem) => {
    setSelectedItem(item);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedItem(null);
    document.body.style.overflow = '';
  };

  if (loading) {
    return (
      <section className="py-12 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <section id="gallery" className="py-12 md:py-20 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div 
            ref={headerRef}
            className={`text-center max-w-3xl mx-auto mb-8 md:mb-12 transition-all duration-700 ease-out ${
              headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-4">
              <ImageIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Photo Gallery</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Life at Our School
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              Glimpses of our vibrant school community and enriching activities.
            </p>
          </div>

          {/* Responsive Grid Gallery */}
          <div 
            ref={contentRef}
            className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 transition-all duration-700 ease-out ${
              contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {images.map((item, index) => (
              <button
                key={item.id}
                onClick={() => openLightbox(item)}
                className={`group relative aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-muted shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''
                }`}
              >
                {item.media_type === 'video' ? (
                  <>
                    <video
                      src={item.image_url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground ml-0.5" />
                      </div>
                    </div>
                  </>
                ) : item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}

                {/* Hover overlay with title */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                    <p className="text-background text-sm md:text-base font-medium line-clamp-2">
                      {item.title}
                    </p>
                    {item.category && (
                      <span className="inline-block mt-1 text-xs bg-background/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-background/90">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 bg-foreground/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/20 hover:bg-background/30 flex items-center justify-center text-background transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div 
            className="max-w-4xl max-h-[85vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.media_type === 'video' ? (
              <video
                src={selectedItem.image_url}
                className="w-full max-h-[75vh] object-contain rounded-lg"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={selectedItem.image_url}
                alt={selectedItem.title}
                className="w-full max-h-[75vh] object-contain rounded-lg"
              />
            )}
            
            <div className="mt-4 text-center">
              <h3 className="text-background text-lg md:text-xl font-semibold">
                {selectedItem.title}
              </h3>
              {selectedItem.category && (
                <span className="inline-block mt-2 text-sm bg-primary/80 px-3 py-1 rounded-full text-primary-foreground">
                  {selectedItem.category}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GallerySection;
