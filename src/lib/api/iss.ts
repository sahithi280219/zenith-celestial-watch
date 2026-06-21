import { useQuery } from "@tanstack/react-query";

export type ISSPosition = { lat: number; lon: number; altitude: number; velocity: number; timestamp: number };

export function useISS() {
  return useQuery({
    queryKey: ["iss-position"],
    queryFn: async (): Promise<ISSPosition> => {
      try {
        const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544", { cache: "no-store" });
        if (!res.ok) throw new Error("iss");
        const j = await res.json();
        return {
          lat: j.latitude,
          lon: j.longitude,
          altitude: j.altitude,
          velocity: j.velocity,
          timestamp: j.timestamp * 1000,
        };
      } catch {
        // Synthetic fallback - simulates orbit
        const t = Date.now() / 1000;
        const lat = Math.sin(t / 600) * 51.6;
        const lon = ((((t / 30) % 360) + 540) % 360) - 180;
        return { lat, lon, altitude: 408, velocity: 27600, timestamp: Date.now() };
      }
    },
    refetchInterval: 5000,
  });
}

export function useCrew() {
  return useQuery({
    queryKey: ["iss-crew"],
    queryFn: async () => {
      try {
        const res = await fetch("https://corsproxy.io/?https%3A%2F%2Fapi.open-notify.org%2Fastros.json");
        if (!res.ok) throw new Error();
        const j = await res.json();
        return j.people as { name: string; craft: string }[];
      } catch {
        return [
          { name: "Oleg Kononenko", craft: "ISS" },
          { name: "Nikolai Chub", craft: "ISS" },
          { name: "Tracy Caldwell Dyson", craft: "ISS" },
          { name: "Matthew Dominick", craft: "ISS" },
          { name: "Michael Barratt", craft: "ISS" },
          { name: "Jeanette Epps", craft: "ISS" },
          { name: "Li Guangsu", craft: "Tiangong" },
        ];
      }
    },
    staleTime: 60_000,
  });
}
