import { useEffect, useState } from 'react';
import { Save, Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';

interface SiteContent {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  extra_data: Json | null;
}

interface ExtraDataField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'array' | 'object-array';
  fields?: { key: string; label: string; type: 'text' | 'textarea' }[];
}

interface SectionConfig {
  key: string;
  label: string;
  description: string;
  extraFields?: ExtraDataField[];
}

const sectionConfigs: SectionConfig[] = [
  {
    key: 'hero',
    label: 'Hero Section',
    description: 'The main banner section at the top of the homepage',
    extraFields: [
      { 
        key: 'stats', 
        label: 'Statistics', 
        type: 'object-array',
        fields: [
          { key: 'value', label: 'Value', type: 'text' },
          { key: 'label', label: 'Label', type: 'text' },
        ]
      },
      { 
        key: 'ctaButtons', 
        label: 'Call-to-Action Buttons', 
        type: 'object-array',
        fields: [
          { key: 'text', label: 'Button Text', type: 'text' },
          { key: 'link', label: 'Button Link', type: 'text' },
        ]
      },
    ],
  },
  {
    key: 'about',
    label: 'About Section',
    description: 'Information about the school',
    extraFields: [
      { key: 'mission', label: 'Mission Statement', type: 'textarea' },
      { key: 'vision', label: 'Vision Statement', type: 'textarea' },
    ],
  },
  {
    key: 'programs',
    label: 'Programs Section',
    description: 'Academic programs offered by the school',
    extraFields: [
      { 
        key: 'programs', 
        label: 'Programs', 
        type: 'object-array',
        fields: [
          { key: 'title', label: 'Program Title', type: 'text' },
          { key: 'classes', label: 'Classes', type: 'text' },
          { key: 'age', label: 'Age Range', type: 'text' },
          { key: 'description', label: 'Description', type: 'textarea' },
        ]
      },
    ],
  },
  {
    key: 'facilities',
    label: 'Facilities Section',
    description: 'School facilities and infrastructure',
    extraFields: [
      { 
        key: 'mainFacilities', 
        label: 'Main Facilities', 
        type: 'object-array',
        fields: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'description', label: 'Description', type: 'textarea' },
        ]
      },
      { 
        key: 'additionalFacilities', 
        label: 'Additional Facilities', 
        type: 'object-array',
        fields: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'description', label: 'Description', type: 'textarea' },
        ]
      },
    ],
  },
  {
    key: 'testimonials',
    label: 'Testimonials Section',
    description: 'Parent and student testimonials',
    extraFields: [
      { 
        key: 'testimonials', 
        label: 'Testimonials', 
        type: 'object-array',
        fields: [
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'role', label: 'Role', type: 'text' },
          { key: 'content', label: 'Content', type: 'textarea' },
        ]
      },
    ],
  },
  {
    key: 'contact',
    label: 'Contact Section',
    description: 'Contact information and form settings',
    extraFields: [
      { 
        key: 'contactItems', 
        label: 'Contact Information', 
        type: 'object-array',
        fields: [
          { key: 'title', label: 'Title', type: 'text' },
        ]
      },
    ],
  },
  {
    key: 'footer',
    label: 'Footer Section',
    description: 'Footer content and links',
    extraFields: [
      { key: 'quickLinks', label: 'Quick Links (comma separated)', type: 'text' },
      { key: 'programs', label: 'Program Names (comma separated)', type: 'text' },
    ],
  },
];

