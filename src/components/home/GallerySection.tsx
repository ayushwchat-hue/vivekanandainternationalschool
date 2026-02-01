import { useEffect, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category: string | null;
}

const GallerySection = () => {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await supabase
        .from('gallery')
        .select('id, title, image_url, category')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(8);

      setImages(data || []);
      setLoading(false);
    };

    fetchGallery();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return null; // Don't show section if no images
  }

  return (
    <section id="gallery" className="py-16 md:py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-secondary/10 rounded-full px-4 py-2 mb-4">
            <span className="text-sm font-medium text-secondary">Photo Gallery</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Life at Our School
          </h2>
          <p className="text-muted-foreground text-lg">
            Glimpses of our vibrant school community, events, and activities.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((item, index) => (
            <div
              key={item.id}
              className={`group relative overflow-hidden rounded-xl card-shadow hover:card-shadow-hover transition-all duration-300 ${
                index === 0 ? 'col-span-2 row-span-2' : ''
              }`}
            >
              <div className={`${index === 0 ? 'aspect-square' : 'aspect-video'} bg-muted`}>
                {item.image_url ? (
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
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-semibold text-background text-sm md:text-base">
                    {item.title}
                  </h3>
                  {item.category && (
                    <span className="text-xs text-background/70">{item.category}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
