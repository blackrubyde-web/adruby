import React, { createContext, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const StripeContext = createContext();

// Load Stripe with publishable key from environment variables
const stripePromise = loadStripe(import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY);

export const StripeProvider = ({ children }) => {
  const stripeOptions = {
    // AdRuby branding and styling for Stripe Elements
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#C80000', // AdRuby red
        colorBackground: '#ffffff',
        colorText: '#111111', // AdRuby anthracite
        colorDanger: '#dc2626',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
      rules: {
        '.Tab': {
          border: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          color: '#111111'
        },
        '.Tab:hover': {
          backgroundColor: '#f3f4f6',
          color: '#C80000'
        },
        '.Tab--selected': {
          backgroundColor: '#ffffff',
          borderColor: '#C80000',
          color: '#C80000'
        },
        '.Input': {
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          padding: '10px 12px'
        },
        '.Input:focus': {
          borderColor: '#C80000',
          boxShadow: '0 0 0 2px rgba(200, 0, 0, 0.1)'
        }
      }
    }
  };

  return (
    <StripeContext.Provider value={{ stripePromise, stripeOptions }}>
      {children}
    </StripeContext.Provider>
  );
};

export const useStripeContext = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripeContext must be used within a StripeProvider');
  }
  return context;
};

export default StripeContext;