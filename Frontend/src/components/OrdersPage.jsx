import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, Package, Eye, Tag, Calendar } from 'lucide-react';

const statusColors = {
  pending: 'warning',
  placed: 'secondary',
  confirmed: 'success',
  shipped: 'accent',
  delivered: 'success',
  cancelled: 'destructive',
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get('/api/v1/orders', { withCredentials: true });
        const payload = data.data || data;
        setOrders(Array.isArray(payload) ? payload : []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-display font-bold mb-6">My Orders</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <ShoppingBag className="w-6 h-6 text-primary" />
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Package className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-1">No orders yet</h3>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
            <Button asChild><Link to="/">Browse Listings</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const listing = order.listing || {};
            return (
              <Card key={order._id} className="hover:shadow-card-hover transition">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {listing.images?.[0] ? (
                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Tag className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground truncate">{listing.title || 'Untitled'}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Order #{order._id?.slice(-8)?.toUpperCase()}
                          </p>
                        </div>
                        <Badge variant={statusColors[order.orderStatus] || 'secondary'} className="capitalize flex-shrink-0">
                          {order.orderStatus}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="font-bold text-primary">₹{order.paymentInfo?.amount?.toLocaleString()}</span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.placedAt || order.createdAt).toLocaleDateString()}
                        </span>
                        {order.shippingInfo?.city && (
                          <span className="text-muted-foreground hidden sm:inline">{order.shippingInfo.city}</span>
                        )}
                      </div>

                      <div className="mt-3">
                        <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                          <Link to={`/orders/${order._id}`}>
                            <Eye className="w-3 h-3 mr-1" /> View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
