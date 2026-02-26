import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, Heart, ShoppingCart, MapPin, Tag, Clock,
  ChevronLeft, ChevronRight, MessageCircle, Share2, User,
} from 'lucide-react';

const ListingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [listing, setListing] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentImg, setCurrentImg] = useState(0);
  const [bookmarking, setBookmarking] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await axios.get(`/api/v1/listings/${id}`, { withCredentials: true });
        const payload = data.data || data;
        setListing(payload.listing || payload);
        setIsBookmarked(payload.isBookmarked || false);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load listing');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const toggleBookmark = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setBookmarking(true);
    try {
      await axios.post(`/api/v1/bookmarks/toggle/${id}`, {}, { withCredentials: true });
      setIsBookmarked((prev) => !prev);
      toast.success(isBookmarked ? 'Removed from saved' : 'Saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update bookmark');
    } finally {
      setBookmarking(false);
    }
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-lg text-muted-foreground mb-4">Listing not found</p>
        <Button variant="outline" onClick={() => navigate('/')}>Browse listings</Button>
      </div>
    );
  }

  const images = listing.images || [];
  const seller = listing.postedBy || {};
  const isOwner = user && seller._id === user._id;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Image gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square bg-muted rounded-xl overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[currentImg]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImg((p) => (p - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentImg((p) => (p + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            {listing.isSold && (
              <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
                <Badge variant="destructive" className="text-lg px-6 py-2">Sold</Badge>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImg(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                    currentImg === i ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="capitalize">{listing.category}</Badge>
              {listing.isSold && <Badge variant="destructive">Sold</Badge>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">{listing.title}</h1>
            <p className="text-3xl font-bold text-primary mt-3">₹{listing.price?.toLocaleString()}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" /> {listing.location || 'N/A'}
            <span className="mx-1">·</span>
            <Clock className="w-4 h-4" /> {new Date(listing.createdAt).toLocaleDateString()}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>

          <Separator />

          {/* Seller */}
          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={seller.profilepic} />
                <AvatarFallback>{(seller.fullname || 'U')[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{seller.fullname || seller.username}</p>
                <p className="text-sm text-muted-foreground">{seller.email}</p>
              </div>
              {isAuthenticated && !isOwner && (
                <Button variant="outline" size="sm" disabled={startingChat} onClick={async () => {
                  setStartingChat(true);
                  try {
                    const { data } = await axios.post('/api/v1/chat/conversations', {
                      recipientId: seller._id,
                      listingId: listing._id,
                    }, { withCredentials: true });
                    const conv = data.data || data;
                    navigate(`/chat/${conv._id}`);
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'Failed to start chat');
                  } finally {
                    setStartingChat(false);
                  }
                }}>
                  <MessageCircle className="w-4 h-4 mr-1" /> {startingChat ? 'Opening...' : 'Chat'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {!listing.isSold && !isOwner && (
              <Button size="lg" className="flex-1" onClick={() => {
                if (!isAuthenticated) { navigate('/login'); return; }
                navigate(`/checkout/${id}`);
              }}>
                <ShoppingCart className="w-4 h-4 mr-2" /> Buy Now
              </Button>
            )}
            {isOwner && (
              <Button size="lg" variant="outline" className="flex-1" disabled>
                <User className="w-4 h-4 mr-2" /> Your Listing
              </Button>
            )}
            <Button variant="outline" size="lg" onClick={toggleBookmark} disabled={bookmarking}>
              <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-primary text-primary' : ''}`} />
            </Button>
            <Button variant="outline" size="lg" onClick={share}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailsPage;
