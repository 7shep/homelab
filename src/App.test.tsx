import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the homelab dashboard shell', () => {
    render(<App />);

    expect(screen.getAllByText('homelab')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Alerts')).toBeInTheDocument();
  });

  it('renders the developer console dashboard treatment', () => {
    render(<App />);

    expect(screen.getByText('~/ops')).toBeInTheDocument();
    expect(screen.getByText('Last sweep 42s ago')).toBeInTheDocument();
    expect(screen.getByText('Projects needing attention')).toBeInTheDocument();
    expect(screen.getByText('Active alerts')).toBeInTheDocument();
    expect(screen.getByText('Container monitoring')).toBeInTheDocument();
    expect(screen.getByText('Recent timeline')).toBeInTheDocument();
    expect(screen.getAllByText('media-stack / jellyfin')).toHaveLength(2);
  });

  it('groups container inventory by server and project', () => {
    render(<App />);

    expect(screen.getByText('Grouped by server')).toBeInTheDocument();
    expect(screen.getByText('atlas')).toBeInTheDocument();
    expect(screen.getByText('omega')).toBeInTheDocument();
    expect(screen.getByText('alertmanager')).toBeInTheDocument();
    expect(screen.getByText('Missing')).toBeInTheDocument();
  });

  it('surfaces container events in the operational timeline', () => {
    render(<App />);

    expect(screen.getAllByText('Container')).toHaveLength(3);
    expect(screen.getByText('media-stack / atlas / sonarr')).toBeInTheDocument();
    expect(screen.getByText('monitoring / omega / alertmanager')).toBeInTheDocument();
  });

  it('uses the mono stack for the dashboard chrome', () => {
    render(<App />);

    const [brand] = screen.getAllByText('homelab');
    const cssRules = Array.from(document.styleSheets).flatMap((sheet) => Array.from(sheet.cssRules));
    const brandClasses = Array.from(brand.classList);
    const brandFontRule = cssRules.some((rule) => {
      return (
        brandClasses.some((className) => rule.cssText.startsWith(`.${className} `)) &&
        rule.cssText.includes('"IBM Plex Mono", ui-monospace')
      );
    });

    expect(brandFontRule).toBe(true);
  });
});
