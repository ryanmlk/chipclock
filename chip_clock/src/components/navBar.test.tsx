import { render, screen } from '@testing-library/react';
import { NavigationBar } from './navBar';
import React from 'react';

// Mock components
jest.mock('@clerk/nextjs', () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  UserButton: () => <div>UserButton</div>,
}));

jest.mock('./themeToggle', () => ({
  ThemeToggle: () => <div>ThemeToggle</div>,
}));

describe('NavigationBar', () => {
  it('renders the core navigation links', () => {
    render(<NavigationBar />);

    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Management/i)).toBeInTheDocument();
    expect(screen.getByText(/UserButton/i)).toBeInTheDocument();
    expect(screen.getByText(/ThemeToggle/i)).toBeInTheDocument();
  });
});