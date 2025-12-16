import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Header from '../Header';

describe('Header', () => {
  it('rendert Credits', () => {
    render(<Header credits="1234" />);
    expect(screen.getByText(/1234/)).toBeInTheDocument();
  });

  it('ruft onSearch bei Enter mit Query auf', () => {
    const onSearch = jest.fn();
    render(<Header onSearch={onSearch} />);
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(onSearch).toHaveBeenCalledWith('test query');
  });

  it('zeigt Notifications Badge wenn Count > 0', () => {
    render(<Header notificationsCount={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
