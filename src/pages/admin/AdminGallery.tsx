import { useEffect, useState, useRef } from 'react';
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon, Upload, X, Video, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category: string | null;
  is_active: boolean;
  display_order: number;
  media_type: string;
}

const categories = ['Events', 'Classroom', 'Sports', 'Activities', 'Campus', 'Other'];

const AdminGallery = () => {
  const { toast } = useToast();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    category: '',
    is_active: true,
    display_order: 0,
    media_type: 'image',
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load gallery',
        variant: 'destructive',
      });
    } else {
      setGallery(data || []);
    }
    setLoading(false);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Get a signed upload URL from the admin API
      const { getUploadUrl } = await import('@/lib/adminApi');
      const result = await getUploadUrl(file.name, file.type);

      if (result.error || !result.data) {
        console.error('Failed to get upload URL:', result.error);
        return null;
      }

      const { signedUrl, token, publicUrl } = result.data;

      // Upload directly using the signed URL
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        console.error('Upload failed:', uploadResponse.statusText);
        return null;
      }

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    // Validate file type
    if (!isImage && !isVideo) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image or video file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 50MB for videos, 5MB for images)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: `Please select a file under ${isVideo ? '50MB' : '5MB'}`,
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    setMediaType(isVideo ? 'video' : 'image');
    setFormData(prev => ({ ...prev, media_type: isVideo ? 'video' : 'image' }));
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearMediaSelection = () => {
    setSelectedFile(null);
    setMediaPreview(null);
    setMediaType('image');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let imageUrl = formData.image_url;

    // Upload new image if selected
    if (selectedFile) {
      setUploading(true);
      const uploadedUrl = await uploadImage(selectedFile);
      setUploading(false);

      if (!uploadedUrl) {
        toast({
          title: 'Upload failed',
          description: 'Failed to upload image. Please try again.',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }
      imageUrl = uploadedUrl;
    }

    if (!imageUrl && !editingId) {
      toast({
        title: 'Media required',
        description: 'Please upload an image or video',
        variant: 'destructive',
      });
      setSaving(false);
      return;
    }

    const galleryData = {
      title: formData.title.trim(),
      image_url: imageUrl,
      category: formData.category || null,
      is_active: formData.is_active,
      display_order: formData.display_order,
      media_type: formData.media_type,
    };

    let error: string | undefined;

    if (editingId) {
      const { updateGalleryItem } = await import('@/lib/adminApi');
      const result = await updateGalleryItem(editingId, galleryData);
      error = result.error;
    } else {
      const { createGalleryItem } = await import('@/lib/adminApi');
      const result = await createGalleryItem(galleryData);
      error = result.error;
    }

    if (error) {
      toast({
        title: 'Error',
        description: error === 'Invalid or expired session' 
          ? 'Session expired. Please log in again.' 
          : 'Failed to save gallery item',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success!',
        description: `Gallery item ${editingId ? 'updated' : 'added'} successfully`,
      });
      setDialogOpen(false);
      resetForm();
      fetchGallery();
    }
    setSaving(false);
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      image_url: item.image_url,
      category: item.category || '',
      is_active: item.is_active,
      display_order: item.display_order,
      media_type: item.media_type || 'image',
    });
    setMediaPreview(item.image_url);
    setMediaType((item.media_type as 'image' | 'video') || 'image');
    setSelectedFile(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    const { deleteGalleryItem } = await import('@/lib/adminApi');
    const result = await deleteGalleryItem(id);

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error === 'Invalid or expired session' 
          ? 'Session expired. Please log in again.' 
          : 'Failed to delete gallery item',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Deleted',
        description: 'Gallery item deleted successfully',
      });
      fetchGallery();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      image_url: '',
      category: '',
      is_active: true,
      display_order: 0,
      media_type: 'image',
    });
    setMediaPreview(null);
    setMediaType('image');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Gallery</h1>
            <p className="text-muted-foreground">Manage photos and videos</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Media
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingId ? 'Edit Media' : 'Add New Media'}
                </DialogTitle>
                <DialogDescription>
                  {editingId ? 'Update the media details' : 'Add a new image or video to the gallery'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Image title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Image / Video</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {mediaPreview ? (
                    <div className="relative">
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted border">
                        {mediaType === 'video' ? (
                          <video
                            src={mediaPreview}
                            className="w-full h-full object-cover"
                            controls
                          />
                        ) : (
                          <img
                            src={mediaPreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                        onClick={clearMediaSelection}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      {mediaType === 'video' && (
                        <div className="absolute top-2 left-2 bg-foreground/80 text-background text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          Video
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 bg-muted/30 flex flex-col items-center justify-center cursor-pointer transition-colors"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload image or video</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">Images: 5MB max | Videos: 50MB max</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Display Order</Label>
                    <Input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>

                <Button type="submit" className="w-full" disabled={saving || uploading}>
                  {saving || uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {uploading ? 'Uploading...' : 'Saving...'}
                    </>
                  ) : (
                    editingId ? 'Update Image' : 'Add Image'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        ) : gallery.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No media yet. Add your first image or video!
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((item) => (
              <Card key={item.id} className={`overflow-hidden ${!item.is_active ? 'opacity-60' : ''}`}>
                <div className="aspect-video relative bg-muted">
                  {item.media_type === 'video' ? (
                    <>
                      <video
                        src={item.image_url}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                        <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center">
                          <Play className="w-6 h-6 text-foreground ml-1" />
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 bg-foreground/80 text-background text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        Video
                      </div>
                    </>
                  ) : item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`absolute inset-0 flex items-center justify-center ${item.image_url ? 'hidden' : ''}`}>
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-foreground text-sm truncate">{item.title}</h3>
                  <div className="flex items-center gap-2">
                    {item.category && (
                      <span className="text-xs text-muted-foreground">{item.category}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminGallery;