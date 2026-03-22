import { render, screen, waitFor } from '@testing-library/react';
import LabourConfigPage from './page';

// mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([
      { id: '1', sales_level: 4613, hours_allowed: 64.1 },
      { id: '2', sales_level: 5000, hours_allowed: 70.0 }
    ]),
  })
) as jest.Mock;

describe('LabourConfigPage', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockClear();
    });

    it('should format sales level accurately with implicit lower logic', async () => {
        render(<LabourConfigPage />);

        // First row lower limit is 0
        await waitFor(() => {
            expect(screen.getByText('$0 to $4,613')).toBeInTheDocument();
        });

        // Second row lower limit is previous upper limit + 1
        await waitFor(() => {
            expect(screen.getByText('$4,614 to $5,000')).toBeInTheDocument();
        });
    });
});
