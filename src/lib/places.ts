export interface POI {
  name: string;
  type: string;
}

export interface NearbyPOIs {
  featured: POI | null;
  all: POI[];
}

// ── Foursquare ────────────────────────────────────────────────────────────────

async function fetchFoursquarePOIs(lat: number, lng: number): Promise<POI[]> {
  const key = import.meta.env.VITE_FOURSQUARE_API_KEY;
  if (!key) return [];

  const url = `https://api.foursquare.com/v3/places/search?ll=${lat},${lng}&radius=600&limit=15&sort=DISTANCE`;
  const res = await fetch(url, {
    headers: { Authorization: key },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return [];

  const data = await res.json();
  return (data.results ?? [])
    .filter((p: { name?: string }) => !!p.name)
    .map((p: { name: string; categories?: { name: string }[] }) => ({
      name: p.name,
      type: p.categories?.[0]?.name ?? 'venue',
    }));
}

// ── Overpass (non-business places: parks, monuments, buildings, art) ──────────

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const RADIUS = 600;

const OVERPASS_FILTERS = [
  ['tourism', 'artwork'],
  ['tourism', 'museum'],
  ['tourism', 'attraction'],
  ['tourism', 'viewpoint'],
  ['leisure', 'park'],
  ['leisure', 'garden'],
  ['historic', 'monument'],
  ['historic', 'memorial'],
  ['historic', 'building'],
  ['natural', 'tree'],
  ['amenity', 'fountain'],
];

const OVERPASS_LABELS: Record<string, string> = {
  artwork: 'street art / mural', museum: 'museum', attraction: 'landmark',
  viewpoint: 'viewpoint', park: 'park', garden: 'garden',
  monument: 'monument', memorial: 'memorial', building: 'historic building',
  tree: 'notable tree', fountain: 'fountain',
};

function buildOverpassQuery(lat: number, lng: number): string {
  const lines = OVERPASS_FILTERS.flatMap(([k, v]) => [
    `node["${k}"="${v}"](around:${RADIUS},${lat},${lng});`,
    `way["${k}"="${v}"](around:${RADIUS},${lat},${lng});`,
    `relation["${k}"="${v}"](around:${RADIUS},${lat},${lng});`,
  ]).join('\n');
  return `[out:json][timeout:8];\n(\n${lines}\n);\nout center 30;`;
}

async function fetchOverpassPOIs(lat: number, lng: number): Promise<POI[]> {
  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: buildOverpassQuery(lat, lng),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return [];
  const data = await res.json();

  const pois: POI[] = [];
  const seen = new Set<string>();
  for (const el of data.elements ?? []) {
    const name: string = el.tags?.name;
    if (!name || seen.has(name)) continue;
    seen.add(name);
    let type = 'place';
    for (const [k, v] of OVERPASS_FILTERS) {
      if (el.tags[k] === v) { type = OVERPASS_LABELS[v] ?? v; break; }
    }
    pois.push({ name, type });
  }
  return pois;
}

// ── Merged fetch ──────────────────────────────────────────────────────────────

export async function fetchNearbyPOIs(lat: number, lng: number): Promise<NearbyPOIs> {
  const [fsResult, opResult] = await Promise.allSettled([
    fetchFoursquarePOIs(lat, lng),
    fetchOverpassPOIs(lat, lng),
  ]);

  const fsPOIs = fsResult.status === 'fulfilled' ? fsResult.value : [];
  const opPOIs = opResult.status === 'fulfilled' ? opResult.value : [];

  // Merge and deduplicate by name
  const seen = new Set<string>();
  const merged: POI[] = [];
  for (const poi of [...fsPOIs, ...opPOIs]) {
    if (!seen.has(poi.name)) {
      seen.add(poi.name);
      merged.push(poi);
    }
  }

  const shuffled = merged.sort(() => Math.random() - 0.5).slice(0, 15);
  return {
    featured: shuffled[0] ?? null,
    all: shuffled,
  };
}
