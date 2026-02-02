import { useEffect, useState, useRef, TouchEvent } from 'react';
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation({ threshold: 0.1 });

  // Minimum swipe distance for navigation (in pixels)
  const minSwipeDistance = 50;

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

  // Touch handlers for swipe navigation
  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNavigation('right');
    } else if (isRightSwipe) {
      handleNavigation('left');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
    <section id="gallery" className="py-12 md:py-24 bg-gradient-to-b from-background via-muted/30 to-background overflow-hidden">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div 
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-6 md:mb-12 transition-all duration-700 ease-out ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1.5 mb-3">
            <ImageIcon className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-primary">Photo Gallery</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 md:mb-4">
            Life at Our School
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
            Glimpses of our vibrant school community and enriching activities.
          </p>
        </div>

        {/* Main Gallery Content */}
        <div 
          ref={contentRef}
          className={`transition-all duration-700 ease-out ${
            contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Main Preview Area with Touch Support */}
          <div className="relative mb-4 md:mb-6">
            <div 
              className="relative aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] lg:aspect-[21/9] rounded-2xl md:rounded-3xl overflow-hidden bg-muted shadow-xl md:shadow-2xl"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
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
                        {/* Video play overlay */}
                        {!isVideoPlaying && (
                          <div 
                            className="absolute inset-0 flex items-center justify-center cursor-pointer bg-foreground/10"
                            onClick={() => setIsVideoPlaying(true)}
                          >
                            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-2xl active:scale-95 transition-transform">
                              <Play className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-foreground ml-1" />
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
                        <ImageIcon className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground" />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Gradient overlays - lighter on mobile */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/5 to-transparent pointer-events-none" />

              {/* Navigation arrows - hidden on mobile, visible on tablet+ */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNavigation('left')}
                disabled={isAnimating}
                className="hidden sm:flex absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/30 hover:bg-background/50 backdrop-blur-md border border-background/30 transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-background" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNavigation('right')}
                disabled={isAnimating}
                className="hidden sm:flex absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/30 hover:bg-background/50 backdrop-blur-md border border-background/30 transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-background" />
              </Button>

              {/* Video controls - compact on mobile */}
              {isVideo && isVideoPlaying && (
                <div className="absolute bottom-14 sm:bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full hover:bg-muted"
                  >
                    <Pause className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsVideoMuted(!isVideoMuted)}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full hover:bg-muted"
                  >
                    {isVideoMuted ? <VolumeX className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                  </Button>
                </div>
              )}

              {/* Info overlay - optimized for mobile */}
              {selectedItem && (
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
                  <div className="max-w-2xl">
                    <h3 className="font-display text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-background mb-1.5 sm:mb-2 drop-shadow-lg line-clamp-1">
                      {selectedItem.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      {selectedItem.category && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-background/25 backdrop-blur-sm text-background text-xs">
                          <Tag className="w-3 h-3" />
                          <span className="font-medium">{selectedItem.category}</span>
                        </div>
                      )}
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-background/25 backdrop-blur-sm text-background text-xs">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(selectedItem.created_at)}</span>
                      </div>
                      {isVideo && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/80 backdrop-blur-sm text-primary-foreground text-xs">
                          <Play className="w-3 h-3" />
                          <span className="font-medium">Video</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Counter - smaller on mobile */}
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-lg">
                <span className="text-xs sm:text-sm font-medium text-foreground">
                  {selectedIndex + 1}/{images.length}
                </span>
              </div>

              {/* Swipe hint - mobile only */}
              <div className="sm:hidden absolute top-2 left-2 bg-background/60 backdrop-blur-sm rounded-full px-2 py-1">
                <span className="text-[10px] text-foreground/80">← Swipe →</span>
              </div>
            </div>
          </div>

          {/* Dot indicators - mobile only */}
          <div className="flex sm:hidden justify-center gap-1.5 mb-4">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  selectedIndex === index 
                    ? 'bg-primary w-6' 
                    : 'bg-muted-foreground/30'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Horizontal Thumbnails Strip - hidden on small mobile, visible on larger screens */}
          <div className="hidden sm:block relative">
            {/* Scroll buttons */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (thumbnailsRef.current) {
                  thumbnailsRef.current.scrollBy({ left: -200, behavior: 'smooth' });
                }
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-background/90 hover:bg-background shadow-lg border border-border/50"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (thumbnailsRef.current) {
                  thumbnailsRef.current.scrollBy({ left: 200, behavior: 'smooth' });
                }
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-background/90 hover:bg-background shadow-lg border border-border/50"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </Button>

            {/* Thumbnails container */}
            <div 
              ref={thumbnailsRef}
              className="flex gap-2 md:gap-3 overflow-x-auto px-10 md:px-12 py-3 scroll-smooth touch-pan-x"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {images.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleThumbnailClick(index)}
                  disabled={isAnimating}
                  className={`relative flex-shrink-0 w-20 h-14 sm:w-24 sm:h-16 md:w-32 md:h-20 lg:w-40 lg:h-24 rounded-lg md:rounded-xl overflow-hidden transition-all duration-300 ${
                    selectedIndex === index 
                      ? 'ring-2 ring-primary ring-offset-1 ring-offset-background scale-105 shadow-lg' 
                      : 'opacity-50 hover:opacity-100'
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
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-background/80 flex items-center justify-center">
                          <Play className="w-3 h-3 md:w-4 md:h-4 text-foreground ml-0.5" />
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
                      <ImageIcon className="w-4 h-4 md:w-6 md:h-6 text-muted-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Fade edges */}
            <div className="absolute top-0 left-0 w-10 h-full bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-10 h-full bg-gradient-to-l from-background to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
