import { useEffect, useState } from 'react';
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

  const goToPrevious = () => {
    setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
    setIsVideoPlaying(false);
  };

  const goToNext = () => {
    setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
    setIsVideoPlaying(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          <div className="grid lg:grid-cols-[1fr,380px] gap-6 lg:gap-8">
            {/* Main Preview */}
            <div className="relative">
              <div className="relative aspect-[4/3] md:aspect-video rounded-3xl overflow-hidden bg-muted shadow-2xl">
                {selectedItem && (
                  <>
                    {isVideo ? (
                      <video
                        key={selectedItem.id}
                        src={selectedItem.image_url}
                        className="w-full h-full object-cover"
                        autoPlay={isVideoPlaying}
                        muted={isVideoMuted}
                        loop
                        playsInline
                        preload="metadata"
                      />
                    ) : selectedItem.image_url ? (
                      <img
                        src={selectedItem.image_url}
                        alt={selectedItem.title}
                        className="w-full h-full object-cover transition-opacity duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />

                    {/* Navigation arrows */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={goToPrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/30 hover:bg-background/50 backdrop-blur-sm border border-background/20"
                    >
                      <ChevronLeft className="w-6 h-6 text-background" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={goToNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/30 hover:bg-background/50 backdrop-blur-sm border border-background/20"
                    >
                      <ChevronRight className="w-6 h-6 text-background" />
                    </Button>

                    {/* Video controls */}
                    {isVideo && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2">
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

                    {/* Counter */}
                    <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-sm font-medium text-foreground">
                        {selectedIndex + 1} / {images.length}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Details Panel */}
            <div className="flex flex-col gap-6">
              {/* Selected Item Details */}
              {selectedItem && (
                <div className="bg-card rounded-2xl p-6 shadow-lg border border-border/50">
                  <div className="space-y-4">
                    {/* Title */}
                    <h3 className="font-display text-xl md:text-2xl font-bold text-foreground leading-tight">
                      {selectedItem.title}
                    </h3>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-3">
                      {selectedItem.category && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                          <Tag className="w-3.5 h-3.5" />
                          <span className="text-sm font-medium">{selectedItem.category}</span>
                        </div>
                      )}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-sm">{formatDate(selectedItem.created_at)}</span>
                      </div>
                      {isVideo && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary">
                          <Play className="w-3.5 h-3.5" />
                          <span className="text-sm font-medium">Video</span>
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-border" />

                    {/* Type indicator */}
                    <p className="text-sm text-muted-foreground">
                      {isVideo 
                        ? 'Click play to watch this video from our school events.' 
                        : 'A memorable moment captured at our school.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Thumbnails Grid */}
              <div className="bg-card rounded-2xl p-4 shadow-lg border border-border/50">
                <p className="text-sm font-medium text-muted-foreground mb-3 px-1">Browse Gallery</p>
                <div className="grid grid-cols-4 gap-2 max-h-[280px] overflow-y-auto pr-1">
                  {images.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedIndex(index);
                        setIsVideoPlaying(false);
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
                        selectedIndex === index 
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-card scale-95' 
                          : 'hover:opacity-80'
                      }`}
                    >
                      {item.media_type === 'video' ? (
                        <>
                          <video
                            src={item.image_url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                            <Play className="w-4 h-4 text-background" />
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
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
