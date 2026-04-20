import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import CountUp from 'react-countup'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Trip, TripPoint } from '@/types/trip'

// ─── Static fallback data (used when API is not available) ────────────────────
const STATIC_TRIPS: Trip[] = [
  { id: 1, name: 'Rio Grande do Sul', year: null, description: null, total_km: 1200, category: 'rs' },
  { id: 2, name: 'Brasil', year: null, description: null, total_km: 15000, category: 'brasil' },
  { id: 3, name: 'Internacional', year: null, description: null, total_km: 50000, category: 'internacional' },
]

const CATEGORY_COLORS: Record<string, string> = {
  rs: '#C9A961',
  brasil: '#C4A57B',
  internacional: '#F5EFE6',
}

const CATEGORY_LABELS: Record<string, string> = {
  rs: 'Rio Grande do Sul',
  brasil: 'Brasil',
  internacional: 'Internacional',
}

// ─── Stats Card ───────────────────────────────────────────────────────────────

interface StatsCardProps {
  totalKm: number
  paises: number
  estados: number
  cidades: number
  visible: boolean
}

function StatsCard({ totalKm, paises, estados, cidades, visible }: StatsCardProps) {
  return (
    <motion.div
      className="card-vintage w-full"
      initial={{ opacity: 0, x: 40 }}
      animate={visible ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Passport stamp header */}
      <div className="border-b-2 border-dashed border-dourado-vintage/40 pb-4 mb-4">
        <p className="font-script text-dourado-vintage text-lg">Passaporte de Viagens</p>
        <p className="font-sans text-creme-papel/50 text-xs">Jacinta Maria Jung Tomm</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatItem
          value={totalKm}
          suffix="+ km"
          label="percorridos"
          visible={visible}
        />
        <StatItem value={paises} suffix="" label="países" visible={visible} />
        <StatItem value={estados} suffix="" label="estados brasileiros" visible={visible} />
        <StatItem value={cidades} suffix="+" label="cidades" visible={visible} />
      </div>

      <div className="mt-4 pt-4 border-t border-madeira-clara/20">
        <p className="font-script text-madeira-clara text-sm leading-snug">
          "2.200 km de carro de Brasília até Santo Ângelo"
        </p>
      </div>
    </motion.div>
  )
}

interface StatItemProps {
  value: number
  suffix: string
  label: string
  visible: boolean
}

function StatItem({ value, suffix, label, visible }: StatItemProps) {
  return (
    <div className="text-center p-3 bg-verde-floresta/40 rounded-xl">
      <div className="font-serif text-2xl text-dourado-vintage">
        {visible ? <CountUp end={value} duration={2} separator="." /> : '0'}
        <span className="text-lg">{suffix}</span>
      </div>
      <p className="font-sans text-creme-papel/60 text-xs mt-1">{label}</p>
    </div>
  )
}

// ─── Map Component ────────────────────────────────────────────────────────────

interface MapComponentProps {
  trips: Trip[]
  activePointIndex: number
  allPoints: TripPoint[]
}

function InteractiveMap({ trips, activePointIndex, allPoints }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

  useEffect(() => {
    if (!mapRef.current || !mapboxToken) return

    let map: {
      remove: () => void
      on: (event: string, cb: () => void) => void
      addSource: (id: string, config: unknown) => void
      addLayer: (config: unknown) => void
    } | null = null

    const initMap = async () => {
      try {
        const mapboxgl = await import('mapbox-gl')
        await import('mapbox-gl/dist/mapbox-gl.css')

        // @ts-expect-error mapboxgl type
        mapboxgl.default.accessToken = mapboxToken

        // @ts-expect-error mapboxgl Map constructor
        map = new mapboxgl.default.Map({
          container: mapRef.current!,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [-54.2631, -28.2994],
          zoom: 3,
          projection: 'globe',
        }) as typeof map

        mapInstanceRef.current = map

        map!.on('load', () => {
          if (!map) return

          // Add trip routes as GeoJSON lines
          trips.forEach((trip) => {
            const tripPoints = allPoints.filter((p) => p.trip_id === trip.id)
            if (tripPoints.length < 2) return

            const coordinates = tripPoints
              .sort((a, b) => a.order - b.order)
              .map((p) => [p.longitude, p.latitude])

            map!.addSource(`route-${trip.id}`, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: { type: 'LineString', coordinates },
              },
            })

            map!.addLayer({
              id: `route-line-${trip.id}`,
              type: 'line',
              source: `route-${trip.id}`,
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: {
                'line-color': CATEGORY_COLORS[trip.category],
                'line-width': trip.id === 3 ? 2 : 1.5,
                'line-dasharray': [2, 2],
                'line-opacity': 0.8,
              },
            })
          })

          // Add point markers
          allPoints.slice(0, activePointIndex + 1).forEach((point) => {
            const el = document.createElement('div')
            el.className = 'trip-marker'
            el.style.cssText = `
              width: ${point.is_hub ? '14px' : '8px'};
              height: ${point.is_hub ? '14px' : '8px'};
              background: ${point.is_hub ? '#C9A961' : '#C4A57B'};
              border-radius: 50%;
              border: 2px solid rgba(255,255,255,0.6);
              box-shadow: 0 0 8px rgba(201,169,97,0.6);
            `

            // @ts-expect-error mapboxgl Marker
            new mapboxgl.default.Marker(el)
              .setLngLat([point.longitude, point.latitude])
              .addTo(map!)
          })
        })
      } catch {
        setMapError('Mapa indisponível. Configure VITE_MAPBOX_TOKEN para visualizar.')
      }
    }

    initMap()

    return () => {
      map?.remove()
    }
  }, [mapboxToken, trips, allPoints, activePointIndex])

  if (!mapboxToken || mapError) {
    return (
      <MapFallback trips={trips} error={mapError} />
    )
  }

  return <div ref={mapRef} className="w-full h-full rounded-2xl" />
}

