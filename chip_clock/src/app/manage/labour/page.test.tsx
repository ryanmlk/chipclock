import { render, screen, waitFor } from '@testing-library/react';
import LabourManagementPage from './page';
import { useLabourStore } from '@/store/useLabourStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import React from 'react';

// Mock the stores
jest.mock('@/store/useLabourStore');
jest.mock('@/store/useScheduleStore');

describe('LabourManagementPage - EOD Projection Initialization', () => {
    const mockFetchLabourData = jest.fn();
    const mockFetchShifts = jest.fn();
    const mockSetSales = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        
        (useLabourStore as unknown as jest.Mock).mockReturnValue({
            matrix: [],
            sales: { current: "", projection: "", actualHours: "" },
            loading: false,
            setSales: mockSetSales,
            fetchLabourData: mockFetchLabourData,
        });

        (useScheduleStore as unknown as jest.Mock).mockReturnValue({
            shifts: [],
            loading: false,
            fetchShifts: mockFetchShifts,
        });
    });

    it('should call fetchLabourData on mount', () => {
        render(<LabourManagementPage />);
        expect(mockFetchLabourData).toHaveBeenCalled();
    });

    it('should display the sales projection from the store in the EOD Projection input', async () => {
        (useLabourStore as unknown as jest.Mock).mockReturnValue({
            matrix: [],
            sales: { current: "", projection: "7500", actualHours: "" },
            loading: false,
            setSales: mockSetSales,
            fetchLabourData: mockFetchLabourData,
        });

        render(<LabourManagementPage />);
        
        const projectionInput = screen.getByPlaceholderText(/e.g. 7500/i) as HTMLInputElement;
        expect(projectionInput.value).toBe("7500");
    });
});
