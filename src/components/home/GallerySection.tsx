import { useEffect, useState } from 'react';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category: string | null;
  media_type: string;
}

const GallerySection = () => {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation({ threshold: 0.1 });

  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await supabase
        .from('gallery')
        .select('id, title, image_url, category, media_type')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(12);

      setImages(data || []);
      setLoading(false);
    };

    fetchGallery();
  }, []);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => {
    setSelectedIndex(null);
    setIsVideoPlaying(true);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
      setIsVideoPlaying(true);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
      setIsVideoPlaying(true);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);

  const selectedItem = selectedIndex !== null ? images[selectedIndex] : null;
  const isVideo = selectedItem?.media_type === 'video';

  // Masonry pattern - varying heights
  const getItemHeight = (index: number) => {
    const patterns = ['aspect-[4/5]', 'aspect-square', 'aspect-[4/3]', 'aspect-[3/4]'];
    return patterns[index % patterns.length];
  };

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-muted/30">
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
      <section id="gallery" className="py-16 md:py-24 bg-gradient-to-b from-background via-muted/30 to-background overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div 
            ref={headerRef}
            className={`text-center max-w-3xl mx-auto mb-12 md:mb-16 transition-all duration-700 ease-out ${
              headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
              <ImageIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Photo Gallery</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Life at Our School
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Glimpses of our vibrant school community, memorable events, and enriching activities.
            </p>
          </div>

          {/* Masonry Grid */}
          <div 
            ref={gridRef} 
            className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
          >
            {images.map((item, index) => (
              <div
                key={item.id}
                onClick={() => openLightbox(index)}
                className={`group relative break-inside-avoid cursor-pointer overflow-hidden rounded-2xl bg-muted transition-all duration-500 ${
                  gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 75}ms` }}
              >
                <div className={`relative ${getItemHeight(index)} overflow-hidden`}>
                  {item.media_type === 'video' ? (
                    <div className="relative w-full h-full">
                      <video
                        src={item.image_url}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center group-hover:scale-0 transition-transform duration-300">
                          <Play className="w-5 h-5 text-foreground ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-semibold text-background text-sm md:text-base line-clamp-2">
                      {item.title}
                    </h3>
                    {item.category && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-background/20 text-xs text-background/80">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Video indicator */}
                {item.media_type === 'video' && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm">
                    <Play className="w-3 h-3 text-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Dialog */}
      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && closeLightbox()}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-background/95 backdrop-blur-xl border-none">
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-50 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Navigation - Previous */}
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm w-12 h-12"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            {/* Navigation - Next */}
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm w-12 h-12"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>

            {/* Media Content */}
            {selectedItem && (
              <div className="relative max-w-full max-h-[80vh] overflow-hidden rounded-xl">
                {isVideo ? (
                  <div className="relative">
                    <video
                      src={selectedItem.image_url}
                      className="max-w-full max-h-[80vh] rounded-xl"
                      autoPlay={isVideoPlaying}
                      muted={isVideoMuted}
                      loop
                      playsInline
                      controls={false}
                    />
                    {/* Video Controls */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                        className="w-8 h-8 rounded-full"
                      >
                        {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsVideoMuted(!isVideoMuted)}
                        className="w-8 h-8 rounded-full"
                      >
                        {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.title}
                    className="max-w-full max-h-[80vh] object-contain rounded-xl"
                  />
                )}
              </div>
            )}

            {/* Caption */}
            {selectedItem && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center bg-background/80 backdrop-blur-sm rounded-full px-6 py-2">
                <h3 className="font-semibold text-foreground">{selectedItem.title}</h3>
                {selectedItem.category && (
                  <span className="text-sm text-muted-foreground">{selectedItem.category}</span>
                )}
              </div>
            )}

            {/* Image counter */}
            <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-sm text-foreground font-medium">
                {selectedIndex !== null ? selectedIndex + 1 : 0} / {images.length}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GallerySection;
