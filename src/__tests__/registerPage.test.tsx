import { render, screen } from '@testing-library/react';
import { RegisterPage } from '../app/components/auth/RegisterPage';

// Mock motion/react so framer-motion doesn't interfere with tests
jest.mock('motion/react', () => {
  const React = require('react');
  const motion = new Proxy({}, {
    get: (_target: unknown, prop: string) =>
      React.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLElement>) =>
        React.createElement(prop, { ...props, ref })
      ),
  });
  return { __esModule: true, motion, AnimatePresence: ({ children }: { children: React.ReactNode }) => children };
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
