import { useMemo, useState, useCallback, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import type { LatLngExpression, LatLngLiteral } from 'leaflet';

import 'leaflet/dist/leaflet.css';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';

import { useTranslation } from 'react-i18next';

import './style.css';

type StoredPolygon = {
  id: string;
  name: string;
  createdAt: string;
  points: LatLngLiteral[];
};

const STORAGE_KEY = 'app_polygons_v1';

const loadPolygons = (): StoredPolygon[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const savePolygons = (items: StoredPolygon[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const MapClickHandler = ({
  onClickPoint,
}: {
  onClickPoint: (point: LatLngLiteral) => void;
}) => {
  useMapEvents({
    click(e) {
      onClickPoint(e.latlng);
    },
  });

  return null;
};

const ResizeHandler = () => {
  const map = useMap();

  useEffect(() => {
    const id = setTimeout(() => {
      map.invalidateSize();
    }, 0);

    return () => clearTimeout(id);
  }, [map]);

  return null;
};

const MapPage = () => {
  const { t, i18n } = useTranslation();

  const [polygons, setPolygons] = useState<StoredPolygon[]>(() =>
    loadPolygons()
  );
  const [currentPoints, setCurrentPoints] = useState<LatLngLiteral[]>([]);
  const [nameInput, setNameInput] = useState('');
  const [filter, setFilter] = useState('');

  const center: LatLngExpression = [41.3111, 69.2797];

  const filteredPolygons = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return polygons;
    return polygons.filter((p) => p.name.toLowerCase().includes(q));
  }, [filter, polygons]);

  const handlePoint = useCallback((p: LatLngLiteral) => {
    setCurrentPoints((prev) => [...prev, p]);
  }, []);

  const handleResetCurrent = () => setCurrentPoints([]);

  const handleFinishPolygon = () => {
    if (currentPoints.length < 3) {
      alert(
        t('min_points_error') ||
          'Полигон учун камида 3 та нуқта керак / Для полигона нужно минимум 3 точки'
      );
      return;
    }

    const baseName = nameInput.trim() || t('new_polygon');
    const poly: StoredPolygon = {
      id: crypto.randomUUID(),
      name: baseName,
      createdAt: new Date().toISOString(),
      points: currentPoints,
    };

    const next = [...polygons, poly];
    setPolygons(next);
    savePolygons(next);
    setCurrentPoints([]);
    setNameInput('');
  };

  const handleDelete = (id: string) => {
    if (!confirm(t('delete_confirm_polygon') || t('confirm_delete'))) return;
    const next = polygons.filter((p) => p.id !== id);
    setPolygons(next);
    savePolygons(next);
  };

  const handleClearAll = () => {
    if (!confirm(t('delete_all_confirm') || t('confirm_delete'))) return;
    setPolygons([]);
    savePolygons([]);
  };

  const polygonShapes = useMemo(
    () =>
      polygons.map((p) => ({
        id: p.id,
        positions: p.points as LatLngExpression[],
      })),
    [polygons]
  );

  const currentLocale = (i18n.language || 'ru').startsWith('uz')
    ? 'uz-UZ'
    : 'ru-RU';

  return (
    <div className="map-page">
      <Paper className="map-sidebar" elevation={2}>
        <Typography variant="h5" gutterBottom>
          {t('map_title') || t('polygons')}
        </Typography>

        <Typography variant="body2">{t('map_helper_text')}</Typography>

        <Stack spacing={1} sx={{ my: 2 }}>
          <TextField
            size="small"
            label={t('polygon_name')}
            placeholder={t('polygon_name_placeholder') || ''}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleResetCurrent}
            >
              {t('clear_current')}
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleFinishPolygon}
            >
              {t('save_polygon')}
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {t('points_count_label') || t('points_count')}:{' '}
            {currentPoints.length}
          </Typography>
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack spacing={1} sx={{ mt: 1 }}>
          <TextField
            size="small"
            label={t('filter')}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Button
            variant="text"
            color="error"
            size="small"
            onClick={handleClearAll}
            disabled={polygons.length === 0}
          >
            {t('delete_all')}
          </Button>
        </Stack>

        <div className="poly-list">
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            {t('saved_polygons') || t('polygons')}
          </Typography>
          {filteredPolygons.length === 0 && (
            <Typography variant="body2" className="muted">
              {t('no_polygons')}
            </Typography>
          )}
          {filteredPolygons.map((p) => (
            <div key={p.id} className="poly-item">
              <div>
                <strong>{p.name}</strong>
                <div className="muted">
                  {p.points.length} {t('points_short') || ''} •{' '}
                  {new Date(p.createdAt).toLocaleDateString(currentLocale)}
                </div>
              </div>
              <Button
                size="small"
                color="error"
                variant="outlined"
                onClick={() => handleDelete(p.id)}
              >
                {t('delete')}
              </Button>
            </div>
          ))}
        </div>
      </Paper>

      <Paper className="map-wrapper" elevation={2}>
        <div className="map-inner">
          <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
            attributionControl={false}
          >
            <ResizeHandler />
            <TileLayer
              attribution=""
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {currentPoints.length >= 2 && (
              <Polygon positions={currentPoints as LatLngExpression[]} />
            )}
            {polygonShapes.map((p) => (
              <Polygon
                key={p.id}
                positions={p.positions}
                pathOptions={{ color: 'purple' }}
              />
            ))}
            <MapClickHandler onClickPoint={handlePoint} />
          </MapContainer>
        </div>
      </Paper>
    </div>
  );
};

export default MapPage;
