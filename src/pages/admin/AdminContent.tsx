import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';

interface SiteContent {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
}

const AdminContent = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [content, setContent] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .order('section_key');

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load content',
        variant: 'destructive',
      });
    } else {
      setContent(data || []);
    }
    setLoading(false);
  };

  const updateContent = async (item: SiteContent) => {
    setSaving(item.id);

    const { error } = await supabase
      .from('site_content')
      .update({
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        image_url: item.image_url,
        updated_by: user?.id,
      })
      .eq('id', item.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Saved!',
        description: 'Content updated successfully',
      });
    }
    setSaving(null);
  };

  const handleChange = (id: string, field: keyof SiteContent, value: string) => {
    setContent((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const getSectionLabel = (key: string) => {
    const labels: Record<string, string> = {
      hero: 'Hero Section',
      about: 'About Section',
      vision: 'Vision',
      mission: 'Mission',
      contact: 'Contact Section',
    };
    return labels[key] || key;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Site Content
          </h1>
          <p className="text-muted-foreground">
            Customize the text and content displayed on the website
          </p>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        ) : (
          <div className="grid gap-6">
            {content.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="font-display text-lg">
                    {getSectionLabel(item.section_key)}
                  </CardTitle>
                  <CardDescription>Section key: {item.section_key}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={item.title || ''}
                        onChange={(e) => handleChange(item.id, 'title', e.target.value)}
                        placeholder="Enter title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subtitle</Label>
                      <Input
                        value={item.subtitle || ''}
                        onChange={(e) => handleChange(item.id, 'subtitle', e.target.value)}
                        placeholder="Enter subtitle"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={item.description || ''}
                      onChange={(e) => handleChange(item.id, 'description', e.target.value)}
                      placeholder="Enter description"
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Image URL (optional)</Label>
                    <Input
                      value={item.image_url || ''}
                      onChange={(e) => handleChange(item.id, 'image_url', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <Button
                    onClick={() => updateContent(item)}
                    disabled={saving === item.id}
                    className="gap-2"
                  >
                    {saving === item.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminContent;
