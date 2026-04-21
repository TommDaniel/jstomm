import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import type { Map as MapboxMap, Marker as MapboxMarker, GeoJSONSource } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
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
      <div className="border-b-2 border-dashed border-dourado-vintage/40 pb-4 mb-4">
        <p className="font-script text-dourado-vintage text-lg">Passaporte de Viagens</p>
        <p className="font-sans text-creme-papel/50 text-xs">Jacinta Maria Jung Tomm</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatItem value={totalKm} suffix="+ km" label="percorridos" visible={visible} />
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
  allPoints: TripPoint[]
  autoStart: boolean
}

const OVERVIEW: { center: [number, number]; zoom: number } = {
  center: [-20, 10],
  zoom: 1.4,
}

function InteractiveMap({ trips, allPoints, autoStart }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<MapboxMap | null>(null)
  const markersRef = useRef<MapboxMarker[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

  // Create the map exactly once. Interactive = false disables pan/zoom/rotate/touch/keyboard.
  useEffect(() => {
    if (!mapRef.current || !mapboxToken) return

    let cancelled = false

    ;(async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default
        if (cancelled || !mapRef.current) return

        mapboxgl.accessToken = mapboxToken

        const supported =
          typeof (mapboxgl as unknown as { supported?: () => boolean }).supported === 'function'
            ? (mapboxgl as unknown as { supported: () => boolean }).supported()
            : true
        if (!supported) {
          setMapError('Seu navegador não suporta WebGL para exibir o mapa.')
          return
        }

        const baseOptions = {
          container: mapRef.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: OVERVIEW.center,
          zoom: OVERVIEW.zoom,
          interactive: false,
          attributionControl: false,
        } as const

        // Globe first for the world-tour feel; fall back to mercator if the GPU
        // can't handle it (common on older mobile devices).
        let map: MapboxMap
        try {
          map = new mapboxgl.Map({ ...baseOptions, projection: 'globe' })
        } catch {
          if (cancelled || !mapRef.current) return
          map = new mapboxgl.Map(baseOptions)
        }

        mapInstanceRef.current = map

        map.on('error', (e) => {
          // Surface token/tile errors in the console without breaking the page.
          console.error('[Mapbox]', e.error?.message ?? e)
        })

        map.on('load', () => {
          if (cancelled) return

          // Mobile Safari sometimes measures the container at 0px before layout settles.
          map.resize()

          try {
            map.setFog({
              color: 'rgb(24, 36, 30)',
              'high-color': 'rgb(80, 110, 95)',
              'horizon-blend': 0.08,
              'space-color': 'rgb(8, 12, 14)',
              'star-intensity': 0.3,
            })
          } catch {
            // Fog is atmosphere-only; mercator fallback may reject it.
          }

          setMapLoaded(true)
        })
      } catch {
        if (!cancelled) setMapError('Mapa indisponível.')
      }
    })()

    return () => {
      cancelled = true
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
      setMapLoaded(false)
    }
  }, [mapboxToken])

  // Run the auto-play tour when the map is loaded and points data is available.
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !mapLoaded || !autoStart || allPoints.length === 0 || trips.length === 0) return

    let cancelled = false

    const run = async () => {
      const mapboxgl = (await import('mapbox-gl')).default
      if (cancelled) return

      // flyTo uses essential:true, so iOS's "Reduce Motion" no longer zeros the tour.
      const flyDuration = 1800
      const pauseMs = 400

      // Wait for a flyTo to finish. The moveend listener is registered before the
      // animation starts to dodge the race where essential:true fires moveend
      // synchronously. The timeout guarantees the loop can't hang if the event
      // never arrives (seen on some mobile browsers).
      const waitForMoveEnd = (duration: number) =>
        new Promise<void>((resolve) => {
          let done = false
          const finish = () => {
            if (done) return
            done = true
            map.off('moveend', finish)
            resolve()
          }
          map.once('moveend', finish)
          setTimeout(finish, duration + 500)
        })

      const tripCategoryById = new Map<number, string>()
      trips.forEach((t) => tripCategoryById.set(t.id, t.category))

      const sorted = [...allPoints].sort((a, b) => {
        if (a.trip_id !== b.trip_id) return a.trip_id - b.trip_id
        return a.order - b.order
      })

      // Re-init sources/layers empty, remove previous markers
      trips.forEach((trip) => {
        const sourceId = `route-${trip.id}`
        const layerId = `route-line-${trip.id}`
        if (map.getLayer(layerId)) map.removeLayer(layerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)

        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: [] },
          },
        })

        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': CATEGORY_COLORS[trip.category],
            'line-width': 2.5,
            'line-opacity': 0.9,
          },
        })
      })

      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      const runningCoords = new Map<number, [number, number][]>()
      trips.forEach((t) => runningCoords.set(t.id, []))

      // Main loop — restarts after the final overview pause
      while (!cancelled) {
        // Reset lines and markers at the start of each loop
        trips.forEach((trip) => {
          const src = map.getSource(`route-${trip.id}`) as GeoJSONSource | undefined
          if (src) {
            src.setData({
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: [] },
            })
          }
          runningCoords.set(trip.id, [])
        })
        markersRef.current.forEach((m) => m.remove())
        markersRef.current = []

        for (const point of sorted) {
          if (cancelled) return

          const category = tripCategoryById.get(point.trip_id) ?? 'brasil'
          const color = point.is_hub ? '#C9A961' : CATEGORY_COLORS[category] ?? '#C4A57B'
          const size = point.is_hub ? 16 : 10

          const el = document.createElement('div')
          el.className = 'trip-marker'
          el.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.85);
            box-shadow: 0 0 14px ${color};
            transition: transform 220ms ease-out;
            transform: scale(0);
          `
          const marker = new mapboxgl.Marker(el)
            .setLngLat([point.longitude, point.latitude])
            .addTo(map)
          markersRef.current.push(marker)
          requestAnimationFrame(() => {
            el.style.transform = 'scale(1)'
          })

          const coords = runningCoords.get(point.trip_id)!
          coords.push([point.longitude, point.latitude])
          const src = map.getSource(`route-${point.trip_id}`) as GeoJSONSource | undefined
          if (src) {
            src.setData({
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: coords },
            })
          }

          const moveEnd = waitForMoveEnd(flyDuration)
          map.flyTo({
            center: [point.longitude, point.latitude],
            zoom: point.is_hub ? 4.2 : 5,
            duration: flyDuration,
            essential: true,
            curve: 1.42,
          })
          await moveEnd

          if (cancelled) return
          await new Promise((r) => setTimeout(r, pauseMs))
        }

        if (cancelled) return

        // Final pan back to overview, then wait before looping
        const overviewMoveEnd = waitForMoveEnd(3200)
        map.flyTo({
          center: OVERVIEW.center,
          zoom: OVERVIEW.zoom,
          duration: 3200,
          essential: true,
          curve: 1.42,
        })
        await overviewMoveEnd

        if (cancelled) return
        await new Promise((r) => setTimeout(r, 4000))
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [mapLoaded, autoStart, allPoints, trips])

  if (!mapboxToken || mapError) {
    return <MapFallback trips={trips} error={mapError} />
  }

  // Border radius and overflow live on the parent wrapper: some mobile Safari
  // versions repaint the WebGL canvas incorrectly when clipped by border-radius
  // on the container element itself.
  return <div ref={mapRef} className="w-full h-full" />
}

function MapFallback({ trips, error }: { trips: Trip[]; error: string | null }) {
  return (
    <div className="w-full h-full rounded-2xl bg-verde-musgo/30 border border-madeira-clara/20 flex flex-col items-center justify-center p-8 text-center">
      <div className="text-6xl mb-4">🗺️</div>
      <h3 className="font-serif text-dourado-vintage text-xl mb-2">Mapa de Viagens</h3>
      <p className="font-sans text-creme-papel/50 text-sm mb-6">
        {error ?? 'Configure VITE_MAPBOX_TOKEN para visualizar o mapa interativo'}
      </p>

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

  const { data: trips = STATIC_TRIPS } = useQuery<Trip[]>({
    queryKey: ['trips'],
    queryFn: async () => {
      try {
        const res = await api.get<Trip[]>('/trips')
        return res.data
      } catch {
        return STATIC_TRIPS
      }
    },
    placeholderData: STATIC_TRIPS,
    staleTime: 5 * 60 * 1000,
  })

  const { data: allPoints = [] } = useQuery<TripPoint[]>({
    queryKey: ['trip-points', trips.map((t) => t.id).join(',')],
    queryFn: async () => {
      const results = await Promise.allSettled(
        trips.map((t) =>
          api.get<TripPoint[]>(`/trips/${t.id}/points`).then((r) => r.data),
        ),
      )
      return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    },
    enabled: trips.length > 0,
    staleTime: 5 * 60 * 1000,
  })

  const totalKm = Math.round((trips ?? STATIC_TRIPS).reduce((sum, t) => sum + t.total_km, 0) / 1000) * 1000

  return (
    <section
      id="viagens"
      ref={sectionRef}
      className="py-24 px-6 bg-verde-musgo/10 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
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

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full h-[500px] lg:h-[600px] lg:flex-1 rounded-2xl overflow-hidden">
            <InteractiveMap
              trips={trips ?? STATIC_TRIPS}
              allPoints={allPoints ?? []}
              autoStart
            />
          </div>

          <div className="lg:w-72">
            <StatsCard
              totalKm={totalKm}
              paises={10}
              estados={8}
              cidades={25}
              visible={statsInView}
            />

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
