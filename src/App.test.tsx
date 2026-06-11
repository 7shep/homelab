import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the homelab dashboard shell', () => {
    render(<App />);

    expect(screen.getByText('homelab')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Alerts')).toBeInTheDocument();
  });
});
