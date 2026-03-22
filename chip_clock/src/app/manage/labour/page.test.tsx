import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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
        info: jest.fn(),
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

        // Verify saveKPI call with loaded current sales and actual hours
        await waitFor(() => {
            expect(api.labour.saveKPI).toHaveBeenCalledWith(expect.objectContaining({
                sales_projection: "7000",
                actual_sales: "5500",
                actual_hours: "30.00"
            }));
        });
    });

    it('should calculate metrics automatically without clicking Calculate button', async () => {
        const mockNow = new Date('2026-03-17T12:00:00.000Z');
        mockDate(mockNow.toISOString());

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
            shifts: [
                { id: '1', shift_start: new Date(mockNow.getTime() - 2 * 60 * 60 * 1000).toISOString(), shift_end: new Date(mockNow.getTime() + 4 * 60 * 60 * 1000).toISOString(), hours: '6.0' }
            ],
            loading: false,
            fetchShifts: mockFetchShifts,
        });

        render(<LabourManagementPage />);

        // Sales Target:
        // actualHours (30.00) + remainingScheduledHours (4.00 from the 6-hour shift) = 34.00 predicted closing hours.
        // Matrix entry with hours_allowed >= 34 is { id: '1', sales_level: 4000, hours_allowed: 40 }.
        // So target should be 4000.
        await waitFor(() => {
            expect(screen.getByText(/\$4000/i)).toBeInTheDocument();
        });

        // Remaining Hours: Should be 4.00
        expect(screen.getByText(/4\.00 hrs/i)).toBeInTheDocument();
        expect(screen.getByText(/Remaining Hours/i)).toBeInTheDocument();
        expect(screen.getByText(/26\.00 hrs/i)).toBeInTheDocument();
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

    it('should recalculate remaining hours when time is changed', async () => {
        const mockNow = new Date('2026-03-17T12:00:00.000Z');
        mockDate(mockNow.toISOString());

        const mockShifts = [
            { id: '1', shift_start: new Date(mockNow.getTime() - 2 * 60 * 60 * 1000).toISOString(), shift_end: new Date(mockNow.getTime() + 4 * 60 * 60 * 1000).toISOString(), hours: '6.0' }
        ];

        (useLabourStore as unknown as jest.Mock).mockReturnValue({
            matrix: [],
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

        const calcBtn = screen.getAllByRole('button', { name: /Calculate/i })[0];
        fireEvent.click(calcBtn);

        // Initially at 12:00 PM, 4 hours remaining
        await waitFor(() => {
            const matches = screen.getAllByText(/4\.00 hrs/i);
            expect(matches.length).toBeGreaterThan(0);
        });

        // Open DateTimePicker
        const pickerBtn = screen.getByRole('button', { name: /Mar/i }); // Will match formatting for March 17th
        fireEvent.click(pickerBtn);

        // Find hours input and change it to 14 (2 PM local, mocking local hour + 2)
        const hoursInput = screen.getByLabelText('Hours');
        act(() => {
            // we'll just bump the existing hour up by 2 to simulate moving 2 hours ahead
            // since timezone could affect the local hour value
            const currentHourStr = (hoursInput as HTMLInputElement).value;
            const nextHour = parseInt(currentHourStr, 10) + 2;
            fireEvent.change(hoursInput, { target: { value: nextHour.toString() } });
        });

        fireEvent.click(calcBtn);

        await waitFor(() => {
            const matches = screen.getAllByText(/2\.00 hrs/i);
            expect(matches.length).toBeGreaterThan(0);
        });
    });

    it('should calculate allowed hours correctly using the upper limit logic', async () => {
        const mockNow = new Date('2026-03-17T12:00:00.000Z');
        mockDate(mockNow.toISOString());

        // We use an empty shift array so scheduledHoursUpToNow = 0
        (useLabourStore as unknown as jest.Mock).mockReturnValue({
            matrix: [
                { id: '1', sales_level: 4613, hours_allowed: 64.1 },
                { id: '2', sales_level: 5000, hours_allowed: 70.0 },
            ],
            // current sales is 4614, which crosses into the 5000 tier!
            sales: { current: "4614", projection: "4613", actualHours: "0" },
            loading: false,
            setSales: mockSetSales,
            fetchLabourData: mockFetchLabourData,
        });

        (useScheduleStore as unknown as jest.Mock).mockReturnValue({
            shifts: [],
            loading: false,
            fetchShifts: mockFetchShifts,
        });

        render(<LabourManagementPage />);

        const calcBtn = screen.getAllByRole('button', { name: /Calculate/i })[0];
        fireEvent.click(calcBtn);

        // At current sales 4614, it should use the 5000 tier (70.0 hrs).
        // The Current Performance loss is calculated as: currentAllowed - effectiveCurrentHours.
        // effectiveCurrentHours = 0.
        // so currentAllowed = 70.0 -> loss is 70.00 hrs.
        await waitFor(() => {
            expect(screen.getByText(/70\.00 hrs/i)).toBeInTheDocument();
        });

        // At projection 4613, it should use the 4613 tier (64.1 hrs).
        // Projected allowed should display 64.10 hrs
        await waitFor(() => {
            expect(screen.getByText(/64\.10 hrs/i)).toBeInTheDocument();
        });
    });

    it('should exclude manager shifts from calculations', async () => {
        const now = new Date('2026-03-17T12:00:00.000Z');
        mockDate(now.toISOString());

        const mockShifts = [
            { id: '1', shift_start: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), shift_end: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(), hours: '6.0', employee: { role: 'cashier' } },
            { id: '2', shift_start: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), shift_end: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(), hours: '8.0', employee: { role: 'manager' } },
            { id: '3', shift_start: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), shift_end: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(), hours: '8.0', employee: { role: 'MANAGER' } }
        ];

        (useLabourStore as unknown as jest.Mock).mockReturnValue({
            matrix: [],
            sales: { current: "", projection: "", actualHours: "" },
            loading: false,
            setSales: jest.fn(),
            fetchLabourData: jest.fn(),
        });

        (useScheduleStore as unknown as jest.Mock).mockReturnValue({
            shifts: mockShifts,
            loading: false,
            fetchShifts: jest.fn(),
        });

        render(<LabourManagementPage />);

        // Check "Total Scheduled"
        // Manager shifts (8 hours x 2) must be ignored. Total scheduled should be 6.00 hrs, not 22.00 hrs.
        await waitFor(() => {
            expect(screen.getAllByText(/6\.00 hrs/i).length).toBeGreaterThan(0);
        });

        const query22 = screen.queryByText(/22\.00 hrs/i);
        expect(query22).not.toBeInTheDocument();
    });
});