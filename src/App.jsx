import { useEffect, useRef, useState, useMemo } from "react";
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
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import OpeningScreen from "./OpeningScreen";

// Helper for tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentMoment, setCurrentMoment] = useState({
    src: "2.png",
    desc: "Cuisiner dans notre maison",
  });

  const audioRef = useRef(null);
  const heartParticlesRef = useRef(null);
  const mainAppRef = useRef(null);

  const moments = [
    { type: "image", src: "/images/06.jpeg" },
    { type: "video", src: "/videos/02.MOV" },
    { type: "image", src: "/images/07.jpeg" },
    { type: "video", src: "/videos/03.MOV" },
    { type: "image", src: "/images/08.jpeg" },
    { type: "video", src: "/videos/04.MOV" },
    { type: "image", src: "/images/09.jpeg" },
    { type: "video", src: "/videos/05.MOV" },
    { type: "image", src: "/images/10.jpeg" },
    { type: "video", src: "/videos/11.MOV" },
    { type: "image", src: "/images/15.jpeg" },
    { type: "video", src: "/videos/12.MOV" },
    { type: "image", src: "/images/16.JPEG" },
    { type: "video", src: "/videos/13.MOV" },
    { type: "image", src: "/images/17.PNG" },
    { type: "video", src: "/videos/14.MOV" },
    { type: "image", src: "/images/18.jpeg" },
    { type: "video", src: "/videos/16.mov" },
    { type: "image", src: "/images/19.jpeg" },
    { type: "image", src: "/images/20.jpeg" },
    { type: "image", src: "/images/22.jpeg" },
    { type: "image", src: "/images/23.jpeg" },
    { type: "image", src: "/images/24.jpeg" },
    { type: "image", src: "/images/25.jpeg" },
  ];

  // --- HELPERS ---
  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  };

  const interpolateColor = (color1, color2, factor) => {
    const [r1, g1, b1] = hexToRgb(color1);
    const [r2, g2, b2] = hexToRgb(color2);
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
    return `rgb(${r}, ${g}, ${b})`;
  };

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
  const handleEnter = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    setHasEntered(true);
    window.scrollTo(0, 0);
    document.body.style.overflowY = "auto";

    setTimeout(() => {
      initScrollAnimations();
      initHeartBackground();
    }, 500);
  };

  const initScrollAnimations = () => {
    const sections = document.querySelectorAll(".reveal-section");
    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 50, scale: 0.95, autoAlpha: 0 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );
    });
  };

  const initHeartBackground = () => {
    const container = heartParticlesRef.current;
    if (!container) return;
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
      container.appendChild(p);
      setTimeout(() => p.remove(), dur * 1000);
    };

    setInterval(createParticle, 500);
    for (let i = 0; i < 20; i++)
      setTimeout(createParticle, Math.random() * 5000);
  };

  const toggleMusic = () => {
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const shakeElement = (e) => {
    const el = e.currentTarget;
    el.classList.add("shake");
    setTimeout(() => el.classList.remove("shake"), 500);
  };

  return (
    <div className="relative min-h-screen">
      <audio ref={audioRef} src="/music.mp3" loop />

      {/* Opening Screen */}
      {!hasEntered && <OpeningScreen onEnter={handleEnter} />}

      {/* Heart Background */}
      <div ref={heartParticlesRef} className="heart-bg" />

      {/* Main App */}
      <main
        id="main-app"
        ref={mainAppRef}
        className={cn("main-content relative z-10", hasEntered && "active")}
      >
        {/* Section: Hero */}
        <section
          id="hero"
          className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8 reveal-section"
        >
          <div className="space-y-4 animate-float">
            <Heart className="w-16 h-16 text-romantic-500 mx-auto fill-current" />
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
              Para minha Princesa
            </h1>
            <p className="text-xl md:text-2xl text-romantic-200 dancing-script">
              Depuis le début de notre amour
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-2xl px-2">
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
          </div>
        </section>

        {/* Section: Music */}
        <section id="music" className="py-20 px-6 max-w-4xl mx-auto">
          <div className="glass p-8 md:p-12 rounded-[3rem] relative overflow-hidden group reveal-section">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-romantic-500/10 blur-3xl group-hover:bg-romantic-500/20 transition-all"></div>
            <Music className="text-romantic-400 w-12 h-12 mx-auto mb-8 opacity-50" />
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Notre Chanson
            </h3>
            <p className="text-romantic-100 opacity-80 mb-6">
              Future - WAIT FOR U (ft. Drake & Tems)
            </p>
            <div className="flex justify-center">
              <div className="w-full bg-white/5 p-6 rounded-2xl flex items-center justify-between border border-white/10 group-hover:border-romantic-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-romantic-500 rounded-full flex items-center justify-center animate-spin-slow">
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
          </div>
        </section>

        {/* Section: Quote */}
        <section id="quote" className="py-20 px-6 max-w-3xl mx-auto">
          <div className="glass p-12 rounded-[3rem] text-center border-t border-l border-white/20 relative overflow-hidden group reveal-section">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-romantic-500/10 blur-3xl group-hover:bg-romantic-500/20 transition-all" />
            <Quote className="text-romantic-400 w-12 h-12 mx-auto mb-8 opacity-50" />
            <p className="text-xl md:text-2xl leading-relaxed text-romantic-50 italic indie-flower">
              "Je t'aime d'une manière que les mots ne peuvent exprimer, mais
              j'essaie quand même..."
            </p>
          </div>
        </section>

        {/* Section: Moments */}
        <section
          id="moments"
          className="py-20 px-6 max-w-full mx-auto text-center overflow-hidden"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-8 inline-block relative text-white dancing-script reveal-section">
            Notre vibe infinie
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-romantic-500 to-transparent" />
          </h2>
          <p className="text-romantic-300 mb-12 text-lg reveal-section">
            <span>{timeLeft.d}</span> jours de pur bonheur ✨
          </p>

          <div className="flex gap-6 overflow-x-auto pb-12 px-6 snap-x snap-mandatory no-scrollbar reveal-section">
            {moments.map((m, i) => (
              <div
                key={i}
                className="flex-shrink-0 snap-center relative w-72 h-[28rem] md:w-80 md:h-[32rem] rounded-[2rem] overflow-hidden glass border border-white/10 group"
              >
                {m.type === "video" ? (
                  <VideoItem src={m.src} />
                ) : (
                  <img
                    src={m.src}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section: History */}
        <section id="history" className="py-20 px-6 max-w-4xl mx-auto pb-40">
          <div className="text-center mb-28 space-y-4">
            <Clock className="w-10 h-10 text-romantic-400 mx-auto mb-4" />
            <h2 className="text-5xl font-bold text-white">Notre Histoire</h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 md:left-1/2 -ml-[1px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-romantic-500/0 via-romantic-500/50 to-romantic-500/0" />
            <div className="space-y-40">
              <TimelineEvent
                date="28 décembre 2025"
                title="Le début de tout"
                desc="Demande d'être ensemble"
                media={[{ type: "image", src: "/dia-28.jpeg" }]}
                icon={<InfinityIcon className="w-6 h-6 md:w-8 md:h-8" />}
              />
              <TimelineEvent
                side="right"
                date="30 décembre 2025"
                title="Nos moments"
                desc="Une journée inoubliable"
                media={[{ type: "video", src: "/videos/dia-30.MOV" }]}
                icon={<Heart className="w-6 h-6 md:w-8 md:h-8" />}
              />
              <TimelineEvent
                date="31 décembre 2025"
                title="Nouvel An"
                desc="Prêts pour 2026"
                media={[{ type: "video", src: "/videos/dia-31.mov" }]}
                icon={<Quote className="w-6 h-6 md:w-8 md:h-8" />}
              />
              <TimelineEvent
                side="right"
                date="01 Janvier 2026"
                title="Premier Jour"
                desc="Le début d'une nouvelle ère"
                media={[{ type: "video", src: "/videos/dia-01/01.mov" }]}
                icon={<InfinityIcon className="w-6 h-6 md:w-8 md:h-8" />}
              />
              <TimelineEvent
                date="02 Janvier 2026"
                title="Aventures d'été"
                desc="Plage, soleil et nous"
                media={[
                  { type: "video", src: "/videos/dia-02/01.MOV" },
                  { type: "video", src: "/videos/dia-02/02.MOV" },
                  { type: "video", src: "/videos/dia-02/03.MOV" },
                  { type: "video", src: "/videos/dia-02/04.mov" },
                  { type: "video", src: "/videos/dia-02/05.MOV" },
                  { type: "video", src: "/videos/dia-02/06.MOV" },
                ]}
                icon={<Heart className="w-6 h-6 md:w-8 md:h-8" />}
              />
            </div>
          </div>

          <div className="mt-40 text-center px-6 pb-20 reveal-section">
            <h3 className="text-3xl md:text-5xl dancing-script text-romantic-300">
              "Mon amour pour toi n'a pas de fin, il dépasse le temps et
              l'espace."
            </h3>
          </div>

          <footer className="text-center py-20 text-romantic-300 opacity-50 text-sm border-t border-white/5 mx-6">
            <p>Créé avec amour pour ma princesse ❤️</p>
            <p className="mt-2 text-xs opacity-70">
              2026 &bull; Toujours Ensemble
            </p>
          </footer>
        </section>
      </main>
    </div>
  );
}

function VideoItem({ src }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      },
      { threshold: 0.5 },
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      loop
      playsInline
      className="w-full h-full object-cover"
    />
  );
}

function TimelineEvent({
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

  return (
    <div
      className={cn(
        "relative flex items-center justify-between w-full reveal-section",
        !isLeft && "md:flex-row-reverse",
      )}
      onClick={locked ? onShake : undefined}
    >
      <div
        className={cn(
          "w-full md:w-[45%] ml-16 md:ml-0 glass p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] relative group transition-all text-white",
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
            <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth">
              {media.map((item, i) => (
                <div
                  key={i}
                  className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center bg-black"
                >
                  {item.type === "video" ? (
                    <VideoItem src={item.src} />
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

            {/* Indicators (only if multiple) */}
            {media.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {media.map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-white/50"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="hidden md:block w-[45%]" />
    </div>
  );
}
