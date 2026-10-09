import { api } from "@/lib/api";
import type { ShipmentTrackingResponse } from "@/types/api";

export function getShipmentTracking(tracking: string, token: string): Promise<ShipmentTrackingResponse> {
  return api.getMyShipmentTracking(tracking, token);
}
