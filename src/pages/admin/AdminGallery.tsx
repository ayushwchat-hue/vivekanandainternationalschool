import { useEffect, useState, useRef } from 'react';
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon, Upload, X } from 'lucide-react';
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

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category: string | null;
  is_active: boolean;
  display_order: number;
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    category: '',
    is_active: true,
    display_order: 0,
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
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('gallery-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('gallery-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 5MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImageSelection = () => {
    setSelectedFile(null);
    setImagePreview(null);
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
        title: 'Image required',
        description: 'Please upload an image',
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
    };

    let error;

    if (editingId) {
      const result = await supabase.from('gallery').update(galleryData).eq('id', editingId);
      error = result.error;
    } else {
      const result = await supabase.from('gallery').insert(galleryData);
      error = result.error;
    }

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save gallery item',
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
    });
    setImagePreview(item.image_url);
    setSelectedFile(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    const { error } = await supabase.from('gallery').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete gallery item',
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
    });
    setImagePreview(null);
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
            <p className="text-muted-foreground">Manage photo gallery</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingId ? 'Edit Image' : 'Add New Image'}
                </DialogTitle>
                <DialogDescription>
                  {editingId ? 'Update the image details' : 'Add a new image to the gallery'}
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
                  <Label>Image</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {imagePreview ? (
                    <div className="relative">
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted border">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                        onClick={clearImageSelection}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 bg-muted/30 flex flex-col items-center justify-center cursor-pointer transition-colors"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload image</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">Max 5MB</p>
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
              No images yet. Add your first image!
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((item) => (
              <Card key={item.id} className={`overflow-hidden ${!item.is_active ? 'opacity-60' : ''}`}>
                <div className="aspect-video relative bg-muted">
                  {item.image_url ? (
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
                  {item.category && (
                    <span className="text-xs text-muted-foreground">{item.category}</span>
                  )}
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