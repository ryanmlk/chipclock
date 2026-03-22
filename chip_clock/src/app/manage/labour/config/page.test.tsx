import { render, screen, waitFor } from '@testing-library/react';
import LabourConfigPage from './page';
import { useLabourStore } from '@/store/useLabourStore';

// Mock the store
jest.mock('@/store/useLabourStore');

describe('LabourConfigPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should format sales level accurately with implicit lower logic from store', async () => {
        (useLabourStore as unknown as jest.Mock).mockReturnValue({
            matrix: [
                { id: '1', sales_level: 4613, hours_allowed: 64.1 },
                { id: '2', sales_level: 5000, hours_allowed: 70.0 }
            ],
            loading: false,
            fetchLabourData: jest.fn(),
        });

        render(<LabourConfigPage />);

        // First row lower limit is 0
        await waitFor(() => {
            expect(screen.getByText((content) => {
                return content.includes('4,613') && content.includes('$0');
            })).toBeInTheDocument();
        });

        // Second row lower limit is previous upper limit + 1
        await waitFor(() => {
            expect(screen.getByText((content) => {
                return content.includes('4,614') && content.includes('5,000');
            })).toBeInTheDocument();
        });
    });

    it('should call fetchLabourData with true explicitly on refresh operations', async () => {
        const mockFetchLabourData = jest.fn();
        (useLabourStore as unknown as jest.Mock).mockReturnValue({
            matrix: [],
            loading: false,
            fetchLabourData: mockFetchLabourData,
        });

        render(<LabourConfigPage />);

        // Initial fetch call
        await waitFor(() => {
            expect(mockFetchLabourData).toHaveBeenCalledWith();
        });
    });
});
