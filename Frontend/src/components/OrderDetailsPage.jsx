import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, Package, MapPin, CreditCard, Calendar,
  User, Mail, Phone, MessageCircle, Trash2, Tag,
  CheckCircle2, Clock, Truck, XCircle,
} from 'lucide-react';

const statusConfig = {
  pending: { color: 'warning', icon: Clock, label: 'Pending' },
  placed: { color: 'secondary', icon: Package, label: 'Placed' },
  confirmed: { color: 'success', icon: CheckCircle2, label: 'Confirmed' },
  shipped: { color: 'accent', icon: Truck, label: 'Shipped' },
  delivered: { color: 'success', icon: CheckCircle2, label: 'Delivered' },
  cancelled: { color: 'destructive', icon: XCircle, label: 'Cancelled' },
};

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`/api/v1/orders/view/${id}`, { withCredentials: true });
        const payload = data.data || data;
        setOrder(payload.order || payload);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      await axios.delete(`/api/v1/orders/${id}`, { withCredentials: true });
      toast.success('Order deleted');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete order');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Package className="w-12 h-12 text-muted-foreground/40 mb-4" />
        <p className="text-lg text-muted-foreground mb-4">Order not found</p>
        <Button variant="outline" onClick={() => navigate('/orders')}>Back to Orders</Button>
      </div>
    );
  }

  const listing = order.listing || {};
  const buyer = order.buyer || {};
  const seller = order.seller || {};
  const shipping = order.shippingInfo || {};
  const payment = order.paymentInfo || {};
  const status = statusConfig[order.orderStatus] || statusConfig.pending;
  const StatusIcon = status.icon;
  const isBuyer = user?._id === (buyer._id || buyer);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground" onClick={() => navigate('/orders')}>
        <ArrowLeft className="w-4 h-4 mr-1" /> My Orders
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Order #{order._id?.slice(-8)?.toUpperCase()}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Placed {order.placedAt ? new Date(order.placedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Badge variant={status.color} className="capitalize text-sm px-3 py-1">
          <StatusIcon className="w-3.5 h-3.5 mr-1" /> {status.label}
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Item */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {listing.images?.[0] ? (
                  <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Tag className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <Link to={`/listings/${listing._id}`} className="font-semibold text-foreground hover:text-primary transition">
                  {listing.title || 'Untitled'}
                </Link>
                <p className="text-sm text-muted-foreground capitalize mt-0.5">{listing.category}</p>
                <p className="text-lg font-bold text-primary mt-1">₹{(payment.amount || listing.price)?.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Shipping Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Recipient</p>
                <p className="font-medium">{shipping.name || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{shipping.phone || '-'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">
                  {[shipping.address, shipping.city, shipping.pincode].filter(Boolean).join(', ') || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" /> Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Method</p>
                <p className="font-medium capitalize">{payment.method || 'PayPal'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant={order.isPaid ? 'success' : 'warning'} className="capitalize mt-0.5">
                  {order.isPaid ? 'Paid' : 'Pending'}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium">₹{payment.amount?.toLocaleString()}</p>
              </div>
              {order.paidAt && (
                <div>
                  <p className="text-muted-foreground">Paid On</p>
                  <p className="font-medium">{new Date(order.paidAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* People */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display">Buyer</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={buyer.profilepic} />
                <AvatarFallback>{(buyer.fullname || 'B')[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{buyer.fullname || 'Buyer'}</p>
                <p className="text-xs text-muted-foreground">{buyer.email || ''}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display">Seller</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={seller.profilepic} />
                <AvatarFallback>{(seller.fullname || 'S')[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{seller.fullname || 'Seller'}</p>
                <p className="text-xs text-muted-foreground">{seller.email || ''}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" disabled={startingChat} onClick={async () => {
            const recipientId = isBuyer ? (seller._id || seller) : (buyer._id || buyer);
            setStartingChat(true);
            try {
              const { data } = await axios.post('/api/v1/chat/conversations', {
                recipientId,
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
            <MessageCircle className="w-4 h-4 mr-2" /> {startingChat ? 'Opening...' : `Message ${isBuyer ? 'Seller' : 'Buyer'}`}
          </Button>
          {isBuyer && order.orderStatus !== 'delivered' && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" /> Cancel Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
