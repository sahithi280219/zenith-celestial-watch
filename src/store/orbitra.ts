import { create } from "zustand";

export type LocationFix = {
  name: string;
  lat: number;
  lon: number;
  elevation?: number;
};

type State = {
  location: LocationFix;
  setLocation: (loc: LocationFix) => void;
  now: Date;
  tick: () => void;
};

export const useOrbitra = create<State>((set) => ({
  location: { name: "London, UK", lat: 51.5074, lon: -0.1278, elevation: 11 },
  setLocation: (loc) => set({ location: loc }),
  now: new Date(),
  tick: () => set({ now: new Date() }),
}));
