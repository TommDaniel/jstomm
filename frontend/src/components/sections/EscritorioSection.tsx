import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'

const TIMELINE_ITEMS = [
  {
    year: '08/08/1986',
    title: 'Formatura na Unijui',
    description:
      'Forma-se em Ciências Contábeis. Começa como autônoma, atendendo o Grupo Veiga, e constrói sua reputação na cidade.',
    icon: '🎓',
    highlight: true,
  },
  {
    year: '1991',
    title: 'Primeiro escritório próprio',
    description:
      'Abre escritório no Edifício Executivo — a primeira mulher a ter escritório contábil próprio em Santo Ângelo.',
    icon: '🏛️',
    highlight: true,
  },
  {
    year: '1994',
    title: 'Metalcaixas',
    description:
      'Com Sérgio, adquire a Eletro Metalúrgica Rural (Metalcaixas). O escritório migra para a Rua Tiradentes, esquina com a Av. Getúlio Vargas.',
    icon: '🏭',
  },
  {
    year: '1997',
    title: 'Sede própria',
    description:
      'Constrói e inaugura a sede própria na Av. Getúlio Vargas, onde permanece até o encerramento da empresa, em 2015.',
    icon: '🏗️',
  },
  {
    year: '2015',
    title: 'Nasce a CONCEPT',
    description:
      'Adquire o acervo de clientes do escritório Eni Bohn e forma a CONCEPT Serviços Contábeis. Equipe atual: Cleusa, Ligia, Vera e Hindra.',
    icon: '🤝',
    highlight: true,
  },
  {
    year: '2016',
    title: 'Travessa Geiss 107',
    description:
      'Idealiza e constrói o prédio de 4 andares da Travessa Geiss, 107 — sede atual do Concept e pioneira com kitnets mobiliadas por Airbnb em Santo Ângelo.',
    icon: '🏢',
    highlight: true,
  },
]

const QUOTE = 'A primeira contadora mulher a abrir seu próprio escritório em Santo Ângelo.'

function TypewriterText({ text, visible }: { text: string; visible: boolean }) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    if (!visible) return

    let i = 0
    setDisplayed('')
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i))
        i++
      } else {
        clearInterval(interval)
      }
    }, 40)

    return () => clearInterval(interval)
  }, [text, visible])

  return (
    <span>
      {displayed}
      {displayed.length < text.length && visible && (
        <motion.span
          className="inline-block w-0.5 h-6 bg-dourado-vintage ml-0.5 align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
    </span>
  )
}

interface TimelineItemProps {
  item: (typeof TIMELINE_ITEMS)[0]
  index: number
  isLast: boolean
}

function TimelineItem({ item, index, isLast }: TimelineItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div ref={ref} className="flex gap-6 relative">
      {/* Line */}
      {!isLast && (
        <motion.div
          className="absolute left-[22px] top-12 w-0.5 bg-gradient-to-b from-dourado-vintage to-madeira-clara/20"
          style={{ bottom: '-24px' }}
          initial={{ scaleY: 0, originY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
      )}

      {/* Icon */}
      <motion.div
        className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-lg z-10 ${
          item.highlight
            ? 'bg-dourado-vintage shadow-lg shadow-dourado-vintage/30'
            : 'bg-verde-musgo border border-madeira-clara/30'
        }`}
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        {item.icon}
      </motion.div>

      {/* Content */}
      <motion.div
        className="flex-1 pb-10"
        initial={{ opacity: 0, x: 20 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
      >
        <p className="font-script text-dourado-vintage text-lg mb-1">{item.year}</p>
        <h3 className="font-serif text-xl text-creme-papel mb-2">{item.title}</h3>
        <p className="font-sans text-creme-papel/65 text-base leading-relaxed">
          {item.description}
        </p>
      </motion.div>
    </div>
  )
}

export default function EscritorioSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const quoteRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-80px' })
  const quoteInView = useInView(quoteRef, { once: true, margin: '-60px' })

  return (
    <section id="escritorio" className="py-24 px-6 bg-verde-musgo/15 relative overflow-hidden">
      {/* Parallax background texture */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 40px,
            rgba(201,169,97,0.3) 40px,
            rgba(201,169,97,0.3) 41px
          )`,
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16" ref={sectionRef}>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
          >
            De um sonho à realidade
          </motion.p>
          <motion.h2
            className="section-title mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Concept Serviços Contábeis
          </motion.h2>
          <motion.p
            className="font-sans text-creme-papel/60 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Fundado em 1986, o escritório foi mais do que um negócio —
            foi um ato de coragem e pioneirismo.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Timeline */}
          <div>
            {TIMELINE_ITEMS.map((item, i) => (
              <TimelineItem
                key={i}
                item={item}
                index={i}
                isLast={i === TIMELINE_ITEMS.length - 1}
              />
            ))}
          </div>

          {/* Quote + visual */}
          <div className="flex flex-col gap-8">
            {/* Typewriter quote */}
            <div ref={quoteRef}>
              <motion.div
                className="card-vintage border-l-4 border-l-dourado-vintage"
                initial={{ opacity: 0, y: 30 }}
                animate={quoteInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7 }}
              >
                <p className="font-script text-dourado-vintage text-2xl mb-1">
                  "
                </p>
                <blockquote className="font-serif text-xl text-creme-papel leading-relaxed mb-4">
                  <TypewriterText text={QUOTE} visible={quoteInView} />
                </blockquote>
                <p className="font-script text-madeira-clara text-sm">
                  — Santo Ângelo, RS, 1986
                </p>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '1986', label: 'Fundação', sub: 'há quase 40 anos' },
                { value: '1ª', label: 'Pioneira', sub: 'mulher contadora em SA' },
                { value: '4', label: 'Décadas', sub: 'de excelência' },
                { value: 'CONCEPT', label: 'Hoje', sub: 'Travessa Geiss, 107' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  className="card-vintage text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={quoteInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <p className="font-serif text-3xl text-dourado-vintage">{stat.value}</p>
                  <p className="font-sans text-creme-papel/80 text-sm font-medium">{stat.label}</p>
                  <p className="font-script text-madeira-clara text-xs">{stat.sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Fachada atual do Concept */}
            <motion.div
              className="card-vintage overflow-hidden p-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={quoteInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <img
                src="/photos/historia/escritorio-concept.png"
                alt="Fachada do CONCEPT Serviços Contábeis em Santo Ângelo"
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="px-4 py-3 border-t border-madeira-clara/20">
                <p className="font-script text-dourado-vintage text-base">
                  CONCEPT Serviços Contábeis
                </p>
                <p className="font-sans text-creme-papel/50 text-xs">
                  Travessa Geiss, 107 — Santo Ângelo/RS
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
