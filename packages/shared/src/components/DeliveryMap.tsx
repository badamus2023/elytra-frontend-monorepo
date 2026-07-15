import { Icon } from 'leaflet'
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'

const DefaultIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export type MapMarker = {
  id: string
  label: string
  latitude: number
  longitude: number
}

export type MapSegment = {
  id: string
  from: { latitude: number; longitude: number }
  to: { latitude: number; longitude: number }
  color?: string
}

type DeliveryMapProps = {
  height?: string
  markers: MapMarker[]
  segments?: MapSegment[]
}

function isValidCoord(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !(lat === 0 && lng === 0)
  )
}

export function DeliveryMap({
  height = '280px',
  markers,
  segments = [],
}: DeliveryMapProps) {
  const validMarkers = markers.filter((m) =>
    isValidCoord(m.latitude, m.longitude),
  )

  const validSegments = segments.filter(
    (s) =>
      isValidCoord(s.from.latitude, s.from.longitude) &&
      isValidCoord(s.to.latitude, s.to.longitude),
  )

  const centerLat =
    validMarkers.length > 0
      ? validMarkers.reduce((s, m) => s + m.latitude, 0) / validMarkers.length
      : 52.23
  const centerLng =
    validMarkers.length > 0
      ? validMarkers.reduce((s, m) => s + m.longitude, 0) / validMarkers.length
      : 21.01

  return (
    <div
      className="overflow-hidden rounded-xl border border-slate-200 [&_.leaflet-container]:rounded-xl"
      style={{ height }}
    >
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={validMarkers.length ? 12 : 6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validSegments.map((s) => (
          <Polyline
            key={s.id}
            positions={[
              [s.from.latitude, s.from.longitude],
              [s.to.latitude, s.to.longitude],
            ]}
            pathOptions={{
              color: s.color ?? '#0ea5e9',
              weight: 4,
              opacity: 0.85,
            }}
          />
        ))}
        {validMarkers.map((m) => (
          <Marker
            key={m.id}
            position={[m.latitude, m.longitude]}
            icon={DefaultIcon}
          >
            <Popup>{m.label}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
