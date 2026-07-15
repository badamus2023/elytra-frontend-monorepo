import type { Region } from 'react-native-maps';
import type { MapMarker, MapSegment } from './types';

export const DEFAULT_CENTER = { latitude: 52.23, longitude: 21.01 };

export function isValidCoord(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !(lat === 0 && lng === 0)
  );
}

export function filterValidMarkers(markers: MapMarker[]): MapMarker[] {
  return markers.filter((m) => isValidCoord(m.latitude, m.longitude));
}

export function filterValidSegments(segments: MapSegment[]): MapSegment[] {
  return segments.filter(
    (s) =>
      isValidCoord(s.from.latitude, s.from.longitude) &&
      isValidCoord(s.to.latitude, s.to.longitude),
  );
}

export function getMapRegion(markers: MapMarker[]): Region {
  if (markers.length === 0) {
    return {
      ...DEFAULT_CENTER,
      latitudeDelta: 0.5,
      longitudeDelta: 0.5,
    };
  }

  if (markers.length === 1) {
    return {
      latitude: markers[0].latitude,
      longitude: markers[0].longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }

  const lats = markers.map((m) => m.latitude);
  const lngs = markers.map((m) => m.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.02),
    longitudeDelta: Math.max((maxLng - minLng) * 1.5, 0.02),
  };
}
