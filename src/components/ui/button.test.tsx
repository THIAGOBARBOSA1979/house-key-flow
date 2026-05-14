
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { describe, it, expect } from 'vitest';

describe('Design System: Button Component', () => {
  it('should render correctly with default styles', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('inline-flex');
  });

  it('should apply variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByText('Delete');
    expect(button).toHaveClass('bg-destructive');
  });

  it('should be disabled when the disabled prop is passed', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:interactive-disabled');
  });
});
