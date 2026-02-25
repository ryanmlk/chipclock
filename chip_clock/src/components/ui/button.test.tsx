import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders without crashing', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });
});