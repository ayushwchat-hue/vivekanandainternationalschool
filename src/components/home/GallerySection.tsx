import { useEffect, useState, useRef } from 'react';
import { Image as ImageIcon, Play, Pause, Volume2, VolumeX, Calendar, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
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

  const selectedItem = images[selectedIndex];
  const isVideo = selectedItem?.media_type === 'video';

  const handleNavigation = (direction: 'left' | 'right') => {
    if (isAnimating) return;
    
    setSlideDirection(direction);
    setIsAnimating(true);
    setIsVideoPlaying(false);
    
    setTimeout(() => {
      if (direction === 'left') {
        setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
      } else {
        setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
      }
      setSlideDirection(null);
      setIsAnimating(false);
    }, 300);
  };

  const handleThumbnailClick = (index: number) => {
    if (isAnimating || index === selectedIndex) return;
    
    const direction = index > selectedIndex ? 'right' : 'left';
    setSlideDirection(direction);
    setIsAnimating(true);
    setIsVideoPlaying(false);
    
    setTimeout(() => {
      setSelectedIndex(index);
      setSlideDirection(null);
      setIsAnimating(false);
    }, 300);
  };

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (thumbnailsRef.current) {
      const scrollAmount = 200;
      thumbnailsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSlideClass = () => {
    if (!slideDirection) return 'translate-x-0 opacity-100';
    if (slideDirection === 'left') return '-translate-x-full opacity-0';
    return 'translate-x-full opacity-0';
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

        {/* Main Gallery Content */}
        <div 
          ref={contentRef}
          className={`transition-all duration-700 ease-out ${
            contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Main Preview Area */}
          <div className="relative mb-6">
            <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden bg-muted shadow-2xl">
              {/* Sliding Container */}
              <div 
                className={`absolute inset-0 transition-all duration-300 ease-out ${getSlideClass()}`}
              >
                {selectedItem && (
                  <>
                    {isVideo ? (
                      <>
                        <video
                          key={selectedItem.id}
                          src={selectedItem.image_url}
                          className="w-full h-full object-cover"
                          autoPlay={isVideoPlaying}
                          muted={isVideoMuted}
                          loop
                          playsInline
                          preload="auto"
                          onLoadedData={(e) => {
                            e.currentTarget.currentTime = 0.1;
                          }}
                        />
                        {/* Video thumbnail overlay when not playing */}
                        {!isVideoPlaying && (
                          <div 
                            className="absolute inset-0 flex items-center justify-center cursor-pointer bg-foreground/10"
                            onClick={() => setIsVideoPlaying(true)}
                          >
                            <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                              <Play className="w-8 h-8 text-primary-foreground ml-1" />
                            </div>
                          </div>
                        )}
                      </>
                    ) : selectedItem.image_url ? (
                      <img
                        src={selectedItem.image_url}
                        alt={selectedItem.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/40 via-transparent to-foreground/40 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent pointer-events-none" />

              {/* Navigation arrows */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNavigation('left')}
                disabled={isAnimating}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-md border border-background/30 transition-all duration-300 hover:scale-110 disabled:opacity-50"
              >
                <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-background" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNavigation('right')}
                disabled={isAnimating}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-md border border-background/30 transition-all duration-300 hover:scale-110 disabled:opacity-50"
              >
                <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-background" />
              </Button>

              {/* Video controls */}
              {isVideo && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                    className="w-8 h-8 rounded-full hover:bg-muted"
                  >
                    {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsVideoMuted(!isVideoMuted)}
                    className="w-8 h-8 rounded-full hover:bg-muted"
                  >
                    {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
              )}

              {/* Info overlay */}
              {selectedItem && (
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <div className="max-w-2xl">
                    <h3 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-background mb-3 drop-shadow-lg">
                      {selectedItem.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                      {selectedItem.category && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/20 backdrop-blur-sm text-background">
                          <Tag className="w-3.5 h-3.5" />
                          <span className="text-sm font-medium">{selectedItem.category}</span>
                        </div>
                      )}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/20 backdrop-blur-sm text-background">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-sm">{formatDate(selectedItem.created_at)}</span>
                      </div>
                      {isVideo && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/80 backdrop-blur-sm text-primary-foreground">
                          <Play className="w-3.5 h-3.5" />
                          <span className="text-sm font-medium">Video</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Counter */}
              <div className="absolute top-4 right-4 md:top-6 md:right-6 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                <span className="text-sm font-medium text-foreground">
                  {selectedIndex + 1} / {images.length}
                </span>
              </div>
            </div>
          </div>

          {/* Horizontal Thumbnails Strip */}
          <div className="relative">
            {/* Scroll buttons */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scrollThumbnails('left')}
              className="absolute -left-2 md:left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 hover:bg-background shadow-lg border border-border/50"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scrollThumbnails('right')}
              className="absolute -right-2 md:right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 hover:bg-background shadow-lg border border-border/50"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            {/* Thumbnails container */}
            <div 
              ref={thumbnailsRef}
              className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide px-8 md:px-12 py-4 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {images.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleThumbnailClick(index)}
                  disabled={isAnimating}
                  className={`relative flex-shrink-0 w-28 h-20 md:w-36 md:h-24 lg:w-44 lg:h-28 rounded-xl overflow-hidden transition-all duration-300 ${
                    selectedIndex === index 
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 shadow-xl' 
                      : 'opacity-60 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  {item.media_type === 'video' ? (
                    <>
                      <video
                        src={item.image_url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="auto"
                        onLoadedData={(e) => {
                          e.currentTarget.currentTime = 0.1;
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-foreground/30">
                        <div className="w-8 h-8 rounded-full bg-background/80 flex items-center justify-center">
                          <Play className="w-4 h-4 text-foreground ml-0.5" />
                        </div>
                      </div>
                    </>
                  ) : item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Thumbnail overlay with title */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <span className="absolute bottom-2 left-2 right-2 text-xs text-background font-medium truncate">
                      {item.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Fade edges */}
            <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-background to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
