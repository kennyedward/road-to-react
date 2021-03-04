import { render, screen } from '@testing-library/react';
import App from './App';

test('renders hello kenny', () => {
  render(<App />);
  const h1Element = screen.getByText(/Hello/i);
  expect(h1Element).toBeInTheDocument();
});
