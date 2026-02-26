import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, MapPin, CreditCard, Loader2, ArrowLeft, Tag } from 'lucide-react';

const CheckoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shipping, setShipping] = useState({ name: '', address: '', phone: '', city: '', pincode: '' });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await axios.get(`/api/v1/listings/${id}`, { withCredentials: true });
        const payload = data.data || data;
        const l = payload.listing || payload;
        if (l.isSold) {
          toast.error('This item has already been sold');
          navigate('/');
          return;
        }
        setListing(l);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load listing');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shipping.name || !shipping.address || !shipping.phone || !shipping.city || !shipping.pincode) {
      toast.error('All shipping fields are required');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post('/api/v1/orders/create', {
        listingId: id,
        ...shipping,
      }, { withCredentials: true });

      const payload = data.data || data;
      if (payload.paypalLink) {
        window.location.href = payload.paypalLink;
      } else {
        toast.error('Payment link not received');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name) => ({
    value: shipping[name],
    onChange: (e) => setShipping({ ...shipping, [name]: e.target.value }),
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-40 mb-6" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-60 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!listing) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Checkout</h1>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Shipping form */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-display">
                <MapPin className="w-5 h-5 text-primary" /> Shipping Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="Recipient name" {...field('name')} />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input placeholder="Street address" {...field('address')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input placeholder="City" {...field('city')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Pincode</Label>
                    <Input placeholder="000000" {...field('pincode')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input type="tel" placeholder="+91 ..." {...field('phone')} />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order summary */}
        <div className="md:col-span-2">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg font-display">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {listing.images?.[0] ? (
                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Tag className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{listing.title}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{listing.category}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span>₹{listing.price?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-primary font-medium">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">₹{listing.price?.toLocaleString()}</span>
                </div>
              </div>
              <Button
                type="submit"
                form="checkout-form"
                size="lg"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  <><CreditCard className="w-4 h-4 mr-2" /> Pay with PayPal</>
                )}
              </Button>
              <p className="text-[11px] text-muted-foreground text-center">
                You&apos;ll be redirected to PayPal to complete payment
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
