import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User, Mail, Lock, Camera, Save, Package, Bookmark,
  ShoppingBag, Edit3, Eye, EyeOff, Tag, Trash2
} from 'lucide-react';

const ProfilePage = () => {
  const { user, setUser, checkAuth } = useAuth();
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [myListings, setMyListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  // Profile form
  const [profile, setProfile] = useState({ fullname: '', username: '', email: '' });
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({});
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (user) {
      setProfile({ fullname: user.fullname || '', username: user.username || '', email: user.email || '' });
    }
  }, [user]);

  useEffect(() => {
    if (tab === 'listings') fetchMyListings();
  }, [tab]);

  const fetchMyListings = async () => {
    setListingsLoading(true);
    try {
      const { data } = await axios.get('/api/v1/listings/user/listings', { withCredentials: true });
      const payload = data.data || data;
      setMyListings(payload.listings || payload || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load your listings');
    } finally {
      setListingsLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.patch('/api/v1/user/update-details', profile, { withCredentials: true });
      if (data.user) setUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await axios.patch('/api/v1/user/update-password', pwForm, { withCredentials: true });
      toast.success('Password changed');
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    const fd = new FormData();
    fd.append('profilepic', avatarFile);
    setSaving(true);
    try {
      const { data } = await axios.patch('/api/v1/user/update-profilepic', fd, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.user) setUser(data.user);
      setAvatarFile(null);
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update photo');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await axios.delete(`/api/v1/listings/${listingId}`, { withCredentials: true });
      setMyListings((prev) => prev.filter((l) => l._id !== listingId));
      toast.success('Listing deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'security', label: 'Security', icon: Lock },
    { key: 'listings', label: 'My Listings', icon: Package },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-6 mb-8">
        <div className="relative group">
          <Avatar className="w-20 h-20 border-2 border-border">
            <AvatarImage src={user?.profilepic} />
            <AvatarFallback className="text-xl">{(user?.fullname || 'U')[0]}</AvatarFallback>
          </Avatar>
          <label className="absolute inset-0 rounded-full flex items-center justify-center bg-foreground/40 opacity-0 group-hover:opacity-100 transition cursor-pointer">
            <Camera className="w-5 h-5 text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              setAvatarFile(e.target.files?.[0] || null);
            }} />
          </label>
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{user?.fullname}</h1>
          <p className="text-muted-foreground">@{user?.username}</p>
          {avatarFile && (
            <Button size="sm" className="mt-2" onClick={handleAvatarUpload} disabled={saving}>
              <Save className="w-3 h-3 mr-1" /> Save Photo
            </Button>
          )}
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 border-b border-border mb-8">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
              tab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Edit Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-10" value={profile.fullname}
                    onChange={(e) => setProfile({ ...profile, fullname: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="email" className="pl-10" value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                </div>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Change Password</CardTitle>
            <CardDescription>Keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              {['oldPassword', 'newPassword', 'confirmPassword'].map((field) => (
                <div className="space-y-2" key={field}>
                  <Label>{field === 'oldPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm Password'}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPw[field] ? 'text' : 'password'}
                      className="pl-10 pr-10"
                      value={pwForm[field]}
                      onChange={(e) => setPwForm({ ...pwForm, [field]: e.target.value })}
                      placeholder={field === 'oldPassword' ? 'Enter current password' : field === 'newPassword' ? 'Min. 8 characters' : 'Repeat new password'}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPw({ ...showPw, [field]: !showPw[field] })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPw[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
              <Button type="submit" disabled={saving}>
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Lock className="w-4 h-4 mr-2" /> Update Password</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* My Listings tab */}
      {tab === 'listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold">Your Listings ({myListings.length})</h2>
            <Button size="sm" asChild>
              <Link to="/listings/new"><Package className="w-4 h-4 mr-1" /> New Listing</Link>
            </Button>
          </div>
          {listingsLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
          ) : myListings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12 text-center">
                <Package className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">You haven&apos;t posted any listings yet</p>
                <Button asChild><Link to="/listings/new">Create Your First Listing</Link></Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {myListings.map((listing) => (
                <Card key={listing._id} className="overflow-hidden hover:shadow-card-hover transition">
                  <div className="flex">
                    <div className="w-28 h-28 flex-shrink-0 bg-muted">
                      {listing.images?.[0] ? (
                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Tag className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate">{listing.title}</h3>
                          {listing.isSold && <Badge variant="destructive" className="text-[10px]">Sold</Badge>}
                        </div>
                        <p className="text-primary font-bold text-sm">₹{listing.price?.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                          <Link to={`/listings/${listing._id}`}><Eye className="w-3 h-3 mr-1" /> View</Link>
                        </Button>
                        {!listing.isSold && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive"
                            onClick={() => handleDeleteListing(listing._id)}>
                            <Trash2 className="w-3 h-3 mr-1" /> Delete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