function MapFallback({ trips, error }: { trips: Trip[]; error: string | null }) {
  return (
    <div className="w-full h-full rounded-2xl bg-verde-musgo/30 border border-madeira-clara/20 flex flex-col items-center justify-center p-8 text-center">
      <div className="text-6xl mb-4">🗺️</div>
      <h3 className="font-serif text-dourado-vintage text-xl mb-2">Mapa de Viagens</h3>
      <p className="font-sans text-creme-papel/50 text-sm mb-6">
        {error ?? 'Configure VITE_MAPBOX_TOKEN para visualizar o mapa interativo'}
      </p>

      {/* Visual route representation */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="flex items-center gap-2 px-3 py-2 rounded-full border border-madeira-clara/30"
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: CATEGORY_COLORS[trip.category] }}
            />
            <span className="font-sans text-sm text-creme-papel/70">
              {CATEGORY_LABELS[trip.category]}
            </span>
            <span className="font-script text-xs text-madeira-clara">
              {(trip.total_km / 1000).toFixed(0)}k km
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function MapaViagensSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const titleInView = useInView(titleRef, { once: true, margin: '-80px' })
  const statsInView = useInView(sectionRef, { once: true, margin: '-100px' })

  const [activePointIndex, setActivePointIndex] = useState(0)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Animate points as user scrolls through the section
  const pointProgress = useTransform(scrollYProgress, [0.1, 0.8], [0, 25])
  useEffect(() => {
    return pointProgress.on('change', (v) => setActivePointIndex(Math.floor(v)))
  }, [pointProgress])

  // Fetch trips from API (falls back to static if API not available)
  const { data: trips } = useQuery<Trip[]>({
    queryKey: ['trips'],
    queryFn: async () => {
      try {
        const res = await api.get<Trip[]>('/trips')
        return res.data
      } catch {
        return STATIC_TRIPS
      }
    },
    initialData: STATIC_TRIPS,
    staleTime: Infinity,
  })

  const { data: allPoints } = useQuery<TripPoint[]>({
    queryKey: ['trip-points'],
    queryFn: async () => {
      try {
        const results = await Promise.all(
          (trips ?? STATIC_TRIPS).map((t) =>
            api.get<TripPoint[]>(`/trips/${t.id}/points`).then((r) => r.data),
          ),
        )
        return results.flat()
      } catch {
        return []
      }
    },
    enabled: !!trips,
    initialData: [],
    staleTime: Infinity,
  })

  const totalKm = Math.round((trips ?? STATIC_TRIPS).reduce((sum, t) => sum + t.total_km, 0) / 1000) * 1000

  const handleRestart = useCallback(() => setActivePointIndex(0), [])
  void handleRestart

  return (
    <section
      id="viagens"
      ref={sectionRef}
      className="py-24 px-6 bg-verde-musgo/10 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12" ref={titleRef}>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0 }}
            animate={titleInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
          >
            Pelos caminhos do mundo
          </motion.p>
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Mapa de Viagens
          </motion.h2>
          <motion.p
            className="font-sans text-creme-papel/60 mt-4 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={titleInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            De Santo Ângelo ao Egito, de Brasília a Jerusalém —
            a vó Jacinta conheceu o mundo sem perder suas raízes.
          </motion.p>
        </div>

        {/* Map + Stats layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Map */}
          <div className="flex-1 h-[500px] lg:h-[600px]">
            <InteractiveMap
              trips={trips ?? STATIC_TRIPS}
              activePointIndex={activePointIndex}
              allPoints={allPoints ?? []}
            />
          </div>

          {/* Stats card — lateral on desktop, below on mobile */}
          <div className="lg:w-72">
            <StatsCard
              totalKm={totalKm}
              paises={10}
              estados={8}
              cidades={25}
              visible={statsInView}
            />

            {/* Destination list */}
            <motion.div
              className="mt-4 card-vintage"
              initial={{ opacity: 0, x: 40 }}
              animate={statsInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <p className="font-script text-dourado-vintage mb-3">Destinos</p>
              {(trips ?? STATIC_TRIPS).map((trip) => (
                <div key={trip.id} className="flex items-center gap-3 py-2 border-b border-madeira-clara/10 last:border-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: CATEGORY_COLORS[trip.category] }}
                  />
                  <div>
                    <p className="font-sans text-sm text-creme-papel/80">{trip.name}</p>
                    <p className="font-script text-xs text-madeira-clara">
                      ~{trip.total_km.toLocaleString('pt-BR')} km
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Santo Angelo hub note */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={statsInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
        >
          <p className="font-script text-madeira-clara text-lg">
            📍 Santo Ângelo, RS — o centro que ela sempre volta
          </p>
        </motion.div>
      </div>
    </section>
  )
}
