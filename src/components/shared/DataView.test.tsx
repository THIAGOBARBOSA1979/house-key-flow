import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataView } from './DataView';
import React from 'react';

// Mock components that might be problematic in tests
vi.mock('./SkeletonLoader', () => ({
  SkeletonLoader: () => <div data-testid="skeleton">Loading...</div>
}));

vi.mock('./EmptyState', () => ({
  EmptyState: ({ title }: { title: string }) => <div data-testid="empty">{title}</div>
}));

describe('DataView Component', () => {
  const mockItems = [
    { id: 1, name: 'Item 1', description: 'Desc 1' },
    { id: 2, name: 'Item 2', description: 'Desc 2' },
  ];

  it('renders loading state when isLoading is true', () => {
    render(<DataView items={mockItems} isLoading={true} />);
    expect(screen.getByTestId('skeleton')).toBeDefined();
  });

  it('renders empty state when items is empty', () => {
    render(<DataView items={[]} emptyState={{ title: 'No data', description: 'Test' }} />);
    expect(screen.getByTestId('empty')).toBeDefined();
    expect(screen.getByText('No data')).toBeDefined();
  });

  it('renders grid by default using renderGrid', () => {
    render(
      <DataView 
        items={mockItems} 
        renderGrid={(item: any) => <div data-testid="grid-item">{item.name}</div>} 
      />
    );
    const items = screen.getAllByTestId('grid-item');
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toBe('Item 1');
  });

  it('renders fallback list when viewMode is list and renderList is missing', () => {
    render(
      <DataView 
        items={mockItems} 
        viewMode="list" 
      />
    );
    expect(screen.getByText('Item 1')).toBeDefined();
    expect(screen.getByText('Item 2')).toBeDefined();
  });

  it('handles pagination correctly', () => {
    const manyItems = Array.from({ length: 15 }, (_, i) => ({ id: i, name: `Item ${i}` }));
    render(
      <DataView 
        items={manyItems} 
        itemsPerPage={5} 
        renderGrid={(item: any) => <div data-testid="grid-item">{item.name}</div>} 
      />
    );
    
    // Page 1 should have 5 items
    expect(screen.getAllByTestId('grid-item')).toHaveLength(5);
    // Should show pagination text
    expect(screen.getByText(/Mostrando/)).toBeDefined();
    
    // Use getAllByText and check for specific roles or contents if possible
    const pageButtons = screen.getAllByRole('button').filter(b => 
      b.textContent === '1' || b.textContent === '2' || b.textContent === '3'
    );
    expect(pageButtons.length).toBeGreaterThan(0);
  });
});
