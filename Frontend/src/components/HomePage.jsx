import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search, Bookmark, BookmarkCheck, MapPin, Tag,
  ArrowRight, SlidersHorizontal, Leaf, Heart,
  Recycle, ShoppingBag,
} from 'lucide-react';

const CATEGORIES = ['electronics', 'furniture', 'clothing', 'books', 'others'];
const CATEGORY_ICONS = { electronics: '⚡', furniture: '🪑', clothing: '👕', books: '📚', others: '📦' };

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userBookmarks, setUserBookmarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ category: '', sortBy: 'newest' });

  // Re-fetch whenever filters or committed search term change
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('sortBy', filters.sortBy);
        if (filters.category) params.set('category', filters.category);
        if (searchTerm.trim()) params.set('query', searchTerm);
        const { data } = await axios.get(`/api/v1/listings/sorted?${params}`);
        setListings(Array.isArray(data.data) ? data.data : []);
      } catch (err) { toast.error(err.response?.data?.message || 'Failed to load listings'); setListings([]); }
      finally { setLoading(false); }
    };
    fetchListings();
  }, [filters, searchTerm]);

  useEffect(() => {
    if (isAuthenticated) fetchUserBookmarks();
    else setUserBookmarks([]);
  }, [isAuthenticated]);

  const fetchUserBookmarks = async () => {
    try { const r = await axios.get('/api/v1/user/bookmarks', { withCredentials: true }); setUserBookmarks(r.data || []); }
    catch { /* bookmarks are optional — don't toast */ setUserBookmarks([]); }
  };

  const handleSearch = (e) => { e.preventDefault(); setSearchTerm(searchQuery); };

  const isBookmarkedItem = (id) =>
    Array.isArray(userBookmarks) &&
    userBookmarks.some(b => b?.listingId === id || b?._id === id || b?.listing?._id === id);

  const toggleBookmark = async (listingId) => {
    if (!isAuthenticated) { toast.info('Sign in to save items'); navigate('/login'); return; }
    try {
      const res = await axios.post(`/api/v1/bookmarks/toggle/${listingId}`, { listingId }, { withCredentials: true });
      fetchUserBookmarks();
      const d = res.data.data || res.data;
      toast.success(d.isBookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update bookmark'); }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="accent" className="mb-6 text-sm px-4 py-1.5">
              <Leaf className="w-3.5 h-3.5 mr-1.5" /> Sustainable Shopping
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white tracking-tight leading-tight">
              Pre-loved finds,<span className="text-primary-300"> new stories</span>
            </h1>
            <p className="mt-5 text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
              Discover unique second-hand treasures at incredible prices.
            </p>
            <form onSubmit={handleSearch} className="mt-10 flex gap-3 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for items..." className="pl-10 h-12 bg-white border-0 shadow-elevated" />
              </div>
              <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="hidden sm:block h-12 rounded-md border-0 bg-white shadow-elevated px-4 text-sm text-foreground focus:ring-2 focus:ring-primary/20">
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              <Button type="submit" size="lg" className="h-12 shadow-elevated">Search</Button>
            </form>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[{ icon: Heart, label: 'Items Listed', val: `${listings.length}+` },
              { icon: Recycle, label: 'Eco Friendly', val: '100%' },
              { icon: ShoppingBag, label: 'Categories', val: '5+' }
            ].map(({ icon: I, label, val }) => (
              <div key={label} className="text-center">
                <I className="w-5 h-5 mx-auto text-primary-300 mb-1" />
                <p className="text-xl font-bold text-white">{val}</p>
                <p className="text-xs text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="sticky top-16 z-40 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 overflow-x-auto">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <button onClick={() => setFilters(f => ({ ...f, category: '' }))}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
              !filters.category ? 'bg-primary text-white' : 'bg-secondary text-secondary-foreground hover:bg-border')}>All</button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilters(f => ({ ...f, category: c }))}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                filters.category === c ? 'bg-primary text-white' : 'bg-secondary text-secondary-foreground hover:bg-border')}>
              {CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
          <div className="ml-auto flex-shrink-0">
            <select value={filters.sortBy} onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value }))}
              className="text-xs bg-transparent border-0 text-muted-foreground focus:ring-0 pr-6 cursor-pointer">
              <option value="newest">Newest</option><option value="oldest">Oldest</option>
              <option value="price_low">Price ↑</option><option value="price_high">Price ↓</option>
            </select>
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">
                {filters.category ? filters.category.charAt(0).toUpperCase() + filters.category.slice(1) : 'All Listings'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{loading ? 'Loading...' : `${listings.length} items found`}</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden"><Skeleton className="h-52 w-full rounded-none" />
                  <div className="p-4 space-y-3"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-6 w-1/3" /><Skeleton className="h-3 w-full" /></div></Card>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map(listing => (
                <Card key={listing._id} className="group overflow-hidden hover:shadow-card-hover transition-all duration-300">
                  <div className="relative h-52 overflow-hidden bg-muted">
                    <img src={listing.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'} alt={listing.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <button onClick={(e) => { e.preventDefault(); toggleBookmark(listing._id); }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-soft hover:bg-white transition-all">
                      {isBookmarkedItem(listing._id) ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    {listing.isSold && <div className="absolute top-3 left-3"><Badge variant="destructive" className="text-[10px]">SOLD</Badge></div>}
                  </div>
                  <div className="p-4">
                    <Link to={`/listings/${listing._id}`}>
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1 text-sm">{listing.title || 'Untitled'}</h3>
                    </Link>
                    <p className="text-xl font-bold text-primary mt-1.5">₹{listing.price?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{listing.description || 'No description'}</p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Tag className="w-3 h-3" />{listing.category || 'Other'}</span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{listing.location || 'N/A'}</span>
                    </div>
                    <Link to={`/listings/${listing._id}`} className="mt-4 block">
                      <Button variant="outline" size="sm" className="w-full group/btn">View Details <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover/btn:translate-x-0.5" /></Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4"><Search className="w-7 h-7 text-muted-foreground" /></div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No listings found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
              <Button variant="outline" className="mt-6" onClick={() => { setFilters({ category: '', sortBy: 'newest' }); setSearchQuery(''); setSearchTerm(''); }}>Clear Filters</Button>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-display font-bold text-foreground">Browse Categories</h2>
            <p className="text-sm text-muted-foreground mt-2">Find exactly what you're looking for</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setFilters(f => ({ ...f, category: c }))}
                className="group bg-white rounded-xl p-6 text-center shadow-soft hover:shadow-card-hover transition-all duration-300 border border-border hover:border-primary/20">
                <div className="text-3xl mb-3">{CATEGORY_ICONS[c]}</div>
                <h3 className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">{c.charAt(0).toUpperCase() + c.slice(1)}</h3>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
