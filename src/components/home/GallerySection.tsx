import { useEffect, useState, useRef } from 'react';
import { Image as ImageIcon, Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Button } from '@/components/ui/button';

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
  const [scrollPosition, setScrollPosition] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { ref: headerRef } = useScrollAnimation({ threshold: 0.2 });

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

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = sliderRef.current.clientWidth * 0.8;
    const newPosition = direction === 'left' 
      ? scrollPosition - scrollAmount 
      : scrollPosition + scrollAmount;
    
    sliderRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  const handleScroll = () => {
    if (sliderRef.current) {
      setScrollPosition(sliderRef.current.scrollLeft);
    }
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = sliderRef.current 
    ? scrollPosition < sliderRef.current.scrollWidth - sliderRef.current.clientWidth - 10
    : true;

  // Split images into 2 rows
  const row1 = images.filter((_, i) => i % 2 === 0);
  const row2 = images.filter((_, i) => i % 2 === 1);

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
      <section id="gallery" className="py-12 md:py-20 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div 
            ref={headerRef}
            className="text-center max-w-3xl mx-auto mb-8 md:mb-12 animate-fade-in"
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
        </div>

        {/* Horizontal Slider with 2 Rows */}
        <div className="relative">
          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/90 hover:bg-background shadow-lg border border-border/50 transition-opacity ${
              canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/90 hover:bg-background shadow-lg border border-border/50 transition-opacity ${
              canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </Button>

          {/* Slider Container */}
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="flex flex-col gap-3 md:gap-4 overflow-x-auto px-4 md:px-8 pb-4 scroll-smooth"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {/* Row 1 */}
            <div className="flex gap-3 md:gap-4">
              {row1.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => openLightbox(item)}
                  className="group relative flex-shrink-0 w-40 h-32 sm:w-52 sm:h-40 md:w-64 md:h-48 lg:w-72 lg:h-52 rounded-xl md:rounded-2xl overflow-hidden bg-muted shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  style={{ animationDelay: `${index * 100}ms` }}
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
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground ml-0.5" />
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

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-background text-xs md:text-sm font-medium line-clamp-1">
                        {item.title}
                      </p>
                      {item.category && (
                        <span className="inline-block mt-1 text-[10px] md:text-xs bg-background/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-background/90">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Row 2 */}
            {row2.length > 0 && (
              <div className="flex gap-3 md:gap-4">
                {row2.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => openLightbox(item)}
                    className="group relative flex-shrink-0 w-40 h-32 sm:w-52 sm:h-40 md:w-64 md:h-48 lg:w-72 lg:h-52 rounded-xl md:rounded-2xl overflow-hidden bg-muted shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    style={{ animationDelay: `${(index + row1.length) * 100}ms` }}
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
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground ml-0.5" />
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

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-background text-xs md:text-sm font-medium line-clamp-1">
                          {item.title}
                        </p>
                        {item.category && (
                          <span className="inline-block mt-1 text-[10px] md:text-xs bg-background/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-background/90">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Gradient Edges */}
          <div className="absolute left-0 top-0 bottom-4 w-8 md:w-16 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-4 w-8 md:w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" />
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
