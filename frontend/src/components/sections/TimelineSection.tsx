import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface TimelineEvent {
  year: string
  decade?: string
  title: string
  description: string
  photo?: string
  highlight?: boolean
  icon: string
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: '1956',
    decade: '1950s',
    title: 'Nascimento em Cerro Largo',
    description:
      'Jacinta Maria Jung nasce em 15 de abril de 1956, na Linha São Francisco, interior de Cerro Largo, Rio Grande do Sul. Filha de uma família profundamente enraizada na fé católica.',
    photo: '/photos/viagens/israel/arca-da-alianca.jpg',
    icon: '👶',
    highlight: true,
  },
  {
    year: 'Anos 1960–70',
    decade: '1960s–70s',
    title: 'Formação no Seminário',
    description:
      'Cresceu com os valores da igreja católica e aprendeu os dotes de casa no seminário: organização, dedicação e cuidado — virtudes que carrega até hoje.',
    icon: '⛪',
  },
  {
    year: '~1970',
    title: 'Chegada a Santo Ângelo',
    description:
      'Muda-se para Santo Ângelo em busca de oportunidades maiores. A cidade que seria o palco de toda a sua trajetória profissional e familiar.',
    icon: '🏡',
  },
  {
    year: '1978',
    title: 'Casamento com Sérgio Tomm',
    description:
      'Casa-se com Sérgio Tomm em Santo Ângelo. Ao unir-se à família Tomm, passa a fazer parte da comunidade luterana, onde permanece ativa até hoje.',
    photo: '/photos/familia/casamento-vintage.jpg',
    icon: '💍',
    highlight: true,
  },
  {
    year: '1979–1985',
    title: 'Nascimento dos filhos',
    description:
      'Nasce Fábio Tomm, depois Carla Tomm e Claudio Tomm. A família cresce com amor e determinação, mesmo nos desafios da vida.',
    photo: '/photos/familia/familia-noite.jpg',
    icon: '👨‍👩‍👧‍👦',
  },
  {
    year: '1986',
    title: 'Fundação da Concept',
    description:
      'Forma-se em Ciências Contábeis e funda a Concept Serviços Contábeis — tornando-se a primeira mulher com escritório contábil próprio em Santo Ângelo. Uma conquista histórica.',
    icon: '🏢',
    highlight: true,
  },
  {
    year: 'Anos 90–2000',
    title: 'Viagens pelo Brasil',
    description:
      'Percorre o Brasil de norte a sul: Rio de Janeiro, São Paulo, Brasília, Recife, Natal. Retornou de Brasília a Santo Ângelo de carro — 2.200 km de pura aventura.',
    photo: '/photos/viagens/brasilia/catedral-metropolitana.jpg',
    icon: '🚗',
  },
  {
    year: 'Anos 2000–2010',
    title: 'Viagens internacionais',
    description:
      'Conhece a Europa (Portugal, Alemanha, Holanda, Bélgica, Hungria) e o Oriente Médio (Egito e Israel). Pisou nas Pirâmides de Gizé e visitou Jerusalém.',
    photo: '/photos/viagens/egito/esfinge.jpg',
    icon: '✈️',
  },
  {
    year: '2016',
    title: '60 anos de casamento',
    description:
      'Celebra 60 anos de vida com a família reunida. Uma festa que eternizou a força e a alegria de quem vive com gratidão.',
    photo: '/photos/familia/quadro-60-anos-casamento.jpg',
    icon: '🥂',
    highlight: true,
  },
  {
    year: '2026',
    title: '70 anos — celebração em família',
    description:
      '15 de abril de 2026. Jacinta completa 70 anos com 3 filhos, 10 netos e uma vida repleta de conquistas, amor e aventuras. A história continua!',
    photo: '/photos/familia/evento-elegante.jpg',
    icon: '🎂',
    highlight: true,
  },
]

interface EventCardProps {
  event: TimelineEvent
  index: number
  isLeft: boolean
}

function EventCard({ event, index, isLeft }: EventCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div
      ref={ref}
      className={`flex items-start gap-4 md:gap-0 ${
        isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
      }`}
    >
      {/* Content — desktop half */}
      <motion.div
        className={`flex-1 pb-12 md:pb-16 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}
        initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: index * 0.05 }}
      >
        {/* Photo */}
        {event.photo && (
          <div
            className={`mb-4 ${isLeft ? 'flex justify-end md:justify-end' : ''}`}
          >
            <div
              className={`relative overflow-hidden rounded-xl max-w-[200px] aspect-[4/3] ${
                event.highlight ? 'ring-2 ring-dourado-vintage/50' : ''
              }`}
            >
              <img
                src={event.photo}
                alt={event.title}
                className="w-full h-full object-cover"
                style={{ filter: 'sepia(25%) contrast(1.05)' }}
                loading="lazy"
              />
            </div>
          </div>
        )}

        {/* Decade badge */}
        {event.decade && (
          <span className="inline-block font-script text-xs text-madeira-clara border border-madeira-clara/30 rounded-full px-3 py-0.5 mb-2">
            {event.decade}
          </span>
        )}

        <p
          className={`font-script text-lg mb-1 ${
            event.highlight ? 'text-dourado-vintage' : 'text-madeira-clara'
          }`}
        >
          {event.year}
        </p>
        <h3 className="font-serif text-xl text-creme-papel mb-2">{event.title}</h3>
        <p className="font-sans text-creme-papel/65 text-base leading-relaxed">
          {event.description}
        </p>
      </motion.div>

      {/* Center icon — desktop only */}
      <div className="hidden md:flex flex-col items-center flex-shrink-0 relative">
        <motion.div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl z-10 shadow-lg ${
            event.highlight
              ? 'bg-dourado-vintage shadow-dourado-vintage/40'
              : 'bg-verde-musgo border border-madeira-clara/40'
          }`}
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.4, delay: index * 0.05 + 0.2 }}
        >
          {event.icon}
        </motion.div>
        <div className="w-0.5 flex-1 bg-gradient-to-b from-dourado-vintage/40 to-madeira-clara/10 min-h-[40px]" />
      </div>

      {/* Mobile icon */}
      <div className="md:hidden flex-shrink-0 pt-1">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-base ${
            event.highlight ? 'bg-dourado-vintage' : 'bg-verde-musgo border border-madeira-clara/40'
          }`}
        >
          {event.icon}
        </div>
      </div>

      {/* Empty half on desktop */}
      <div className="hidden md:block flex-1" />
    </div>
  )
}

export default function TimelineSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-80px' })

  return (
    <section id="timeline" className="py-24 px-6 bg-verde-floresta overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16" ref={sectionRef}>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
          >
            70 anos de história
          </motion.p>
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Linha do Tempo
          </motion.h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical center line — desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-dourado-vintage/30 via-madeira-clara/20 to-transparent" />

          {/* Mobile left line */}
          <div className="md:hidden absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-dourado-vintage/30 via-madeira-clara/20 to-transparent" />

          {TIMELINE_EVENTS.map((event, i) => (
            <EventCard
              key={i}
              event={event}
              index={i}
              isLeft={i % 2 === 0}
            />
          ))}
        </div>

        {/* Footer */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="font-script text-dourado-vintage text-2xl">
            E a história continua... 🌟
          </p>
        </motion.div>
      </div>
    </section>
  )
}
