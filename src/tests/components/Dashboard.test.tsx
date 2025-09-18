import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Dashboard } from '@/components/dashboard/Dashboard';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Dashboard', () => {
  it('renders dashboard components', () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    
    // Test that component renders without crashing
    const { container } = render(<Dashboard />, { wrapper: createWrapper() });
    expect(container).toBeInTheDocument();
  });
});