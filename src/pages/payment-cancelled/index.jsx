import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg border border-gray-100 text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-amber-600 text-2xl">!</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[#111111]">Zahlung abgebrochen</h1>
        <p className="text-gray-600">
          Du kannst den Checkout jederzeit erneut starten oder zu den Preisen zurückkehren.
        </p>
        <div className="space-y-2">
          <button
            onClick={() => navigate('/payment-verification', { replace: true })}
            className="w-full bg-[#C80000] hover:bg-[#A00000] text-white py-3 rounded-lg font-semibold transition"
          >
            Checkout erneut starten
          </button>
          <button
            onClick={() => navigate('/pricing', { replace: true })}
            className="w-full border border-gray-200 hover:border-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition"
          >
            Zu den Preisen
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;
