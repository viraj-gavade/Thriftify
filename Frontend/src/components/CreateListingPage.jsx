import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ImagePlus, X, Tag, MapPin, DollarSign, FileText, Upload, Loader2 } from 'lucide-react';

const CATEGORIES = ['electronics', 'furniture', 'clothing', 'books', 'others'];

const CreateListingPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', location: '' });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Valid price is required';
    if (!form.category) e.category = 'Category is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (images.length === 0) e.images = 'At least one image is required';
    return e;
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);
    const total = images.length + files.length;
    if (total > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
    setErrors({ ...errors, images: '' });
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('price', form.price);
      fd.append('category', form.category);
      fd.append('location', form.location);
      images.forEach((file) => fd.append('images', file));
      await axios.post('/api/v1/listings', fd, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Listing created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const field = (name) => ({
    value: form[name],
    onChange: (e) => { setForm({ ...form, [name]: e.target.value }); setErrors({ ...errors, [name]: '' }); },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-display">Create Listing</CardTitle>
          <CardDescription>Add your item to the marketplace</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Images */}
            <div className="space-y-2">
              <Label>Photos (max 5)</Label>
              <div className="flex flex-wrap gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-foreground/70 text-white flex items-center justify-center hover:bg-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition text-muted-foreground hover:text-primary">
                    <ImagePlus className="w-5 h-5" />
                    <span className="text-[10px] mt-0.5">Add</span>
                    <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
                  </label>
                )}
              </div>
              {errors.images && <p className="text-xs text-destructive">{errors.images}</p>}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>Title</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Item name" className="pl-10" {...field('title')} />
              </div>
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={4} placeholder="Describe your item..." {...field('description')} />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Price */}
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="number" min="1" placeholder="0" className="pl-10" {...field('price')} />
                </div>
                {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
                  value={form.category}
                  onChange={(e) => { setForm({ ...form, category: e.target.value }); setErrors({ ...errors, category: '' }); }}
                >
                  <option value="">Select</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
                {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="City or area" className="pl-10" {...field('location')} />
              </div>
              {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" /> Publish Listing</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateListingPage;
