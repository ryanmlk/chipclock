import { Position } from "@/types/enums";
import { apiFetch } from "./apiClient";
import type { AvailabilitySlot, Employee } from "@/generated/prisma/client";

export async function fetchAvailabilitiesAPI(
  positionFilter: Position,
  employeeFilter: string
) {
  const params = new URLSearchParams();
  if (positionFilter !== Position.All)
    params.append("position", positionFilter);
  if (employeeFilter) params.append("employee_id", employeeFilter);
  return apiFetch<
    (AvailabilitySlot & {
      employee?: Pick<
        Employee,
        "id" | "first_name" | "last_name" | "positions"
      >;
    })[]
  >(`/api/availability?${params}`);
}

export async function createAvailabilityAPI(
  availabilitySlots: AvailabilitySlot[]
) {
  return apiFetch(`/api/availability`, {
    method: "POST",
    body: JSON.stringify(availabilitySlots),
    headers: { "Content-Type": "application/json" },
    showToast: true,
    successMessage: `Availability created successfully`,
    errorMessage: "Failed to create availability",
  });
}
