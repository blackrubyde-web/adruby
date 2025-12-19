import { XCircle, Sparkles, RefreshCw, DollarSign, Home } from 'lucide-react';

interface PaymentCancelledPageProps {
  onRetryCheckout: () => void;
  onViewPricing: () => void;
  onGoHome: () => void;
}

export function PaymentCancelledPage({
  onRetryCheckout,
  onViewPricing,
  onGoHome,
}: PaymentCancelledPageProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <span className="font-bold text-2xl">AdRuby</span>
        </div>

        {/* Cancelled Icon */}
        <div className="mb-8 flex items-center justify-center">
          <div className="relative">
            <XCircle className="w-20 h-20 text-yellow-600 animate-pulse" />
            <div className="absolute inset-0 bg-yellow-600/20 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Checkout Cancelled
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          No worries! Your payment was not processed. You can try again or explore our pricing options.
        </p>

        {/* Info Card */}
        <div className="bg-muted/30 border border-border rounded-2xl p-8 mb-8">
          <h3 className="text-lg font-semibold mb-4">Why subscribe to AdRuby?</h3>
          <div className="grid sm:grid-cols-2 gap-6 text-left">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">AI-Powered Creatives</h4>
              <p className="text-sm text-muted-foreground">
                Generate high-converting ad creatives in seconds with advanced AI.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Maximize ROI</h4>
              <p className="text-sm text-muted-foreground">
                Real-time optimization to increase ROAS and reduce ad spend waste.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
                <RefreshCw className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">7-Day Free Trial</h4>
              <p className="text-sm text-muted-foreground">
                Try all features risk-free. Cancel anytime during the trial period.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                <Home className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">Enterprise Support</h4>
              <p className="text-sm text-muted-foreground">
                Get priority support from our team of ad experts.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onRetryCheckout}
            className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
          >
            <RefreshCw className="w-5 h-5" />
            Retry Checkout
          </button>
          <button
            onClick={onViewPricing}
            className="w-full sm:w-auto px-8 py-4 border-2 border-border rounded-xl font-semibold hover:bg-accent transition-colors flex items-center justify-center gap-2"
          >
            <DollarSign className="w-5 h-5" />
            View Pricing
          </button>
        </div>

        {/* Alternative Action */}
        <div className="mt-8">
          <button
            onClick={onGoHome}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </button>
        </div>

        {/* Support */}
        <p className="mt-12 text-sm text-muted-foreground">
          Need help?{' '}
          <a href="mailto:support@adruby.ai" className="text-primary hover:underline">
            Contact our support team
          </a>
        </p>
      </div>
    </div>
  );
}
