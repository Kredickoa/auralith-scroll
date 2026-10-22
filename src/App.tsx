import { useEffect, useRef, useState } from 'react';
import { motion, useScroll } from 'motion/react';
import { SpeakerLayerScene } from './speaker-layers';
import { Button } from '../components/ui/button';

function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border/40 py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="flex flex-row justify-between items-center gap-8 px-8 max-w-7xl mx-auto">
        <a href="#top" className="font-heading text-3xl tracking-tight text-foreground transition-opacity hover:opacity-80">
          Auralith
        </a>

        <div className="hidden md:flex items-center gap-8 ml-16 mr-auto">
          {['Architecture', 'Materials', 'Collection', 'Inquiry'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link}
            </a>
          ))}
        </div>

        <Button
          onClick={() => document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' })}
          variant="secondary"
          className="rounded-full bg-secondary/60 backdrop-blur-sm text-secondary-foreground hover:bg-secondary/80 border border-border/50 px-6 py-2.5 h-auto text-sm transition-all hover:scale-[1.02] shadow-none"
        >
          Request Private Preview
        </Button>
      </div>
    </header>
  );
}

function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new SpeakerLayerScene(canvas);
    scene.setProgress(scrollYProgress.get());
    const unsubscribe = scrollYProgress.on('change', value => scene.setProgress(value));
    return () => { unsubscribe(); scene.dispose(); };
  }, [scrollYProgress]);

  return (
    <section ref={containerRef} className="relative h-[235vh] bg-background">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-transparent">
        <canvas
          ref={canvasRef}
          aria-label="Auralith speaker: scroll to reveal the construction"
          className="absolute inset-0 z-0 h-full w-full"
        />

        <div className="relative z-20 mx-auto flex h-full max-w-7xl items-center px-6 lg:px-8">
          <motion.div
            className="flex w-full max-w-[430px] flex-col items-start text-left pt-16 md:pt-0"
          >
            <div>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-[4.15rem] leading-[0.96] font-normal text-foreground tracking-tight">
                Presenting sound <span className="block text-muted-foreground/80 italic mt-2 transform-none">as architecture.</span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-[380px] mt-6 leading-relaxed font-medium">
                Auralith unveils a flagship modular speaker system shaped with sculptural precision, acoustic depth, and quiet authority.
              </p>

              <div className="flex flex-row items-center justify-start gap-3 mt-8 md:mt-10">
                <Button onClick={() => document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-full px-6 py-3 text-sm border-0 bg-foreground text-background hover:bg-foreground/90 transition-transform active:scale-95 shadow-none h-auto font-medium">
                  Explore the System
                </Button>
                <Button onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })} variant="ghost" className="rounded-full px-5 py-3 h-auto text-sm font-medium hover:bg-[#d9d8dd] border border-transparent hover:border-border/60 transition-colors">
                  View Collection
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ArchitectureSection() {
  return (
    <section id="architecture" className="py-32 bg-background relative z-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-foreground mb-8">
              A monolithic <br />presence.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-md">
              Every curve and component is machined from aerospace-grade graphite alloy. The result is a resonance-free enclosure that eliminates internal standing waves, allowing only pure acoustic energy to propagate.
            </p>
            <div className="w-full h-[1px] bg-border mb-8" />
            <div className="flex items-start gap-12">
              <div>
                <span className="block font-heading text-3xl text-foreground">0.02%</span>
                <span className="block text-xs uppercase tracking-widest text-muted-foreground mt-2">Total Harmonic <br/>Distortion</span>
              </div>
              <div>
                <span className="block font-heading text-3xl text-foreground">112<span className="text-xl">dB</span></span>
                <span className="block text-xs uppercase tracking-widest text-muted-foreground mt-2">Max <br/>SPL</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="aspect-[4/5] bg-secondary rounded-2xl overflow-hidden relative"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <img
              src="https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=2070&auto=format&fit=crop"
              alt="Auralith speaker monolithic detail"
              className="w-full h-full object-cover mix-blend-luminosity opacity-80 hover:opacity-100 transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function AcousticLayersSection() {
  const layers = [
    {
      title: "Beryllium Tweeter",
      description: "Ultra-rigid dome construction pushes the breakup frequency far beyond human hearing, delivering airy, transparent highs."
    },
    {
      title: "Woven Carbon Midrange",
      description: "An incredibly stiff yet lightweight cone provides explosive transient response and pinpoint vocal localization."
    },
    {
      title: "Dual Opposed Woofers",
      description: "Symmetrically mounted bass drivers cancel out cabinet vibration while delivering deep, authoritative low frequencies."
    }
  ];

  return (
    <section id="materials" className="py-32 bg-secondary/50 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-24">
          <h2 className="font-heading text-4xl sm:text-5xl text-foreground mb-6">Acoustic deconstruction</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Auralith separates frequency bands into discrete, isolated chambers,
            preventing mechanical interference and intermodulation distortion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {layers.map((layer, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: index * 0.15, ease: "easeOut" }}
              className="group"
            >
              <div className="mb-6 h-[1px] w-full bg-border relative">
                <motion.div
                  className="absolute top-0 left-0 h-[2px] bg-foreground"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: index * 0.2 + 0.3 }}
                />
              </div>
              <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-3">0{index + 1}</span>
              <h3 className="font-heading text-2xl text-foreground mb-4">{layer.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{layer.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SignatureCollection() {
  return (
    <section id="collection" className="py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="font-heading text-4xl sm:text-5xl text-foreground mb-16">Signature finishes</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <motion.div
            className="group cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="aspect-square bg-secondary rounded-2xl overflow-hidden mb-6 relative">
              <img
                src="./collection/graphite-element.png?v=2"
                alt="Matte graphite bookshelf speaker with textured cabinet and copper tweeter trim"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">Graphite Element</h3>
            <p className="text-sm text-muted-foreground">Textured graphite finish with subtle copper detailing.</p>
          </motion.div>

          <motion.div
            className="group cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="aspect-square bg-secondary rounded-2xl overflow-hidden mb-6 relative">
              <img
                src="./collection/titanium-core.png?v=2"
                alt="Silver bookshelf speaker with a textured charcoal baffle and matte cone driver"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">Titanium Core</h3>
            <p className="text-sm text-muted-foreground">Satin silver enclosure with a textured charcoal acoustic baffle.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function InquirySection() {
  return (
    <section id="inquiry" className="py-32 lg:py-48 bg-foreground text-background">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 1 }}
        >
          <span className="block text-xs uppercase tracking-widest text-muted-foreground/60 mb-6">Private Audition</span>
          <h2 className="font-heading text-5xl sm:text-6xl text-background mb-8">Hear the architecture.</h2>
          <p className="text-muted-foreground/80 text-lg max-w-xl mx-auto leading-relaxed mb-12">
            Auralith systems are built to order in limited quantities. We invite collectors and audiophiles to schedule a private studio audition.
          </p>
          <Button onClick={() => document.querySelector<HTMLDialogElement>('#demo-info')?.showModal()} variant="outline" className="rounded-full px-12 py-7 h-auto text-base border-background/20 text-background hover:bg-background hover:text-foreground transition-all duration-300">
            Preview Inquiry
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-foreground text-background border-t border-background/10 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <span className="font-heading text-2xl tracking-tight">Auralith</span>
        <div className="flex gap-6 text-sm text-muted-foreground/60">
          <button type="button" aria-haspopup="dialog" onClick={() => document.querySelector<HTMLDialogElement>('#demo-info')?.showModal()} className="hover:text-background transition-colors">Instagram</button>
          <button type="button" aria-haspopup="dialog" onClick={() => document.querySelector<HTMLDialogElement>('#demo-info')?.showModal()} className="hover:text-background transition-colors">Journal</button>
          <button type="button" aria-haspopup="dialog" onClick={() => document.querySelector<HTMLDialogElement>('#demo-info')?.showModal()} className="hover:text-background transition-colors">Legal</button>
        </div>
        <span className="text-xs text-muted-foreground/40">© 2026 Auralith · Portfolio concept</span>
      </div>
    </footer>
  );
}

export default function App() {
  useEffect(() => {
    const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    const handleClick = (event: MouseEvent) => {
      event.preventDefault();
      const targetId = (event.currentTarget as HTMLAnchorElement).getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    anchors.forEach(anchor => anchor.addEventListener('click', handleClick));
    return () => anchors.forEach(anchor => anchor.removeEventListener('click', handleClick));
  }, []);

  return (
    <div id="top" className="bg-background text-foreground min-h-screen font-sans selection:bg-foreground selection:text-background">
      <NavBar />
      <HeroSection />
      <ArchitectureSection />
      <AcousticLayersSection />
      <SignatureCollection />
      <InquirySection />
      <Footer />

      <dialog id="demo-info" aria-labelledby="demo-info-title" className="max-w-md rounded-2xl border border-white/20 bg-neutral-950 p-8 text-stone-100 shadow-2xl backdrop:bg-black/60">
        <h2 id="demo-info-title" className="text-xl font-medium mb-4">Portfolio concept</h2>
        <p className="text-sm leading-relaxed text-stone-300">This is a portfolio concept. Contact details are examples; no bookings, applications or messages are sent.</p>
        <form method="dialog" className="mt-6">
          <button className="rounded-full bg-white px-5 py-2 text-sm text-black">Close</button>
        </form>
      </dialog>
</div>
  );
}
