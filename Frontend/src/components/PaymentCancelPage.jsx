import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Home, RefreshCw, ShoppingBag } from 'lucide-react';

const PaymentCancelPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mb-4">
            <XCircle className="w-9 h-9 text-warning" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">Payment Cancelled</h2>
          <p className="text-muted-foreground mb-6">
            Your payment was not completed. No charges were made to your account.
          </p>
          <div className="flex gap-3">
            <Button asChild>
              <Link to="/"><Home className="w-4 h-4 mr-2" /> Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/orders"><ShoppingBag className="w-4 h-4 mr-2" /> My Orders</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCancelPage;
