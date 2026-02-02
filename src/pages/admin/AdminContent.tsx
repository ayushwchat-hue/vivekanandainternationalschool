import { useEffect, useState } from 'react';
import { 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  Check,
  Layout,
  Info,
  GraduationCap,
  Building2,
  MessageSquareQuote,
  Phone,
  FileText,
  ChevronRight,
  Eye,
  Undo2,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Json } from '@/integrations/supabase/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import ImageUpload from '@/components/admin/ImageUpload';

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
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  extraFields?: ExtraDataField[];
}

const sectionConfigs: SectionConfig[] = [
  {
    key: 'hero',
    label: 'Hero Banner',
    description: 'Main banner with headline, stats, and call-to-action buttons',
    icon: Layout,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200',
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
        label: 'Action Buttons', 
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
    label: 'About Us',
    description: 'School information, mission, and vision statements',
    icon: Info,
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    extraFields: [
      { key: 'mission', label: 'Mission Statement', type: 'textarea' },
      { key: 'vision', label: 'Vision Statement', type: 'textarea' },
    ],
  },
  {
    key: 'programs',
    label: 'Programs',
    description: 'Academic programs and courses offered',
    icon: GraduationCap,
    color: 'bg-purple-500/10 text-purple-600 border-purple-200',
    extraFields: [
      { 
        key: 'programs', 
        label: 'Program List', 
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
    label: 'Facilities',
    description: 'Campus infrastructure and amenities',
    icon: Building2,
    color: 'bg-amber-500/10 text-amber-600 border-amber-200',
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
    label: 'Testimonials',
    description: 'Parent and student reviews',
    icon: MessageSquareQuote,
    color: 'bg-pink-500/10 text-pink-600 border-pink-200',
    extraFields: [
      { 
        key: 'testimonials', 
        label: 'Reviews', 
        type: 'object-array',
        fields: [
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'role', label: 'Role', type: 'text' },
          { key: 'content', label: 'Review Content', type: 'textarea' },
        ]
      },
    ],
  },
  {
    key: 'contact',
    label: 'Contact',
    description: 'Contact information and details',
    icon: Phone,
    color: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
    extraFields: [
      { 
        key: 'contactItems', 
        label: 'Contact Details', 
        type: 'object-array',
        fields: [
          { key: 'title', label: 'Title', type: 'text' },
        ]
      },
    ],
  },
  {
    key: 'footer',
    label: 'Footer',
    description: 'Footer links and copyright info',
    icon: FileText,
    color: 'bg-slate-500/10 text-slate-600 border-slate-200',
    extraFields: [
      { key: 'quickLinks', label: 'Quick Links (comma separated)', type: 'text' },
      { key: 'programs', label: 'Program Names (comma separated)', type: 'text' },
    ],
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp Button',
    description: 'Configure the floating WhatsApp contact button',
    icon: MessageCircle,
    color: 'bg-green-500/10 text-green-600 border-green-200',
    extraFields: [
      { key: 'phoneNumber', label: 'WhatsApp Phone Number (with country code, no +)', type: 'text' },
      { key: 'message', label: 'Pre-filled Message', type: 'textarea' },
    ],
  },
];

const AdminContent = () => {
  const { toast } = useToast();
  const [content, setContent] = useState<Record<string, SiteContent>>({});
  const [originalContent, setOriginalContent] = useState<Record<string, SiteContent>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [hasChanges, setHasChanges] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    // Track changes per section
    const changes: Record<string, boolean> = {};
    sectionConfigs.forEach(config => {
      changes[config.key] = JSON.stringify(content[config.key]) !== JSON.stringify(originalContent[config.key]);
    });
    setHasChanges(changes);
  }, [content, originalContent]);

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
      setOriginalContent(JSON.parse(JSON.stringify(contentMap)));
    }
    setLoading(false);
  };

  const updateContent = async (sectionKey: string) => {
    const item = content[sectionKey];
    if (!item) return;

    setSaving(sectionKey);

    // Use the secure admin API endpoint
    const { updateSiteContent } = await import('@/lib/adminApi');
    const result = await updateSiteContent(sectionKey, {
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      image_url: item.image_url,
      extra_data: item.extra_data,
    });

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error === 'Invalid or expired session' 
          ? 'Session expired. Please log in again.' 
          : 'Failed to save changes',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Changes Saved!',
        description: `${sectionConfigs.find(c => c.key === sectionKey)?.label} has been updated successfully.`,
      });
      setOriginalContent(prev => ({
        ...prev,
        [sectionKey]: JSON.parse(JSON.stringify(item)),
      }));
    }
    setSaving(null);
  };

  const resetSection = (sectionKey: string) => {
    setContent(prev => ({
      ...prev,
      [sectionKey]: JSON.parse(JSON.stringify(originalContent[sectionKey])),
    }));
    toast({
      title: 'Changes Reverted',
      description: 'All unsaved changes have been discarded.',
    });
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
          <Label className="text-sm font-medium">{field.label}</Label>
          <Input
            value={textValue}
            onChange={(e) => {
              const newValue = field.key === 'quickLinks' || field.key === 'programs'
                ? e.target.value.split(',').map(s => s.trim())
                : e.target.value;
              handleExtraDataChange(sectionKey, field.key, newValue);
            }}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className="bg-background"
          />
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.key} className="space-y-2">
          <Label className="text-sm font-medium">{field.label}</Label>
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => handleExtraDataChange(sectionKey, field.key, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            rows={3}
            className="resize-none bg-background"
          />
        </div>
      );
    }

    if (field.type === 'object-array' && field.fields) {
      const arrayValue = Array.isArray(value) ? value : [];
      
      return (
        <div key={field.key} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold">{field.label}</Label>
              <Badge variant="secondary" className="text-xs">
                {arrayValue.length} item{arrayValue.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newItem: Record<string, string> = {};
                field.fields?.forEach(f => { newItem[f.key] = ''; });
                handleExtraDataChange(sectionKey, field.key, [...arrayValue, newItem]);
              }}
              className="gap-1.5 h-8"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </Button>
          </div>
          
          {arrayValue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/30">
              <Sparkles className="w-8 h-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground text-center">
                No items yet. Click "Add Item" to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {arrayValue.map((item: Record<string, unknown>, index: number) => (
                <Card 
                  key={index} 
                  className="overflow-hidden border-muted-foreground/20 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Item {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newArray = arrayValue.filter((_: unknown, i: number) => i !== index);
                        handleExtraDataChange(sectionKey, field.key, newArray);
                      }}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    {field.fields?.map(subField => (
                      <div key={subField.key} className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">{subField.label}</Label>
                        {subField.type === 'textarea' ? (
                          <Textarea
                            value={(item[subField.key] as string) || ''}
                            onChange={(e) => {
                              const newArray = [...arrayValue];
                              newArray[index] = { ...item, [subField.key]: e.target.value };
                              handleExtraDataChange(sectionKey, field.key, newArray);
                            }}
                            rows={2}
                            className="resize-none text-sm bg-background"
                          />
                        ) : (
                          <Input
                            value={(item[subField.key] as string) || ''}
                            onChange={(e) => {
                              const newArray = [...arrayValue];
                              newArray[index] = { ...item, [subField.key]: e.target.value };
                              handleExtraDataChange(sectionKey, field.key, newArray);
                            }}
                            className="text-sm bg-background"
                          />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const renderSectionEditor = (config: SectionConfig) => {
    const item = content[config.key];
    const Icon = config.icon;
    const sectionHasChanges = hasChanges[config.key];
    
    if (!item) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p>Loading content...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2.5 rounded-lg border", config.color)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{config.label}</h2>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
          </div>
          {sectionHasChanges && (
            <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700 border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Unsaved Changes
            </Badge>
          )}
        </div>

        <Separator />

        {/* Basic Fields Card */}
        <Card className="border-muted-foreground/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">Basic Information</CardTitle>
            <CardDescription>Core content for this section</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Title</Label>
                <Input
                  value={item.title || ''}
                  onChange={(e) => handleFieldChange(config.key, 'title', e.target.value)}
                  placeholder="Enter title"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Subtitle / Badge</Label>
                <Input
                  value={item.subtitle || ''}
                  onChange={(e) => handleFieldChange(config.key, 'subtitle', e.target.value)}
                  placeholder="Enter subtitle"
                  className="bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={item.description || ''}
                onChange={(e) => handleFieldChange(config.key, 'description', e.target.value)}
                placeholder="Enter description"
                rows={4}
                className="resize-none bg-background"
              />
            </div>

            <ImageUpload
              value={item.image_url}
              onChange={(url) => handleFieldChange(config.key, 'image_url', url)}
              sectionKey={config.key}
            />
          </CardContent>
        </Card>

        {/* Extra Fields Card */}
        {config.extraFields && config.extraFields.length > 0 && (
          <Card className="border-muted-foreground/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium">Additional Content</CardTitle>
              <CardDescription>Manage dynamic content items for this section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {config.extraFields.map(field => renderExtraField(config.key, field))}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 pb-6">
          <Button
            variant="outline"
            onClick={() => resetSection(config.key)}
            disabled={!sectionHasChanges || saving === config.key}
            className="gap-2"
          >
            <Undo2 className="w-4 h-4" />
            Revert Changes
          </Button>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => window.open('/', '_blank')}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview Site
            </Button>
            <Button
              onClick={() => updateContent(config.key)}
              disabled={saving === config.key || !sectionHasChanges}
              className="gap-2 min-w-[140px]"
            >
              {saving === config.key ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const activeConfig = sectionConfigs.find(c => c.key === activeSection);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Content Manager</h1>
            <p className="text-muted-foreground mt-1">
              Edit and customize all website content in one place
            </p>
          </div>
          <Badge variant="outline" className="self-start sm:self-auto gap-1.5 px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Live Changes
          </Badge>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading content...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar Navigation */}
            <Card className="lg:h-fit lg:sticky lg:top-6 border-muted-foreground/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Sections
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <ScrollArea className="h-auto lg:max-h-[calc(100vh-200px)]">
                  <div className="space-y-1">
                    {sectionConfigs.map((config) => {
                      const Icon = config.icon;
                      const isActive = activeSection === config.key;
                      const sectionHasChanges = hasChanges[config.key];
                      
                      return (
                        <button
                          key={config.key}
                          onClick={() => setActiveSection(config.key)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                            isActive 
                              ? "bg-primary text-primary-foreground shadow-sm" 
                              : "hover:bg-muted text-foreground"
                          )}
                        >
                          <div className={cn(
                            "p-1.5 rounded-md transition-colors",
                            isActive ? "bg-primary-foreground/20" : config.color
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="flex-1 text-sm font-medium">{config.label}</span>
                          {sectionHasChanges && (
                            <span className={cn(
                              "w-2 h-2 rounded-full",
                              isActive ? "bg-primary-foreground" : "bg-amber-500"
                            )} />
                          )}
                          <ChevronRight className={cn(
                            "w-4 h-4 transition-transform",
                            isActive ? "rotate-90" : ""
                          )} />
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <div className="min-w-0">
              {activeConfig && renderSectionEditor(activeConfig)}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminContent;
