import { useEffect, useState } from "react";
import { getApiError } from "@/lib/api";
import type { ShipmentTrackingResponse } from "@/types/api";
import { getShipmentTracking } from "../services/trackingService";

export function useShipmentTracking(tracking: string | undefined, token: string | null) {
  const [shipment, setShipment] = useState<ShipmentTrackingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const skeletonTimer = window.setTimeout(() => {
      if (!cancelled) setShowSkeleton(true);
    }, 1000);

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;

      setLoading(true);
      setShowSkeleton(false);
      setError("");
      setShipment(null);

      if (!tracking || !token) {
        setLoading(false);
        setError("No se encontró un número de seguimiento válido.");
        return;
      }

      try {
        const result = await getShipmentTracking(tracking, token);
        if (!cancelled) setShipment(result);
      } catch (err: unknown) {
        if (cancelled) return;
        const status = typeof err === "object" && err !== null && "status" in err
          ? (err as { status?: number }).status
          : undefined;
        setError(status === 400 || status === 403 || status === 404
          ? "No pudimos encontrar este envío. Verifica el enlace o regresa a Mis envíos."
          : getApiError(err, "No pudimos cargar el seguimiento. Intenta nuevamente."));
      } finally {
        if (!cancelled) {
          setLoading(false);
          setShowSkeleton(false);
        }
        window.clearTimeout(skeletonTimer);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(skeletonTimer);
    };
  }, [token, tracking]);

  return { shipment, loading, showSkeleton, error };
}
