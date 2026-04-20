import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const BIO_PARAGRAPHS = [
  'Nascida em 15 de abril de 1956, na Linha São Francisco, em Cerro Largo, Rio Grande do Sul, Jacinta Maria Jung Tomm cresceu em uma família profundamente enraizada na fé católica. Foi no seminário que aprendeu os dotes de dona de casa que carregaria pela vida — organização, dedicação e cuidado com os outros.',
  'Em busca de oportunidades maiores, partiu para Santo Ângelo, cidade que se tornaria o centro de toda a sua trajetória. Lá, em 1978, casou-se com Sérgio Tomm — e ao juntar-se à família Tomm, passou a fazer parte da comunidade luterana, onde permanece ativa até hoje.',
  'Com determinação e visão, formou-se em Ciências Contábeis em 1986 e abriu a Concept Serviços Contábeis — tornando-se a primeira mulher com escritório contábil próprio em Santo Ângelo. Uma conquista histórica, numa época em que o espaço profissional para mulheres ainda precisava ser conquistado palmo a palmo.',
  'Mãe de três filhos — Fábio, Carla e Claudio — e avó de dez netos, Jacinta construiu uma família que a reflete: forte, amorosa e unida. Aos 70 anos, segue ativa, viajando pelo mundo e sendo a força que mantém tudo junto.',
]

interface ParagraphProps {
  text: string
  delay: number
}

function AnimatedParagraph({ text, delay }: ParagraphProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.p
      ref={ref}
      className="font-sans text-creme-papel/80 text-base leading-relaxed"
      initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {text}
    </motion.p>
  )
}

export default function BiografiaSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section
      id="biografia"
      className="py-24 px-6 bg-verde-floresta overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16" ref={sectionRef}>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
          >
            Uma vida de conquistas
          </motion.p>
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            A história de Jacinta
          </motion.h2>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text column */}
          <div className="flex flex-col gap-6 order-2 lg:order-1">
            {BIO_PARAGRAPHS.map((para, i) => (
              <AnimatedParagraph key={i} text={para} delay={i * 0.1} />
            ))}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-8 border-t border-madeira-clara/20">
              {[
                { value: '70', label: 'anos de vida' },
                { value: '3', label: 'filhos amados' },
                { value: '10', label: 'netos queridos' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-serif text-3xl text-dourado-vintage">{stat.value}</p>
                  <p className="font-script text-madeira-clara text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Photo column — polaroid style */}
          <div className="flex justify-center order-1 lg:order-2">
            <PolaroidPhoto
              src="/photos/familia/casamento-vintage.jpg"
              caption="Casamento em Santo Ângelo, 1978"
              rotation={3}
            />
          </div>
        </div>

        {/* Second photo row */}
        <div className="flex flex-wrap justify-center gap-8 mt-16">
          <PolaroidPhoto
            src="/photos/familia/celebracao-formal.jpg"
            caption="Uma celebração especial"
            rotation={-2}
          />
          <PolaroidPhoto
            src="/photos/familia/jantar-familia.jpg"
            caption="Reunião de família"
            rotation={1.5}
          />
          <PolaroidPhoto
            src="/photos/familia/fonte-europeia.jpg"
            caption="Viajando pelo mundo"
            rotation={-3}
          />
        </div>
      </div>
    </section>
  )
}

interface PolaroidProps {
  src: string
  caption: string
  rotation: number
}

function PolaroidPhoto({ src, caption, rotation }: PolaroidProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      className="bg-creme-papel p-3 pb-10 shadow-2xl max-w-[280px] w-full cursor-pointer"
      style={{ rotate: rotation }}
      initial={{ opacity: 0, scale: 0.85, y: 40 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Sepia photo */}
      <div className="relative overflow-hidden aspect-[3/4]">
        <img
          src={src}
          alt={caption}
          className="w-full h-full object-cover"
          style={{ filter: 'sepia(40%) contrast(1.05) brightness(0.95)' }}
        />
        {/* Vintage overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 to-transparent mix-blend-multiply" />
      </div>
      {/* Caption */}
      <p className="font-script text-madeira-escura text-sm text-center mt-3 leading-snug">
        {caption}
      </p>
    </motion.div>
  )
}
