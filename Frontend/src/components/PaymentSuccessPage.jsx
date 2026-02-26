import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Package, Home, AlertCircle } from 'lucide-react';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('capturing'); // capturing | success | error
  const [order, setOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const capturedRef = useRef(false);

  useEffect(() => {
    // Guard: only capture once (React StrictMode fires effects twice)
    if (capturedRef.current) return;

    const token = searchParams.get('token');
    const payerId = searchParams.get('PayerID');

    if (!token) {
      setStatus('error');
      setErrorMsg('No payment token found');
      return;
    }

    capturedRef.current = true;

    const capture = async () => {
      try {
        const { data } = await axios.get(
          `/api/v1/orders/payment/capture?token=${token}&PayerID=${payerId}`,
          { withCredentials: true }
        );
        const payload = data.data || data;
        setOrder(payload.order || payload);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setErrorMsg(err.response?.data?.message || 'Payment capture failed');
      }
    };

    capture();
  }, [searchParams]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      {status === 'capturing' && (
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h2 className="text-xl font-display font-bold text-foreground mb-2">Processing Payment</h2>
            <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
          </CardContent>
        </Card>
      )}

      {status === 'success' && (
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-6">
              Your order has been confirmed. Thank you for your purchase!
            </p>
            {order && (
              <p className="text-sm text-muted-foreground mb-6">
                Order ID: <span className="font-mono font-medium text-foreground">{order._id?.slice(-8)?.toUpperCase()}</span>
              </p>
            )}
            <div className="flex gap-3">
              <Button asChild>
                <Link to={order?._id ? `/orders/${order._id}` : '/orders'}>
                  <Package className="w-4 h-4 mr-2" /> View Order
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/"><Home className="w-4 h-4 mr-2" /> Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'error' && (
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-9 h-9 text-destructive" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">Payment Failed</h2>
            <p className="text-muted-foreground mb-6">{errorMsg || 'Something went wrong during payment processing.'}</p>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link to="/orders"><Package className="w-4 h-4 mr-2" /> My Orders</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/"><Home className="w-4 h-4 mr-2" /> Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentSuccessPage;
