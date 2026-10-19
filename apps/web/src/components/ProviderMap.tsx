import { useEffect, useRef, useState } from 'react';
import type mapboxgl from 'mapbox-gl';
import './ProviderMap.css';

// The map library is large (well over 1 MB), so it is not part of any page's own code: it is fetched only when a map
// is about to be seen, and not at all on a page whose map the visitor never scrolls to.
type MapboxModule = typeof mapboxgl;

export interface MapProviderMarker {
  id: string;
  name: string;
  location: { lat: number; lng: number } | null;
  /** Primary service/category shown in the marker popup. */
  category?: string | null;
  /** Suburb shown in the marker popup. */
  suburb?: string | null;
  /** "View profile" link in the popup — omit to hide the link (e.g. leads, which have no profile page). */
  href?: string | null;
}

interface Props {
  providers: MapProviderMarker[];
  selectedProviderId?: string | null;
  onMarkerClick?: (providerId: string) => void;
  /**
   * Address text shown alongside the "Map unavailable" / "Location
   * unavailable" fallback states — only meaningful for a single-subject
   * map (a provider profile page), so pass this only from those call sites.
   */
  address?: string | null;
  /**
   * For a single-subject map that only knows a suburb (a request): draw a soft circle of this radius around the point, so it reads as
   * "somewhere around here" rather than a building.
   */
  areaRadiusKm?: number;
}

// Vite bakes VITE_* vars into the client bundle at build time — this
// must be a PUBLIC Mapbox token (pk.*), never the secret server token
// used by geocoding.service.ts on the API side.
const ACCESS_TOKEN = (import.meta as any).env?.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;
const MAP_STYLE = 'mapbox://styles/mapbox/streets-v12';
// Australia-wide default view, shown before any markers are drawn —
// same fallback center/zoom the previous Google-based map used.
const DEFAULT_CENTER: [number, number] = [133.7751, -25.2744];
const DEFAULT_ZOOM = 3.5;

type MapStatus = 'loading' | 'ready' | 'error';

