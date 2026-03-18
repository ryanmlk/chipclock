import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LabourManagementPage from './page';
import { useLabourStore } from '@/store/useLabourStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { api } from '@/lib/api';
import React from 'react';

// Mock the stores
jest.mock('@/store/useLabourStore');
jest.mock('@/store/useScheduleStore');
// Mock the api
jest.mock('@/lib/api', () => ({
    api: {
        labour: {
            saveKPI: jest.fn().mockResolvedValue({ success: true }),
        }
    }
}));

// Mock sonner
jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    }
}));

describe('LabourManagementPage - Phase 3', () => {
    const mockFetchLabourData = jest.fn();
    const mockFetchShifts = jest.fn();
    const mockSetSales = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        
        (useLabourStore as unknown as jest.Mock).mockReturnValue({
            matrix: [
                { id: '1', sales_level: 4000, hours_allowed: 40 },
                { id: '2', sales_level: 5000, hours_allowed: 50 },
                { id: '3', sales_level: 6000, hours_allowed: 60 },
            ],
            sales: { current: "5500", projection: "7000", actualHours: "30.00" },
            loading: false,
            setSales: mockSetSales,
            fetchLabourData: mockFetchLabourData,
        });

        // Set 'now' to a fixed point for testing if possible, or relative
        const now = new Date();
        const start = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
        const end = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours from now
        
        (useScheduleStore as unknown as jest.Mock).mockReturnValue({
            shifts: [
                { id: '1', shift_start: start.toISOString(), shift_end: end.toISOString(), hours: '6.0' }
            ],
            loading: false,
            fetchShifts: mockFetchShifts,
        });
    });

    it('should calculate metrics and save to DB on Calculate button click', async () => {
        render(<LabourManagementPage />);

        const calculateButton = screen.getByRole('button', { name: /calculate/i });
        fireEvent.click(calculateButton);

        // Sales Target: 
        // actualHours (30) + remainingScheduledHours (4) = 34.00
        // Matrix has 40 hrs at 4000 sales level. So target should be 4000.
        expect(screen.getByText(/\$4000/i)).toBeInTheDocument();

        // Remaining Hours: 4.00
        expect(screen.getByText(/4.00 hrs/i)).toBeInTheDocument();
        expect(screen.getByText(/Remaining Hours/i)).toBeInTheDocument();

        // Verify saveKPI call
        await waitFor(() => {
            expect(api.labour.saveKPI).toHaveBeenCalledWith(expect.objectContaining({
                sales_projection: "7000",
                actual_sales: "5500",
                actual_hours: "30.00"
            }));
        });
    });
});
