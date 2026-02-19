import { render, screen } from '@testing-library/react';
import { RegisterPage } from '../app/components/auth/RegisterPage';
import React from 'react';

// Mock motion/react so framer-motion doesn't interfere with tests
vi.mock('motion/react', () => {
  const handler = {
    get(_target: Record<string, unknown>, prop: string) {
      const Comp = React.forwardRef(function MotionProxy(
        props: Record<string, unknown>,
        ref: React.Ref<HTMLElement>,
      ) {
        return React.createElement(prop, { ...props, ref });
      });
      Comp.displayName = `motion.${prop}`;
      return Comp;
    },
  };
  const motion = new Proxy({}, handler);
  return {
    __esModule: true,
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
});

describe('RegisterPage', () => {
  it('renders signup copy and form fields', () => {
    render(
      <RegisterPage
        onGoogleRegister={() => undefined}
        onEmailRegister={async () => 'needs_confirmation'}
        onNavigateToLogin={() => undefined}
        onProceedToPayment={() => undefined}
      />
    );

    expect(screen.getByText('Konto erstellen')).toBeInTheDocument();
    expect(screen.getByLabelText('Vollständiger Name')).toBeInTheDocument();
    expect(screen.getByLabelText('E-Mail-Adresse')).toBeInTheDocument();
    expect(screen.getByLabelText('Passwort')).toBeInTheDocument();
  });
});
