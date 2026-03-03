import { render, screen } from '@testing-library/react';
import RootLayout from './layout';
import React from 'react';

// Mock components that might require complex environment setup
jest.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignedIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  UserButton: () => <div>UserButton</div>,
}));

jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/themeProvider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('sonner', () => ({
  Toaster: () => <div>Toaster</div>,
}));

jest.mock('@/components/appSidebar', () => ({
  AppSidebar: () => <div>AppSidebar</div>,
}));

describe('RootLayout', () => {
  it('renders the header components and children', () => {
    // Suppress console.error for DOM nesting warnings during this specific test
    const originalError = console.error;
    console.error = jest.fn();

    render(
      <RootLayout>
        <div data-testid="child">Child Content</div>
      </RootLayout>
    );

    // Verify the mocked AppSidebar is rendered
    expect(screen.getByText('AppSidebar')).toBeInTheDocument();
    
    // Check for other elements
    expect(screen.getByPlaceholderText(/Search shifts/i)).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();

    console.error = originalError;
  });
});