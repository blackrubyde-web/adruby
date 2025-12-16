import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-card shadow-lg rounded-2xl p-8 w-full max-w-lg border border-border text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-amber-600 text-2xl">!</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Zahlung abgebrochen</h1>
        <p className="text-muted-foreground">
          Du kannst den Checkout jederzeit erneut starten oder zu den Preisen zurückkehren.
        </p>
        <div className="space-y-2">
          <button
            onClick={() => navigate('/payment-verification', { replace: true })}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-semibold transition"
          >
            Checkout erneut starten
          </button>
          <button
            onClick={() => navigate('/pricing', { replace: true })}
            className="w-full border border-border text-foreground py-3 rounded-lg font-semibold transition hover:bg-card/80"
          >
            Zu den Preisen
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;
