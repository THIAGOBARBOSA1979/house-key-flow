import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataView } from './DataView';
import React from 'react';
import { DataViewMode } from '@/types/dataView';


// Mock components that might be problematic in tests
vi.mock('./SkeletonLoader', () => ({
  SkeletonLoader: ({ type }: { type: string }) => <div data-testid="skeleton" data-type={type}>Loading...</div>
}));

vi.mock('./EmptyState', () => ({
  EmptyState: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="empty">
      <h3 data-testid="empty-title">{title}</h3>
      <p data-testid="empty-description">{description}</p>
    </div>
  )
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
    expect(screen.getByText('Item 0')).toBeDefined();
    expect(screen.getByText('Item 4')).toBeDefined();
    
    // Should show pagination buttons
    const nextButton = screen.getAllByRole('button').find(b => b.querySelector('svg.lucide-chevron-right'));
    const prevButton = screen.getAllByRole('button').find(b => b.querySelector('svg.lucide-chevron-left'));
    
    expect(nextButton).toBeDefined();
    expect(prevButton).toBeDefined();
    expect(prevButton).toHaveProperty('disabled', true);
    
    // Go to next page
    if (nextButton) fireEvent.click(nextButton);
    
    expect(screen.getByText('Item 5')).toBeDefined();
    expect(screen.getByText('Item 9')).toBeDefined();
    expect(prevButton).toHaveProperty('disabled', false);
    
    // Click page 3 directly
    const page3Button = screen.getByRole('button', { name: '3' });
    fireEvent.click(page3Button);
    
    expect(screen.getByText('Item 10')).toBeDefined();
    expect(screen.getByText('Item 14')).toBeDefined();
    expect(nextButton).toHaveProperty('disabled', true);
  });

  it('renders standard view modes with fallback implementation', () => {
    const modes: DataViewMode[] = ['grid', 'list', 'table', 'timeline', 'calendar'];
    const { rerender } = render(
      <DataView 
        items={mockItems} 
        viewMode="grid" 
        renderGrid={(item: any) => <div data-testid="grid-item">{item.name}</div>}
      />
    );

    modes.forEach(mode => {
      rerender(
        <DataView 
          items={mockItems} 
          viewMode={mode} 
          renderGrid={(item: any) => <div data-testid="grid-item">{item.name}</div>}
        />
      );
      expect(screen.getByText('Item 1')).toBeDefined();
    });
  });
});

