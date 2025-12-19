import { render, screen } from '@testing-library/react';
import { RegisterPage } from '../app/components/auth/RegisterPage';

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

    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });
});