export default function ProviderMap({ providers, selectedProviderId, onMarkerClick, address, areaRadiusKm }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapboxRef = useRef<MapboxModule | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<globalThis.Map<string, mapboxgl.Marker>>(new globalThis.Map());
  const [status, setStatus] = useState<MapStatus>(ACCESS_TOKEN ? 'loading' : 'error');
  const [errorDetail, setErrorDetail] = useState<string>(
    ACCESS_TOKEN ? '' : 'VITE_MAPBOX_ACCESS_TOKEN is not set — map cannot load.'
  );

  // Initialize the map exactly once. Re-running this on every
  // providers/selection change would tear down and recreate the whole
  // WebGL context on every render — the marker effect below is what
  // reacts to data changes instead.
  useEffect(() => {
    const container = containerRef.current;
    if (!ACCESS_TOKEN || !container) return;

    let cancelled = false;
    let map: mapboxgl.Map | null = null;
    let observer: IntersectionObserver | null = null;

    function handleLoad() {
      if (cancelled || !map) return;
      mapRef.current = map;
      setStatus('ready');
    }
    function handleError(e: { error?: unknown }) {
      if (cancelled) return;
      console.error('[ProviderMap] Mapbox error:', e?.error ?? e);
      setStatus('error');
      setErrorDetail('The map failed to load — the access token may be invalid or restricted for this domain.');
    }

    async function start() {
      try {
        const [module] = await Promise.all([import('mapbox-gl'), import('mapbox-gl/dist/mapbox-gl.css')]);
        if (cancelled) return;
        const gl = module.default;
        mapboxRef.current = gl;
        gl.accessToken = ACCESS_TOKEN as string;
        map = new gl.Map({
          container: container as HTMLDivElement,
          style: MAP_STYLE,
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          attributionControl: true,
        });
        map.addControl(new gl.NavigationControl({ showCompass: false }), 'top-right');
        map.on('load', handleLoad);
        map.on('error', handleError as any);
      } catch (error) {
        if (cancelled) return;
        console.error('[ProviderMap] Could not load the map library:', error);
        setStatus('error');
        setErrorDetail('The map could not be loaded. Check your connection and try again.');
      }
    }

    // Start loading when the map is within a screen of being visible.
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer?.disconnect();
          void start();
        }
      }, { rootMargin: '400px 0px' });
      observer.observe(container);
    } else {
      void start();
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (map) {
        map.off('load', handleLoad);
        map.off('error', handleError as any);
      }
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  // Draw/update markers whenever the map becomes ready, the provider
  // list changes, or the selection changes.
  useEffect(() => {
    const map = mapRef.current;
    const gl = mapboxRef.current;
    if (status !== 'ready' || !map || !gl) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();
    for (const id of ['area-fill', 'area-line']) if (map.getLayer(id)) map.removeLayer(id);
    if (map.getSource('area')) map.removeSource('area');

    const withLocation = providers.filter(
      (p): p is MapProviderMarker & { location: { lat: number; lng: number } } => !!p.location
    );
    if (withLocation.length === 0) return;

    for (const p of withLocation) {
      const isSelected = p.id === selectedProviderId;
      const el = buildMarkerElement(p, isSelected, onMarkerClick);
      const popup = buildPopup(gl, p);
      const marker = new gl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([p.location.lng, p.location.lat])
        .setPopup(popup)
        .addTo(map);
      markersRef.current.set(p.id, marker);
    }

    if (withLocation.length === 1 && areaRadiusKm) {
      const { lat, lng } = withLocation[0].location;
      const ring = Array.from({ length: 65 }, (_, i) => {
        const a = (i / 64) * 2 * Math.PI;
        const dLat = (areaRadiusKm / 111.32) * Math.sin(a);
        const dLng = (areaRadiusKm / (111.32 * Math.cos((lat * Math.PI) / 180))) * Math.cos(a);
        return [lng + dLng, lat + dLat];
      });
      map.addSource('area', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } } });
      map.addLayer({ id: 'area-fill', type: 'fill', source: 'area', paint: { 'fill-color': '#1769E0', 'fill-opacity': 0.14 } });
      map.addLayer({ id: 'area-line', type: 'line', source: 'area', paint: { 'line-color': '#1769E0', 'line-width': 1.5, 'line-opacity': 0.6 } });
    }

    if (withLocation.length === 1) {
      // fitBounds on a single point zooms in to the maximum level —
      // a fixed, sensible neighborhood-level zoom reads better.
      map.easeTo({ center: [withLocation[0].location.lng, withLocation[0].location.lat], zoom: areaRadiusKm ? 11 : 12, duration: 0 });
    } else {
      const bounds = new gl.LngLatBounds();
      withLocation.forEach((p) => bounds.extend([p.location.lng, p.location.lat]));
      map.fitBounds(bounds, { padding: 56, maxZoom: 14, duration: 0 });
    }
  }, [status, providers, selectedProviderId, onMarkerClick, areaRadiusKm]);

  const withLocationCount = providers.filter((p) => p.location).length;

  return (
    <div className="provider-map">
      <div
        ref={containerRef}
        className={`provider-map-canvas${status !== 'ready' ? ' provider-map-canvas-hidden' : ''}`}
        role="application"
        aria-label="Map of provider locations"
      />
      {status === 'loading' && (
        <div className="provider-map-overlay">
          <span className="provider-map-spinner" aria-hidden="true" />
          <p>Loading map…</p>
        </div>
      )}
      {status === 'error' && (
        <div className="provider-map-overlay provider-map-overlay-error">
          <p className="provider-map-overlay-title">Map unavailable</p>
          {address && <p className="provider-map-overlay-address">{address}</p>}
          <p className="provider-map-overlay-detail">{errorDetail}</p>
        </div>
      )}
      {status === 'ready' && withLocationCount === 0 && (
        <div className="provider-map-overlay">
          <p className="provider-map-overlay-title">
            {providers.length <= 1 ? 'Location unavailable on map' : 'No providers with a location to show'}
          </p>
          {address && <p className="provider-map-overlay-address">{address}</p>}
        </div>
      )}
    </div>
  );
}

function buildMarkerElement(p: MapProviderMarker, isSelected: boolean, onMarkerClick?: (id: string) => void): HTMLDivElement {
  const el = document.createElement('div');
  el.className = `provider-map-marker${isSelected ? ' provider-map-marker-selected' : ''}`;
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  el.setAttribute('aria-label', `${p.name} — view on map`);
  el.addEventListener('click', () => onMarkerClick?.(p.id));
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onMarkerClick?.(p.id);
    }
  });
  return el;
}

function buildPopup(gl: MapboxModule, p: MapProviderMarker): mapboxgl.Popup {
  const popup = new gl.Popup({ offset: 28, closeButton: true, maxWidth: '260px' });
  const root = document.createElement('div');
  root.className = 'provider-map-popup';

  const name = document.createElement('strong');
  name.className = 'provider-map-popup-name';
  name.textContent = p.name;
  root.appendChild(name);

  if (p.category) {
    const category = document.createElement('span');
    category.className = 'provider-map-popup-category';
    category.textContent = p.category;
    root.appendChild(category);
  }
  if (p.suburb) {
    const suburb = document.createElement('span');
    suburb.className = 'provider-map-popup-suburb';
    suburb.textContent = p.suburb;
    root.appendChild(suburb);
  }
  if (p.href) {
    const link = document.createElement('a');
    link.className = 'provider-map-popup-link';
    link.href = p.href;
    link.textContent = 'View profile →';
    root.appendChild(link);
  }

  popup.setDOMContent(root);
  return popup;
}
