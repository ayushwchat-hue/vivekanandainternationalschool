import { useEffect, useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category: string | null;
  media_type: string;
}

const SlidingGallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [mutedVideos, setMutedVideos] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });

  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await supabase
        .from('gallery')
        .select('id, title, image_url, category, media_type')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (data && data.length > 0) {
        // Duplicate items to create seamless loop
        setItems([...data, ...data]);
      }
      setLoading(false);
    };

    fetchGallery();
  }, []);

  const handleVideoClick = (id: string, videoElement: HTMLVideoElement) => {
    if (playingVideo === id) {
      videoElement.pause();
      setPlayingVideo(null);
    } else {
      // Pause all other videos
      document.querySelectorAll('video').forEach(v => v.pause());
      videoElement.play();
      setPlayingVideo(id);
    }
  };

  const toggleMute = (id: string, videoElement: HTMLVideoElement) => {
    const newMuted = !mutedVideos[id];
    videoElement.muted = newMuted;
    setMutedVideos(prev => ({ ...prev, [id]: newMuted }));
  };

  if (loading) {
    return null;
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <div 
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto transition-all duration-700 ease-out ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
            <span className="text-sm font-medium text-primary">School Memories</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
            Life at Our Campus
          </h2>
          <p className="text-muted-foreground text-lg">
            Glimpses of learning, growth, and memorable moments
          </p>
        </div>
      </div>

      {/* Sliding Gallery Container */}
      <div 
        ref={containerRef}
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-muted/30 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-muted/30 to-transparent z-10 pointer-events-none" />

        {/* Scrolling Track */}
        <div 
          className={`flex gap-4 ${isPaused ? '' : 'animate-scroll'}`}
          style={{
            width: 'fit-content',
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {items.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="flex-shrink-0 group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              style={{
                width: index % 3 === 0 ? '320px' : index % 3 === 1 ? '280px' : '240px',
                height: index % 3 === 0 ? '220px' : index % 3 === 1 ? '180px' : '200px',
              }}
            >
              {item.media_type === 'video' ? (
                <>
                  <video
                    src={item.image_url}
                    className="w-full h-full object-cover"
                    loop
                    muted={mutedVideos[item.id] !== false}
                    playsInline
                    onClick={(e) => handleVideoClick(item.id, e.currentTarget)}
                  />
                  {/* Video Controls Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const video = e.currentTarget.closest('.group')?.querySelector('video');
                          if (video) handleVideoClick(item.id, video);
                        }}
                        className="w-10 h-10 rounded-full bg-background/90 flex items-center justify-center text-foreground hover:bg-background transition-colors"
                      >
                        {playingVideo === item.id ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5 ml-0.5" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const video = e.currentTarget.closest('.group')?.querySelector('video');
                          if (video) toggleMute(item.id, video);
                        }}
                        className="w-8 h-8 rounded-full bg-background/90 flex items-center justify-center text-foreground hover:bg-background transition-colors"
                      >
                        {mutedVideos[item.id] === false ? (
                          <Volume2 className="w-4 h-4" />
                        ) : (
                          <VolumeX className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {/* Video Badge */}
                  <div className="absolute top-3 right-3 bg-foreground/80 text-background text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    Video
                  </div>
                </>
              ) : (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              )}
              
              {/* Overlay for Images */}
              {item.media_type !== 'video' && (
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-semibold text-background text-sm md:text-base truncate">
                      {item.title}
                    </h3>
                    {item.category && (
                      <span className="text-xs text-background/80">{item.category}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default SlidingGallery;
