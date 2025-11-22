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
      alert('Для полигона нужно минимум 3 точки');
      return;
    }

    const baseName = nameInput.trim() || 'Новый полигон';
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
    if (!confirm('Вы действительно хотите удалить этот полигон?')) return;
    const next = polygons.filter((p) => p.id !== id);
    setPolygons(next);
    savePolygons(next);
  };

  const handleClearAll = () => {
    if (!confirm('Удалить все полигоны?')) return;
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

  return (
    <div className="map-page">
      {/* Chap panel */}
      <Paper className="map-sidebar" elevation={2}>
        <Typography variant="h5" gutterBottom>
          Карта – полигоны
        </Typography>

        <Typography variant="body2">
          Кликните по карте, чтобы добавить вершины. После того как добавите все
          точки, нажмите <strong>«Сохранить полигон»</strong>.
        </Typography>

        <Stack spacing={1} sx={{ my: 2 }}>
          <TextField
            size="small"
            label="Название полигона"
            placeholder="Например: Зона доставки"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleResetCurrent}
            >
              ОЧИСТИТЬ ТЕКУЩИЙ
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleFinishPolygon}
            >
              СОХРАНИТЬ ПОЛИГОН
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Текущих точек: {currentPoints.length}
          </Typography>
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack spacing={1} sx={{ mt: 1 }}>
          <TextField
            size="small"
            label="Фильтр по названию"
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
            УДАЛИТЬ ВСЕ ПОЛИГОНЫ
          </Button>
        </Stack>

        <div className="poly-list">
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Сохранённые полигоны
          </Typography>
          {filteredPolygons.length === 0 && (
            <Typography variant="body2" className="muted">
              Пока нет ни одного полигона
            </Typography>
          )}
          {filteredPolygons.map((p) => (
            <div key={p.id} className="poly-item">
              <div>
                <strong>{p.name}</strong>
                <div className="muted">
                  {p.points.length} точек •{' '}
                  {new Date(p.createdAt).toLocaleDateString('ru-RU')}
                </div>
              </div>
              <Button
                size="small"
                color="error"
                variant="outlined"
                onClick={() => handleDelete(p.id)}
              >
                Удалить
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
