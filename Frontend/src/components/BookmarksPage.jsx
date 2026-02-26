import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bookmark, Heart, MapPin, Tag, Trash2 } from 'lucide-react';

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const { data } = await axios.get('/api/v1/bookmarks', { withCredentials: true });
      const payload = data.data || data;
      setBookmarks(Array.isArray(payload) ? payload : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (listingId) => {
    try {
      await axios.post(`/api/v1/bookmarks/toggle/${listingId}`, {}, { withCredentials: true });
      setBookmarks((prev) => prev.filter((b) => (b._id || b.listingId) !== listingId));
      toast.success('Removed from saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove bookmark');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-display font-bold mb-6">Saved Items</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Saved Items</h1>
          <p className="text-sm text-muted-foreground mt-1">{bookmarks.length} item{bookmarks.length !== 1 ? 's' : ''} saved</p>
        </div>
        <Bookmark className="w-6 h-6 text-primary" />
      </div>

      {bookmarks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Heart className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-1">No saved items yet</h3>
            <p className="text-muted-foreground mb-6">Items you save will appear here</p>
            <Button asChild><Link to="/">Browse Listings</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {bookmarks.map((item) => {
            const id = item._id || item.listingId;
            return (
              <Card key={id} className="overflow-hidden group hover:shadow-card-hover transition">
                <Link to={`/listings/${id}`}>
                  <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Tag className="w-8 h-8" />
                      </div>
                    )}
                    {item.isSold && (
                      <Badge variant="destructive" className="absolute top-2 right-2">Sold</Badge>
                    )}
                  </div>
                </Link>
                <CardContent className="p-3">
                  <Link to={`/listings/${id}`}>
                    <h3 className="font-semibold text-foreground truncate hover:text-primary transition">{item.title}</h3>
                    <p className="text-primary font-bold mt-1">₹{item.price?.toLocaleString()}</p>
                  </Link>
                  {item.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {item.location}
                    </p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeBookmark(id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Remove
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;