const AdminContent = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [content, setContent] = useState<Record<string, SiteContent>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('hero');

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
      const contentMap: Record<string, SiteContent> = {};
      data?.forEach((item) => {
        contentMap[item.section_key] = item;
      });
      setContent(contentMap);
    }
    setLoading(false);
  };

  const updateContent = async (sectionKey: string) => {
    const item = content[sectionKey];
    if (!item) return;

    setSaving(sectionKey);

    const { error } = await supabase
      .from('site_content')
      .update({
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        image_url: item.image_url,
        extra_data: item.extra_data,
        updated_by: user?.id,
      })
      .eq('section_key', sectionKey);

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

  const handleFieldChange = (sectionKey: string, field: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value,
      },
    }));
  };

  const getExtraData = (sectionKey: string): Record<string, unknown> => {
    const item = content[sectionKey];
    if (!item?.extra_data || typeof item.extra_data !== 'object' || Array.isArray(item.extra_data)) {
      return {};
    }
    return item.extra_data as Record<string, unknown>;
  };

  const handleExtraDataChange = (sectionKey: string, key: string, value: unknown) => {
    setContent((prev) => {
      const currentExtraData = getExtraData(sectionKey);
      const newExtraData = {
        ...currentExtraData,
        [key]: value,
      } as Json;
      
      return {
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          extra_data: newExtraData,
        },
      };
    });
  };

  const renderExtraField = (sectionKey: string, field: ExtraDataField) => {
    const extraData = getExtraData(sectionKey);
    const value = extraData[field.key];

    if (field.type === 'text') {
      const textValue = Array.isArray(value) ? value.join(', ') : (value as string) || '';
      return (
        <div key={field.key} className="space-y-2">
          <Label>{field.label}</Label>
          <Input
            value={textValue}
            onChange={(e) => {
              const newValue = field.key === 'quickLinks' || field.key === 'programs'
                ? e.target.value.split(',').map(s => s.trim())
                : e.target.value;
              handleExtraDataChange(sectionKey, field.key, newValue);
            }}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.key} className="space-y-2">
          <Label>{field.label}</Label>
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => handleExtraDataChange(sectionKey, field.key, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            rows={3}
            className="resize-none"
          />
        </div>
      );
    }

    if (field.type === 'object-array' && field.fields) {
      const arrayValue = Array.isArray(value) ? value : [];
      
      return (
        <div key={field.key} className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">{field.label}</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newItem: Record<string, string> = {};
                field.fields?.forEach(f => { newItem[f.key] = ''; });
                handleExtraDataChange(sectionKey, field.key, [...arrayValue, newItem]);
              }}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
          
          <div className="space-y-4">
            {arrayValue.map((item: Record<string, unknown>, index: number) => (
              <div 
                key={index} 
                className="relative p-4 border border-border rounded-lg bg-muted/30 space-y-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="w-4 h-4" />
                    <span className="text-sm font-medium">Item {index + 1}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newArray = arrayValue.filter((_: unknown, i: number) => i !== index);
                      handleExtraDataChange(sectionKey, field.key, newArray);
                    }}
                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid gap-3">
                  {field.fields?.map(subField => (
                    <div key={subField.key} className="space-y-1">
                      <Label className="text-sm text-muted-foreground">{subField.label}</Label>
                      {subField.type === 'textarea' ? (
                        <Textarea
                          value={(item[subField.key] as string) || ''}
                          onChange={(e) => {
                            const newArray = [...arrayValue];
                            newArray[index] = { ...item, [subField.key]: e.target.value };
                            handleExtraDataChange(sectionKey, field.key, newArray);
                          }}
                          rows={2}
                          className="resize-none"
                        />
                      ) : (
                        <Input
                          value={(item[subField.key] as string) || ''}
                          onChange={(e) => {
                            const newArray = [...arrayValue];
                            newArray[index] = { ...item, [subField.key]: e.target.value };
                            handleExtraDataChange(sectionKey, field.key, newArray);
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  const renderSectionEditor = (config: SectionConfig) => {
    const item = content[config.key];
    if (!item) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No content found for this section. Please refresh the page.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">{config.label}</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={item.title || ''}
                  onChange={(e) => handleFieldChange(config.key, 'title', e.target.value)}
                  placeholder="Enter title"
                />
              </div>
              <div className="space-y-2">
                <Label>Subtitle / Badge</Label>
                <Input
                  value={item.subtitle || ''}
                  onChange={(e) => handleFieldChange(config.key, 'subtitle', e.target.value)}
                  placeholder="Enter subtitle"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={item.description || ''}
                onChange={(e) => handleFieldChange(config.key, 'description', e.target.value)}
                placeholder="Enter description"
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Image URL (optional)</Label>
              <Input
                value={item.image_url || ''}
                onChange={(e) => handleFieldChange(config.key, 'image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Extra Fields */}
            {config.extraFields && config.extraFields.length > 0 && (
              <div className="border-t border-border pt-6 space-y-6">
                <h4 className="font-display font-semibold text-foreground">Additional Content</h4>
                {config.extraFields.map(field => renderExtraField(config.key, field))}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => updateContent(config.key)}
                disabled={saving === config.key}
                className="gap-2"
              >
                {saving === config.key ? (
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
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Site Content Manager
          </h1>
          <p className="text-muted-foreground">
            Customize all text and content displayed on the website
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="flex-wrap h-auto gap-2 bg-muted/50 p-2">
              {sectionConfigs.map((config) => (
                <TabsTrigger 
                  key={config.key} 
                  value={config.key}
                  className="data-[state=active]:bg-background"
                >
                  {config.label.replace(' Section', '')}
                </TabsTrigger>
              ))}
            </TabsList>

            {sectionConfigs.map((config) => (
              <TabsContent key={config.key} value={config.key}>
                {renderSectionEditor(config)}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminContent;
