export type MapMarker = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
};

export type MapSegment = {
  id: string;
  from: { latitude: number; longitude: number };
  to: { latitude: number; longitude: number };
  color?: string;
};
