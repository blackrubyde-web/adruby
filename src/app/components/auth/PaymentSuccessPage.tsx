import { useEffect, useState } from 'react';
import { CheckCircle, Sparkles, ArrowRight, PartyPopper } from 'lucide-react';

interface PaymentSuccessPageProps {
  onGoToDashboard: () => void;
}

export function PaymentSuccessPage({ onGoToDashboard }: PaymentSuccessPageProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti animation
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      {showConfetti && (
        <>
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-${Math.random() * 20}%`,
                  backgroundColor: ['#C80000', '#FF6B6B', '#4ECDC4', '#FFD93D', '#A8E6CF'][
                    Math.floor(Math.random() * 5)
                  ],
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </>
      )}

      <div className="text-center max-w-2xl relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <span className="font-bold text-2xl">AdRuby</span>
        </div>

        {/* Success Icon with Pulse Animation */}
        <div className="mb-8 flex items-center justify-center">
          <div className="relative">
            <CheckCircle className="w-20 h-20 text-green-600 animate-pulse" />
            <div className="absolute inset-0 bg-green-600/20 rounded-full animate-ping" />
            <PartyPopper className="w-8 h-8 text-yellow-500 absolute -top-4 -right-4 animate-bounce" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Payment Successful! 🎉
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Welcome to AdRuby! Your account is now active and ready to use.
        </p>

        {/* Benefits Card */}
        <div className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10 border border-border rounded-2xl p-8 mb-8">
          <h3 className="text-lg font-semibold mb-4">What's included in your plan:</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {[
              'Unlimited AI ad creatives',
              '1,000 credits to start',
              'Real-time analytics',
              'Multi-platform support',
              'Advanced targeting',
              'Priority support',
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-600/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onGoToDashboard}
          className="px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all hover:scale-105 flex items-center justify-center gap-2 mx-auto shadow-lg shadow-primary/25"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Receipt Info */}
        <p className="mt-8 text-sm text-muted-foreground">
          A receipt has been sent to your email address.
          <br />
          Need help? Contact us at{' '}
          <a href="mailto:support@adruby.ai" className="text-primary hover:underline">
            support@adruby.ai
          </a>
        </p>
      </div>

      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}
