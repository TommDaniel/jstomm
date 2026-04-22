import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const BIO_PARAGRAPHS = [
  'Nascida em 15 de abril de 1956, na Linha São Francisco, em Cerro Largo, Jacinta Maria Jung Tomm é a sexta de dez irmãos — Elveny, Seno, Clarice, Ilse, Beatriz, Vera, Cecília, Medardo e Carmem (que partiu ainda bebê). Filha de Pedro Luis “Aloísio” Jung e Thereza Koehler Jung, cresceu numa família de imigrantes alemães onde se falava o dialeto e o trabalho na lavoura, a fé e a união eram o centro da vida.',
  'Aos 13 anos saiu de casa pra estudar no seminário, por um ano, aprendendo com as freiras os predicados que carregaria pra sempre. Depois, foi trabalhar em casa de família pra poder seguir estudando à noite. Veio o convite pra vir a Santo Ângelo, e na bagagem: coragem, determinação e o endereço dos tios de Sérgio — Arno e Doris Tomm, na Rua Andradas. Foi ali que o amor da vida dela começou.',
  'Passou por livraria, caixa de mercado, laboratório de análises clínicas e escritório de agrônomos, sempre conciliando trabalho e estudos. Casou-se com Sérgio em 1978 na Igreja Evangélica Luterana Sião, comunidade da qual é hoje líder. Três filhos nasceram dessa união: Fábio (1980, professor doutor na Unipampa), Carla (1982, juíza federal e professora na ESMAFE/RS) e Cláudio (1989, sócio no Concept). Em 08/08/1986, formou-se em Ciências Contábeis pela Unijui.',
  'Em 1991, no Edifício Executivo, abriu seu próprio escritório — a primeira mulher a ter escritório contábil em Santo Ângelo. Dali em diante, construiu a Concept Serviços Contábeis, adquirindo em 2015 o acervo de Eni Bohn e inaugurando em 2016 o prédio de 4 andares na Travessa Geiss 107, inovando ainda com as primeiras kitinetes Airbnb da cidade. Hoje, aos 70, segue ativa na comunidade — Luterana Sião, Centro Martinho Lutero, Sicredi, CTG 20 de Setembro e Lions Tiaraju — e orgulhosa de seus 10 netos: Daniel, Danieli, Helena, Joaquim, Conrado, Fernanda, Benjamim, Maitê e Clara.',
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
            <div className="grid grid-cols-4 gap-3 mt-4 pt-8 border-t border-madeira-clara/20">
              {[
                { value: '70', label: 'anos' },
                { value: '10', label: 'irmãos' },
                { value: '3', label: 'filhos' },
                { value: '10', label: 'netos' },
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
              src="/photos/historia/casamento-1978.png"
              caption="Casamento com Sérgio, 1978"
              rotation={3}
            />
          </div>
        </div>

        {/* Second photo row */}
        <div className="flex flex-wrap justify-center gap-8 mt-16">
          <PolaroidPhoto
            src="/photos/historia/santo-angelo-1971.png"
            caption="Chegada em Santo Ângelo, ~1971"
            rotation={-2}
          />
          <PolaroidPhoto
            src="/photos/historia/formatura-1986.png"
            caption="Formatura em Contabilidade, Unijui, 1986"
            rotation={1.5}
          />
          <PolaroidPhoto
            src="/photos/historia/bisneto-pais-2002.png"
            caption="Apresentando o primeiro bisneto aos pais, 2002"
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
