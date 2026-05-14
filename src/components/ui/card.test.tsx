
import { render, screen } from '@testing-library/react';
import { Card, CardTitle } from '@/components/ui/card';
import { describe, it, expect } from 'vitest';

describe('Design System: Card Component', () => {
  it('should render with standard design system class', () => {
    render(
      <Card>
        <CardTitle>Test Card</CardTitle>
      </Card>
    );
    const card = screen.getByText('Test Card').closest('.card-standard');
    expect(card).toBeInTheDocument();
  });
});
