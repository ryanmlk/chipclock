import { useLabourStore } from './useLabourStore';
import { api } from "@/lib/api";

// Mock the api
jest.mock("@/lib/api", () => ({
    api: {
        labour: {
            getMatrix: jest.fn(),
            getSalesProjection: jest.fn(), // This function doesn't exist yet
        }
    }
}));

describe('useLabourStore - fetchLabourData with Sales Projection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch matrix and sales projection and update the store', async () => {
        const mockMatrix = [{ id: '1', sales_level: 5000, hours_allowed: 50 }];
        const mockProjection = { date: '2026-03-17', sales_projection: 7500.00 };

        (api.labour.getMatrix as jest.Mock).mockResolvedValue(mockMatrix);
        (api.labour.getSalesProjection as jest.Mock).mockResolvedValue(mockProjection);

        const store = useLabourStore.getState();
        await store.fetchLabourData(true); // force fetch

        const updatedState = useLabourStore.getState();
        expect(updatedState.matrix).toEqual(mockMatrix);
        expect(updatedState.sales.projection).toBe("7500");
    });
});
