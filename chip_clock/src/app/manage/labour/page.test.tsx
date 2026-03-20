import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LabourManagementPage from './page';
import { useLabourStore } from '@/store/useLabourStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { api } from '@/lib/api';
import React from 'react';
import 'react-day-picker/dist/style.css';

// Mock the stores
jest.mock('@/store/useLabourStore');
jest.mock('@/store/useScheduleStore');
// Mock the api
jest.mock('@/lib/api', () => ({
    api: {
        labour: {
            saveKPI: jest.fn().mockResolvedValue({ success: true }),
            getMatrix: jest.fn(),
            getSalesProjection: jest.fn(),
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

// Mock Date.now() or other global date/time functions if necessary for precise time simulation
const RealDate = Date;
const mockDate = (isoDateString: string) => {
    global.Date = class extends Date {
        constructor(dateString?: string | number | Date) {
            if (dateString) {
                super(dateString);
            } else {
                super(isoDateString);
            }
        }
    } as unknown as typeof Date;
};

afterAll(() => {
    global.Date = RealDate; // Restore original Date object
});


describe('LabourManagementPage - Phase 3', () => {
    const mockFetchLabourData = jest.fn();
    const mockFetchShifts = jest.fn();
    const mockSetSales = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock default date to a fixed point for consistent testing
        mockDate('2026-03-17T12:00:00.000Z'); // March 17, 2026, 12:00 PM UTC

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

        const now = new Date('2026-03-17T12:00:00.000Z'); // Use the mocked date
        const start = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago from mocked time
        const end = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours from now from mocked time

        (useScheduleStore as unknown as jest.Mock).mockReturnValue({
            shifts: [
                { id: '1', shift_start: start.toISOString(), shift_end: end.toISOString(), hours: '6.0' }
            ],
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

    it('should default Current Hours based on scheduled hours up to now', async () => {
        const now = new Date('2026-03-17T12:00:00.000Z'); // Mocked time
        const start = new Date(now.getTime() - 4 * 60 * 60 * 1000); // 4 hours ago from mocked time
        const end = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours from now from mocked time

        const mockShifts = [
            { id: '1', shift_start: start.toISOString(), shift_end: end.toISOString(), hours: '8.0' }
        ];

        (useLabourStore as unknown as jest.Mock).mockReturnValue({
            matrix: [],
            sales: { current: "", projection: "", actualHours: "" }, // actualHours is empty initially
            loading: false,
            setSales: mockSetSales,
            fetchLabourData: mockFetchLabourData,
        });

        (useScheduleStore as unknown as jest.Mock).mockReturnValue({
            shifts: mockShifts,
            loading: false,
            fetchShifts: mockFetchShifts,
        });

        render(<LabourManagementPage />);

        // Wait for the effect that sets the default hours.
        // The shift is 8 hours total. If it started 4 hours ago and ends 4 hours from now,
        // and `now` is exactly in the middle, then `scheduledHoursUpToNow` should be 4.0.
        await waitFor(() => {
            expect(mockSetSales).toHaveBeenCalledWith(expect.objectContaining({
                actualHours: "4.00"
            }));
        });
    });

    it('should update metrics and save to DB on Calculate button click', async () => {
        const now = new Date('2026-03-17T12:00:00.000Z'); // Mocked time
        const start = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago from mocked time
        const end = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours from now from mocked time

        const mockShifts = [
            { id: '1', shift_start: start.toISOString(), shift_end: end.toISOString(), hours: '6.0' } // 6 hour shift
        ];

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

        (useScheduleStore as unknown as jest.Mock).mockReturnValue({
            shifts: mockShifts,
            loading: false,
            fetchShifts: mockFetchShifts,
        });

        render(<LabourManagementPage />);

        const calculateButton = screen.getByRole('button', { name: /calculate/i });
        fireEvent.click(calculateButton);

        // Sales Target:
        // actualHours (30.00) + remainingScheduledHours (4.00 from the 6-hour shift) = 34.00 predicted closing hours.
        // Matrix entry with hours_allowed >= 34 is { id: '1', sales_level: 4000, hours_allowed: 40 }.
        // So target should be 4000.
        await waitFor(() => {
            expect(screen.getByText(/\$4000/i)).toBeInTheDocument();
        });

        // Remaining Hours: Should be 4.00 (6 hour shift - 2 hours passed = 4 hours remaining from mocked time)
        expect(screen.getByText(/4.00 hrs/i)).toBeInTheDocument();
        expect(screen.getByText(/Remaining Hours/i)).toBeInTheDocument();

        // Verify saveKPI call with loaded current sales and actual hours
        await waitFor(() => {
            expect(api.labour.saveKPI).toHaveBeenCalledWith(expect.objectContaining({
                sales_projection: "7000",
                actual_sales: "5500", // Should be loaded from store/API
                actual_hours: "30.00"  // Should be loaded from store/API
            }));
        });
    });

    it('should load current sales and actual hours from store on mount', async () => {
        const mockNow = new Date('2026-03-17T12:00:00.000Z');
        mockDate(mockNow.toISOString()); // Mock Date.now()

        const mockShifts = [
            { id: '1', shift_start: new Date(mockNow.getTime() - 2 * 60 * 60 * 1000).toISOString(), shift_end: new Date(mockNow.getTime() + 4 * 60 * 60 * 1000).toISOString(), hours: '6.0' }
        ];

        (useLabourStore as unknown as jest.Mock).mockReturnValue({
            matrix: [],
            sales: { current: "5500", projection: "7000", actualHours: "30.00" }, // Pre-filled from store
            loading: false,
            setSales: mockSetSales,
            fetchLabourData: mockFetchLabourData,
        });

        (useScheduleStore as unknown as jest.Mock).mockReturnValue({
            shifts: mockShifts,
            loading: false,
            fetchShifts: mockFetchShifts,
        });

        render(<LabourManagementPage />);

        // Check if the inputs are populated with the values from the store
        expect(screen.getByPlaceholderText(/Total hours clocked in/i)).toHaveValue(30.00);
        expect(screen.getByPlaceholderText(/e.g. 4500/i)).toHaveValue(5500);
        expect(screen.getByPlaceholderText(/e.g. 7500/i)).toHaveValue(7000);
    });
});