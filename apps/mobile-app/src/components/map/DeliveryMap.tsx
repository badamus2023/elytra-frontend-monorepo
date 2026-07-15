import { useMemo } from 'react';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import styled from 'styled-components/native';
import {
  filterValidMarkers,
  filterValidSegments,
  getMapRegion,
} from './mapUtils';
import type { MapMarker, MapSegment } from './types';

type DeliveryMapProps = {
  height?: number;
  markers: MapMarker[];
  segments?: MapSegment[];
};

const Container = styled.View<{ $height: number }>`
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  height: ${({ $height }) => $height}px;
`;

const Map = styled(MapView)`
  flex: 1;
  width: 100%;
`;

export function DeliveryMap({
  height = 280,
  markers,
  segments = [],
}: DeliveryMapProps) {
  const validMarkers = useMemo(() => filterValidMarkers(markers), [markers]);
  const validSegments = useMemo(
    () => filterValidSegments(segments),
    [segments],
  );
  const initialRegion = useMemo(
    () => getMapRegion(validMarkers),
    [validMarkers],
  );

  return (
    <Container $height={height}>
      <Map
        initialRegion={initialRegion}
        provider={PROVIDER_DEFAULT}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {validSegments.map((segment) => (
          <Polyline
            key={segment.id}
            coordinates={[
              {
                latitude: segment.from.latitude,
                longitude: segment.from.longitude,
              },
              {
                latitude: segment.to.latitude,
                longitude: segment.to.longitude,
              },
            ]}
            strokeColor={segment.color ?? '#0ea5e9'}
            strokeWidth={4}
          />
        ))}
        {validMarkers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.label}
          />
        ))}
      </Map>
    </Container>
  );
}
