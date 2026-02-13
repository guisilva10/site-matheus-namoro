import { useEffect, useRef, useState, memo, useMemo, useCallback } from "react";
import {
  Infinity as InfinityIcon,
  Heart,
  Clock,
  Lock,
  Music,
  Quote,
  Play,
  Pause,
  Disc,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import OpeningScreen from "./OpeningScreen";
import { createVideoMedia } from "./videoUrls";

// Helper for tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentMoment, setCurrentMoment] = useState({
    type: "image",
    src: "/images/dia-28.jpeg",
    desc: "The day where it all began",
  });

  const audioRef = useRef(null);
  const heartParticlesRef = useRef(null);
  const mainAppRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Optimized animation variants using only GPU-accelerated properties
  const fadeInUpVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 30 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: shouldReduceMotion ? 0 : 0.3, ease: "easeOut" },
      },
    }),
    [shouldReduceMotion],
  );

  const scaleInVariants = useMemo(
    () => ({
      hidden: { opacity: 0, scale: 0.95 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: shouldReduceMotion ? 0 : 0.3, ease: "easeOut" },
      },
    }),
    [shouldReduceMotion],
  );

  const moments = useMemo(
    () => [
      {
        type: "image",
        src: "/images/dia-28.jpeg",
        desc: "The day where it all began",
      },
      { type: "image", src: "/images/07.jpeg", desc: "Our first kiss" },
      {
        type: "image",
        src: "/images/08.jpeg",
        desc: "The day I met your mother and we laughed a lot, because I didn't understand anything",
      },
      {
        type: "image",
        src: "/images/15.jpeg",
        desc: "The best turn of the year",
      },
      {
        type: "image",
        src: "/images/10.jpeg",
        desc: "The day I felt a different kind of love vibe in the kiss",
      },
      {
        type: "image",
        src: "/images/20.jpeg",
        desc: "MODO QUEBRADEIRA ONLINE in the car",
      },
      {
        type: "image",
        src: "/images/22.jpeg",
        desc: "Our first sunset of the year",
      },
      {
        type: "image",
        src: "/images/26.jpeg",
        desc: "When we took a beer bath and we continued in the best vibe",
      },
      {
        type: "image",
        src: "/images/27.jpeg",
        desc: "Last kiss that made me want even more",
      },
    ],
    [],
  );

  // Pré-carregar todas as imagens ao montar o componente
  useEffect(() => {
    const imagesToLoad = moments.map((m) => m.src);
    let loadedCount = 0;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === imagesToLoad.length) {
        setIsReady(true);
      }
    };

    imagesToLoad.forEach((src) => {
      const img = new Image();
      img.onload = checkAllLoaded;
      img.onerror = checkAllLoaded; // Continue mesmo se houver erro
      img.src = src;
    });
  }, [moments]);

  // --- COUNTDOWN LOGIC ---
  const [timeLeft, setTimeLeft] = useState({
    d: "00",
    h: "00",
    m: "00",
    s: "00",
  });
  useEffect(() => {
    const updateCountdown = () => {
      const startDate = new Date("2025-12-28T14:30:00");
      const now = new Date();
      const diff = now.getTime() - startDate.getTime();

      if (diff <= 0) return;

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        d: d.toString().padStart(2, "0"),
        h: h.toString().padStart(2, "0"),
        m: m.toString().padStart(2, "0"),
        s: s.toString().padStart(2, "0"),
      });
    };
    const timer = setInterval(updateCountdown, 1000);
    updateCountdown();
    return () => clearInterval(timer);
  }, []);

  // --- MAIN APP REVEAL ---
  const initHeartBackground = useCallback(() => {
    const container = heartParticlesRef.current;
    if (!container) return;

    // Reduce particles on mobile
    const isMobile = window.innerWidth < 768;
    if (shouldReduceMotion) return; // Skip animations if user prefers reduced motion

    const symbols = ["❤️", "💖", "💗", "💓", "💕", "∞", "∞"];

    const createParticle = () => {
      const p = document.createElement("div");
      p.className = "heart-particle pointer-events-none select-none";
      p.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];
      p.style.left = Math.random() * 100 + "vw";
      const isInf = p.innerHTML === "∞";
      p.style.fontSize =
        (isInf ? Math.random() * 30 + 20 : Math.random() * 20 + 10) + "px";
      const dur = Math.random() * 7 + 6;
      p.style.animationDuration = dur + "s";
      p.style.opacity = (Math.random() * 0.4 + 0.2).toString();
      p.style.willChange = "transform";
      container.appendChild(p);
      setTimeout(() => p.remove(), dur * 1000);
    };

    // Reduced frequency and count for better performance, especially on mobile
    const interval = isMobile ? 1500 : 800;
    const initialCount = isMobile ? 8 : 15;

    setInterval(createParticle, interval);
    for (let i = 0; i < initialCount; i++)
      setTimeout(createParticle, Math.random() * 5000);
  }, [shouldReduceMotion]);

  const handleEnter = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    setHasEntered(true);
    window.scrollTo(0, 0);
    document.body.style.overflowY = "auto";
    initHeartBackground();
  }, [initHeartBackground]);

  const toggleMusic = useCallback(() => {
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const shakeElement = useCallback((e) => {
    const el = e.currentTarget;
    el.classList.add("shake");
    setTimeout(() => el.classList.remove("shake"), 500);
  }, []);

  return (
    <div className="relative min-h-screen">
      <audio ref={audioRef} src="music.mp3" loop />

      {/* Opening Screen */}
      <AnimatePresence>
        {!hasEntered && (
          <motion.div
            key="opening"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[100]"
          >
            <OpeningScreen onEnter={handleEnter} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Heart Background */}
      <div ref={heartParticlesRef} className="heart-bg" />

      {/* Main App */}
      <AnimatePresence>
        {hasEntered && isReady && (
          <motion.main
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            id="main-app"
            ref={mainAppRef}
            className="main-content active relative"
            style={{ zIndex: 1 }}
          >
            {/* Section: Hero */}
            <section
              id="hero"
              className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-4 animate-float"
              >
                <Heart className="w-16 h-16 text-romantic-500 mx-auto fill-current" />
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
                  Pour ma princesse
                </h1>
                <p className="text-xl md:text-2xl text-romantic-200 dancing-script">
                  Depuis le début de notre amour
                </p>
              </motion.div>

              <motion.div
                variants={fadeInUpVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-2xl px-2"
              >
                {[
                  { val: timeLeft.d, label: "Jours" },
                  { val: timeLeft.h, label: "Heures" },
                  { val: timeLeft.m, label: "Minutes" },
                  { val: timeLeft.s, label: "Secondes" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="glass p-4 md:p-6 rounded-2xl md:rounded-3xl"
                  >
                    <span className="text-3xl md:text-4xl font-bold">
                      {item.val}
                    </span>
                    <p className="text-[10px] md:text-sm text-romantic-300 uppercase mt-1 md:mt-2">
                      {item.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            </section>

            {/* Section: Music */}
            <section id="music" className="py-20 px-6 max-w-4xl mx-auto">
              <motion.div
                variants={fadeInUpVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="glass p-8 md:p-12 rounded-[3rem] relative"
              >
                <Music className="text-romantic-400 w-12 h-12 mx-auto mb-8 opacity-50" />
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Notre Chanson
                </h3>
                <p className="text-romantic-100 opacity-80 mb-6">
                  Future - WAIT FOR U (ft. Drake & Tems)
                </p>
                <div className="flex justify-center">
                  <div className="w-full bg-white/5 p-6 rounded-2xl flex items-center justify-between border border-white/10 hover:border-romantic-500/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 bg-romantic-500 rounded-full flex items-center justify-center animate-spin-slow"
                        style={{ willChange: "transform" }}
                      >
                        <Disc className="text-white w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-white">WAIT FOR U</p>
                        <p className="text-xs text-romantic-300">
                          Future ft. Drake & Tems
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={toggleMusic}
                      className="w-12 h-12 bg-romantic-500/20 hover:bg-romantic-500/40 rounded-full flex items-center justify-center transition-all"
                    >
                      {isPlaying ? (
                        <Pause className="text-white w-6 h-6 fill-current" />
                      ) : (
                        <Play className="text-white w-6 h-6 fill-current" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section: Quote */}
            <section id="quote" className="py-20 px-6 max-w-3xl mx-auto">
              <div className="glass p-12 rounded-[3rem] text-center border-t border-l border-white/20 relative">
                <Quote className="text-romantic-400 w-12 h-12 mx-auto mb-8 opacity-50" />
                <p className="text-xl md:text-2xl leading-relaxed text-romantic-50 italic indie-flower">
                  "I made this website because I needed a place to put
                  everything we've lived. Our moments, our laughs, where it all
                  started… our story, our way. I've never really been the
                  romantic type, you know that. I've never done something like
                  this for anyone. But you brought that side out of me in a way
                  I didn't even know existed. And for that to happen, it can
                  only mean one thing — we really match. Our vibe is infinite.
                  Too good. Every detail here was made with love. Thinking about
                  our energy, the way everything happened so naturally but so
                  intensely at the same time. I'm truly grateful for every
                  moment, every exchange, every connection we've built. And I
                  know you're smiling while reading this… because I wrote it
                  smiling too. And this is just the beginning… because I still
                  want to fill this site with new stories, more of our moments.
                  I want it to feel like a frame hanging in the living room of
                  our story — something we look at and say, "damn, look at
                  everything we've already lived"… and laugh about the
                  behind-the-scenes stuff. Haha. Even from far away, I want you
                  to enjoy this Valentine's Day with a smile on your face. Live
                  it like I'm right there with you — because in some way, I
                  always am. And you know that. I would travel the world just to
                  live this vibe by your side. Feel the energy of every country,
                  every city, in our own crazy way. Creating memories,
                  collecting stories, living everything intensely. Because when
                  I'm with you, anywhere becomes our own adventure. I know
                  sometimes I'm a little crazy, hyped, sending too many
                  messages… but with you it's different. I actually want to. The
                  energy is too good to stay quiet. I'm out here feeling like
                  the last romantic alive, but it's cool… you did that to me. I
                  did all of this from the heart. I hope you feel it in every
                  detail. Because what we have isn't normal. It's rare energy.
                  It's real connection. And this… is just the beginning of our
                  story. ❤️♾️ And of course… our dangerous little way of
                  committing "crimes" out there. But those… we solve in person.
                  Sometimes 👀👀"
                </p>
              </div>
            </section>

            {/* Section: Moments */}
            <section
              id="moments"
              className="py-20 px-6 max-w-full mx-auto text-center overflow-hidden"
            >
              <motion.h2
                variants={fadeInUpVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="text-3xl md:text-5xl font-bold mb-8 inline-block relative text-white dancing-script"
              >
                Notre vibe infinie
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-romantic-500 to-transparent" />
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-romantic-300 mb-12 text-lg"
              >
                <span>{timeLeft.d}</span> jours de pur bonheur ✨
              </motion.p>

              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px", amount: 0.2 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="glass rounded-[2.5rem] overflow-hidden aspect-[3/4] md:aspect-video relative group border-2 border-white/10 shadow-2xl mx-auto max-w-sm md:max-w-4xl"
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentMoment.src}
                      src={currentMoment.src}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                    <p className="text-2xl font-semibold italic text-romantic-100">
                      {currentMoment.desc || "Notre vibe"}
                    </p>
                  </div>

                  {/* Indicadores de navegação */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 pointer-events-auto">
                    {moments.map((m, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentMoment(m)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          currentMoment.src === m.src
                            ? "bg-romantic-500 w-8"
                            : "bg-white/50 hover:bg-white/70",
                        )}
                        aria-label={`Ver foto ${i + 1}`}
                      />
                    ))}
                  </div>
                </motion.div>
                <div className="flex justify-start md:justify-center gap-4 overflow-x-auto pb-6 px-2 no-scrollbar">
                  {moments.map((m, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentMoment(m)}
                      className={cn(
                        "flex-shrink-0 w-28 h-28 md:w-36 md:h-36 rounded-3xl overflow-hidden glass border-2 transition-all outline-none relative group",
                        currentMoment.src === m.src
                          ? "border-romantic-500 scale-105"
                          : "border-transparent opacity-70 hover:opacity-100",
                      )}
                    >
                      <img
                        src={m.src}
                        className="w-full h-full object-cover pointer-events-none"
                        loading="eager"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Section: History */}
            <section
              id="history"
              className="py-20 px-6 max-w-4xl mx-auto pb-40"
            >
              <motion.div
                variants={fadeInUpVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="text-center mb-28 space-y-4"
              >
                <Clock className="w-10 h-10 text-romantic-400 mx-auto mb-4" />
                <h2 className="text-5xl font-bold text-white">
                  Notre Histoire
                </h2>
              </motion.div>
              <div className="relative">
                <div className="absolute left-8 md:left-1/2 -ml-[1px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-romantic-500/0 via-romantic-500/50 to-romantic-500/0" />
                <div className="space-y-40">
                  <TimelineEvent
                    date="28 décembre 2025"
                    title="Le début de tout"
                    desc="The day where it all began"
                    media={[{ type: "image", src: "/images/dia-28.jpeg" }]}
                    icon={<InfinityIcon className="w-6 h-6 md:w-8 md:h-8" />}
                  />
                  <TimelineEvent
                    side="right"
                    date="30 décembre 2025"
                    title="Nos moments"
                    desc="Our First kiss"
                    media={[createVideoMedia("/videos/dia-30.mp4")]}
                    icon={<InfinityIcon className="w-6 h-6 md:w-8 md:h-8" />}
                  />
                  <TimelineEvent
                    date="31 décembre 2025"
                    title="Nouvel An"
                    desc="The best turn of the year"
                    media={[createVideoMedia("/videos/dia-31.mp4")]}
                    icon={<InfinityIcon className="w-6 h-6 md:w-8 md:h-8" />}
                  />
                  <TimelineEvent
                    side="right"
                    date="01 Janvier 2026"
                    title="Premier Jour"
                    desc="Our first sunset of the year"
                    media={[createVideoMedia("/videos/dia-01/01.mp4")]}
                    icon={<InfinityIcon className="w-6 h-6 md:w-8 md:h-8" />}
                  />
                  <TimelineEvent
                    date="02 Janvier 2026"
                    title="Aventures d'été"
                    desc="Our last moments together"
                    media={[
                      createVideoMedia("/videos/dia-02/01.mp4"),
                      createVideoMedia("/videos/dia-02/02.mp4"),
                      createVideoMedia("/videos/dia-02/03.mp4"),
                      createVideoMedia("/videos/dia-02/05.mp4"),
                      createVideoMedia("/videos/dia-02/06.mp4"),
                    ]}
                    icon={<InfinityIcon className="w-6 h-6 md:w-8 md:h-8" />}
                  />
                  <TimelineEvent
                    locked
                    side="right"
                    date="Mars 2026"
                    title="À venir"
                    desc="Bientôt..."
                    onShake={shakeElement}
                  />
                  <TimelineEvent
                    locked
                    date="Juillet 2026"
                    title="À venir"
                    desc="Un nouveau chapitre arrive..."
                    onShake={shakeElement}
                  />
                  <TimelineEvent
                    locked
                    side="right"
                    date="31 Décembre 2026"
                    title="À venir"
                    desc="Notre premier anniversaire ensemble..."
                    onShake={shakeElement}
                  />
                </div>
              </div>

              <motion.div
                variants={scaleInVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="mt-40 text-center px-6 pb-20"
              >
                <h3 className="text-3xl md:text-5xl dancing-script text-romantic-300">
                  "Made with love, care, and that energy only we have — for my
                  French girl."
                </h3>
              </motion.div>

              <footer className="text-center py-20 text-romantic-300 opacity-50 text-sm border-t border-white/5 mx-6">
                <p>Créé avec amour pour ma princesse ❤️</p>
                <p className="mt-2 text-xs opacity-70">
                  2026 &bull; Toujours Ensemble
                </p>
              </footer>
            </section>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}

const VideoItem = memo(
  ({ src, poster }) => {
    const videoRef = useRef(null);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Play video when visible
            video.play().catch(() => {});
          } else {
            // Pause when not visible
            video.pause();
          }
        },
        { threshold: 0.3, rootMargin: "50px" },
      );

      observer.observe(video);
      return () => observer.disconnect();
    }, []);

    const handleError = useCallback(() => {
      console.error("Video failed to load:", src);
      setHasError(true);
      setIsLoading(false);
    }, [src]);

    const handleLoadedData = useCallback(() => {
      setIsLoading(false);
      setHasError(false);
    }, []);

    if (hasError) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-romantic-900/50 to-black flex flex-col items-center justify-center p-6">
          <div className="text-romantic-300 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-romantic-500/20 flex items-center justify-center">
              <Play className="w-8 h-8 text-romantic-400" />
            </div>
            <p className="text-sm opacity-70">Vídeo indisponível</p>
            <p className="text-xs opacity-50 max-w-xs">
              Este momento está guardado em nossos corações ❤️
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full bg-black flex items-center justify-center relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="w-12 h-12 border-4 border-romantic-500/30 border-t-romantic-500 rounded-full animate-spin" />
          </div>
        )}
        <video
          key={src}
          ref={videoRef}
          muted
          loop
          playsInline
          preload="auto"
          poster={poster}
          className="w-full h-full object-cover"
          onError={handleError}
          onLoadedData={handleLoadedData}
          onCanPlay={handleLoadedData}
          src={src}
        >
          Seu navegador não suporta vídeos.
        </video>
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.src === nextProps.src,
);

const TimelineEvent = memo(function TimelineEvent({
  date,
  title,
  desc,
  media,
  icon,
  locked,
  onShake,
  side = "left",
}) {
  const isLeft = side === "left";
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Detectar qual item está visível durante o scroll
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || !media || media.length <= 1) return;

    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft;
      const itemWidth = carousel.offsetWidth;
      const index = Math.round(scrollLeft / itemWidth);
      setActiveIndex(index);
    };

    carousel.addEventListener("scroll", handleScroll);
    return () => carousel.removeEventListener("scroll", handleScroll);
  }, [media]);

  const scrollToIndex = useCallback((index) => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const itemWidth = carousel.offsetWidth;
    carousel.scrollTo({
      left: index * itemWidth,
      behavior: "smooth",
    });
    setActiveIndex(index);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "relative flex items-center justify-between w-full mb-20",
        !isLeft && "md:flex-row-reverse",
      )}
      onClick={locked ? onShake : undefined}
      style={{ willChange: locked ? "transform" : "auto" }}
    >
      <div
        className={cn(
          "w-[calc(100%-4rem)] md:w-[45%] ml-16 md:ml-0 glass p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] relative group transition-all text-white",
          locked && "opacity-50 grayscale cursor-not-allowed",
        )}
      >
        <div
          className={cn(
            "absolute top-8 -left-12 md:top-1/2 w-10 h-10 md:w-14 md:h-14 bg-romantic-900 border-2 border-romantic-500 rounded-full flex items-center justify-center z-20 md:-translate-y-1/2 shadow-[0_0_15px_#f43f5e]",
            isLeft
              ? "md:left-auto md:-right-6 md:translate-x-1/2"
              : "md:right-auto md:-left-6 md:-translate-x-1/2",
          )}
        >
          {locked ? (
            <Lock className="w-5 h-5 text-romantic-300" />
          ) : (
            <div className="text-romantic-500">{icon}</div>
          )}
        </div>
        <span className="text-romantic-400 font-semibold mb-2 block">
          {date}
        </span>
        <h3 className="text-xl md:text-2xl font-bold mb-4">{title}</h3>
        <p className="text-romantic-100 opacity-80 mb-6">{desc}</p>

        {/* Media Carousel */}
        {media && media.length > 0 && (
          <div className="rounded-xl md:rounded-2xl w-full h-80 md:h-96 shadow-2xl border border-white/10 overflow-hidden relative bg-black/50">
            <div
              ref={carouselRef}
              className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
            >
              {media.map((item, i) => (
                <div
                  key={i}
                  className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center bg-black"
                >
                  {item.type === "video" ? (
                    <VideoItem src={item.src} poster={item.poster} />
                  ) : (
                    <img
                      src={item.src}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Indicadores interativos (apenas se houver múltiplos itens) */}
            {media.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {media.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToIndex(i);
                    }}
                    className={cn(
                      "rounded-full transition-all",
                      activeIndex === i
                        ? "w-8 h-2 bg-romantic-500"
                        : "w-2 h-2 bg-white/50 hover:bg-white/70",
                    )}
                    aria-label={`Ver item ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="hidden md:block w-[45%]" />
    </motion.div>
  );
});
