export interface POI {
  name: string;
  type: string;
}

export interface NearbyPOIs {
  featured: POI | null;
  all: POI[];
}

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const RADIUS = 600; // metres

// OSM tags we care about, mapped to a friendly label
const TAG_FILTERS = [
  ['amenity', 'cafe'],
  ['amenity', 'bar'],
  ['amenity', 'restaurant'],
  ['amenity', 'library'],
  ['amenity', 'cinema'],
  ['amenity', 'theatre'],
  ['amenity', 'marketplace'],
  ['amenity', 'fountain'],
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
  ['shop', 'bookshop'],
  ['shop', 'records'],
  ['shop', 'thrift'],
  ['shop', 'antiques'],
];

function buildQuery(lat: number, lng: number): string {
  const lines = TAG_FILTERS.flatMap(([k, v]) => [
    `node["${k}"="${v}"](around:${RADIUS},${lat},${lng});`,
    `way["${k}"="${v}"](around:${RADIUS},${lat},${lng});`,
    `relation["${k}"="${v}"](around:${RADIUS},${lat},${lng});`,
  ]).join('\n');
  return `[out:json][timeout:10];
(
${lines}
);
out center 40;`;
}

function labelFor(tags: Record<string, string>): string {
  const map: Record<string, string> = {
    cafe: 'café', bar: 'bar', restaurant: 'restaurant',
    library: 'library', cinema: 'cinema', theatre: 'theatre',
    marketplace: 'marketplace', fountain: 'fountain',
    artwork: 'street art / mural', museum: 'museum',
    attraction: 'local attraction', viewpoint: 'viewpoint',
    park: 'park', garden: 'garden',
    monument: 'monument', memorial: 'memorial', building: 'historic building',
    tree: 'notable tree',
    bookshop: 'bookshop', records: 'record shop',
    thrift: 'thrift store', antiques: 'antique shop',
  };
  for (const [k, v] of TAG_FILTERS) {
    if (tags[k] === v) return map[v] ?? v;
  }
  return 'place';
}

export async function fetchNearbyPOIs(lat: number, lng: number): Promise<NearbyPOIs> {
  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: buildQuery(lat, lng),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { featured: null, all: [] };
    const data = await res.json();

    const pois: POI[] = [];
    const seen = new Set<string>();

    for (const el of data.elements ?? []) {
      const name: string = el.tags?.name;
      if (!name || seen.has(name)) continue;
      seen.add(name);
      pois.push({ name, type: labelFor(el.tags) });
    }

    // Shuffle so the featured POI is random on every roll
    const shuffled = pois.sort(() => Math.random() - 0.5).slice(0, 15);
    return {
      featured: shuffled[0] ?? null,
      all: shuffled,
    };
  } catch {
    return { featured: null, all: [] };
  }
}
