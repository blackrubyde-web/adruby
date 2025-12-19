import { render, screen } from '@testing-library/react';
import { Sparkles } from 'lucide-react';
import { EmptyState } from '../app/components/EmptyState';

describe('smoke', () => {
  it('renders a basic component', () => {
    render(
      <EmptyState
        icon={Sparkles}
        title="Keine Daten"
        description="Bitte verbinde dein Werbekonto."
        actionLabel="Verbinden"
        onAction={() => undefined}
      />
    );

    expect(screen.getByText('Keine Daten')).toBeInTheDocument();
    expect(screen.getByText('Verbinden')).toBeInTheDocument();
  });
});
