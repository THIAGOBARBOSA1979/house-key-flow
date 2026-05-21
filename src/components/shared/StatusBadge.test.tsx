
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/Shared/StatusBadge';
import { describe, it, expect } from 'vitest';

describe('Design System: StatusBadge Component', () => {
  it('should render correctly with default status', () => {
    render(<StatusBadge status="complete" label="Concluído" />);
    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge-complete');
  });

  it('should show icon by default', () => {
    const { container } = render(<StatusBadge status="pending" />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should hide icon when showIcon is false', () => {
    const { container } = render(<StatusBadge status="pending" showIcon={false} />);
    const icon = container.querySelector('svg');
    expect(icon).not.toBeInTheDocument();
  });

  it('should apply size classes correctly', () => {
    const { container: smContainer } = render(<StatusBadge status="success" size="sm" />);
    expect(smContainer.querySelector('span[role="status"]')).toHaveClass('text-[9px]');

    const { container: lgContainer } = render(<StatusBadge status="success" size="lg" />);
    expect(lgContainer.querySelector('span[role="status"]')).toHaveClass('text-sem-body-sm');
  });
});
