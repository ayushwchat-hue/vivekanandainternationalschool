import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface SiteContent {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  extra_data: Json | null;
}

interface UseSiteContentReturn {
  content: SiteContent | null;
  loading: boolean;
  error: Error | null;
}

interface UseAllSiteContentReturn {
  content: Record<string, SiteContent>;
  loading: boolean;
  error: Error | null;
}

// Hook to fetch single section content
export const useSiteContent = (sectionKey: string): UseSiteContentReturn => {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('site_content')
          .select('*')
          .eq('section_key', sectionKey)
          .single();

        if (fetchError) throw fetchError;
        setContent(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [sectionKey]);

  return { content, loading, error };
};

// Hook to fetch all site content
export const useAllSiteContent = (): UseAllSiteContentReturn => {
  const [content, setContent] = useState<Record<string, SiteContent>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('site_content')
          .select('*');

        if (fetchError) throw fetchError;
        
        const contentMap: Record<string, SiteContent> = {};
        data?.forEach((item) => {
          contentMap[item.section_key] = item;
        });
        setContent(contentMap);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { content, loading, error };
};

// Helper to get extra_data with type safety
export const getExtraData = <T>(content: SiteContent | null, defaultValue: T): T => {
  if (!content?.extra_data || typeof content.extra_data !== 'object' || Array.isArray(content.extra_data)) {
    return defaultValue;
  }
  return content.extra_data as unknown as T;
};
