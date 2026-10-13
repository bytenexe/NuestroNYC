import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function MapFocus({ lat, lng }) {
  const map = useMap();

  useEffect(() => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return;
    map.flyTo([lat, lng], 14, { duration: 0.6 });
  }, [lat, lng, map]);

  return null;
}