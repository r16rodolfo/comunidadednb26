import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51SyZtfEuyKN6OMe7xFglm3NOdi4yLJIZZReNbnOzj4ZtXodQCGNq8oXMWUMYH3YgGdBSYX4ZQZwBtuXYS7T9puzv00DkckWmDp');

interface StripeEmbeddedCheckoutProps {
  clientSecret: string;
  onComplete?: () => void;
}

export function StripeEmbeddedCheckout({ clientSecret, onComplete }: StripeEmbeddedCheckoutProps) {
  return (
    <div className="min-h-[400px]">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ clientSecret, onComplete }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
