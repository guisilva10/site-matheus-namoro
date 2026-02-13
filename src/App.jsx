import { useEffect, useRef, useState, useMemo, memo } from "react";
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
    type: "image",
    src: "images/dia-28.jpeg",
    desc: "The day where it all began",
  });

  const audioRef = useRef(null);
  const heartParticlesRef = useRef(null);
  const mainAppRef = useRef(null);

  const moments = [
    {
      type: "image",
      src: "images/dia-28.jpeg",
      desc: "The day where it all began",
    },
    { type: "image", src: "images/07.jpeg", desc: "Our first kiss" },
    {
      type: "image",
      src: "images/08.jpeg",
      desc: "The day I met your mother and we laughed a lot, because I didn't understand anything",
    },
    {
      type: "image",
      src: "images/15.jpeg",
      desc: "The best turn of the year",
    },
    {
      type: "image",
      src: "images/10.jpeg",
      desc: "The day I felt a different kind of love vibe in the kiss",
    },
    {
      type: "image",
      src: "images/20.jpeg",
      desc: "MODO QUEBRADEIRA ONLINE in the car",
    },
    {
      type: "image",
      src: "images/22.jpeg",
      desc: "Our first sunset of the year",
    },
    {
      type: "image",
      src: "images/26.jpeg",
      desc: "When we took a beer bath and we continued in the best vibe",
    },
    {
      type: "image",
      src: "images/27.jpeg",
      desc: "Last kiss that made me want even more",
    },
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

    // Wait for the main reveal transition to finish before calculating scroll points
    setTimeout(() => {
      initScrollAnimations();
      initHeartBackground();
      ScrollTrigger.refresh();
    }, 1100);
  };

  const initScrollAnimations = () => {
    // Refresh ScrollTrigger when everything is loaded
    window.addEventListener("load", () => ScrollTrigger.refresh());

    const sections = document.querySelectorAll(".reveal-section");
    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 30, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 88%",
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
              Pour ma princesse
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
          <div className="glass p-12 rounded-[3rem] text-center border-t border-l border-white/20 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-romantic-500/10 blur-3xl group-hover:bg-romantic-500/20 transition-all" />
            <Quote className="text-romantic-400 w-12 h-12 mx-auto mb-8 opacity-50" />
            <p className="text-xl md:text-2xl leading-relaxed text-romantic-50 italic indie-flower">
              "I made this website because I needed a place to put everything
              we’ve lived. Our moments, our laughs, where it all started… our
              story, our way. I’ve never really been the romantic type, you know
              that. I’ve never done something like this for anyone. But you
              brought that side out of me in a way I didn’t even know existed.
              And for that to happen, it can only mean one thing — we really
              match. Our vibe is infinite. Too good. Every detail here was made
              with love. Thinking about our energy, the way everything happened
              so naturally but so intensely at the same time. I’m truly grateful
              for every moment, every exchange, every connection we’ve built.
              And I know you’re smiling while reading this… because I wrote it
              smiling too. And this is just the beginning… because I still want
              to fill this site with new stories, more of our moments. I want it
              to feel like a frame hanging in the living room of our story —
              something we look at and say, “damn, look at everything we’ve
              already lived”… and laugh about the behind-the-scenes stuff. Haha.
              Even from far away, I want you to enjoy this Valentine’s Day with
              a smile on your face. Live it like I’m right there with you —
              because in some way, I always am. And you know that. I would
              travel the world just to live this vibe by your side. Feel the
              energy of every country, every city, in our own crazy way.
              Creating memories, collecting stories, living everything
              intensely. Because when I’m with you, anywhere becomes our own
              adventure. I know sometimes I’m a little crazy, hyped, sending too
              many messages… but with you it’s different. I actually want to.
              The energy is too good to stay quiet. I’m out here feeling like
              the last romantic alive, but it’s cool… you did that to me. I did
              all of this from the heart. I hope you feel it in every detail.
              Because what we have isn’t normal. It’s rare energy. It’s real
              connection. And this… is just the beginning of our story. ❤️♾️ And
              of course… our dangerous little way of committing “crimes” out
              there. But those… we solve in person. Sometimes 👀👀"
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

          <div className="space-y-8">
            <div className="glass rounded-[2.5rem] overflow-hidden aspect-[3/4] md:aspect-video relative group border-2 border-white/10 reveal-section shadow-2xl mx-auto max-w-sm md:max-w-4xl">
              {currentMoment.type === "video" ? (
                <video
                  src={currentMoment.src}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                />
              ) : (
                <img
                  src={currentMoment.src}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                <p className="text-2xl font-semibold italic text-romantic-100">
                  {currentMoment.desc || "Notre vibe"}
                </p>
              </div>
            </div>
            <div className="flex justify-start md:justify-center gap-4 overflow-x-auto pb-6 px-2 no-scrollbar reveal-section">
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
                  {m.type === "video" ? (
                    <>
                      <video
                        src={m.src}
                        className="w-full h-full object-cover pointer-events-none"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="w-8 h-8 text-white opacity-80" />
                      </div>
                    </>
                  ) : (
                    <img
                      src={m.src}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  )}
                </button>
              ))}
            </div>
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
                desc="The day where it all began"
                media={[{ type: "image", src: "images/dia-28.jpeg" }]}
                icon={<InfinityIcon className="w-6 h-6 md:w-8 md:h-8" />}
              />
              <TimelineEvent
                side="right"
                date="30 décembre 2025"
                title="Nos moments"
                desc="Our First kiss"
                media={[{ type: "video", src: "videos/dia-30.MOV" }]}
                icon={<InfinityIcon className="w-6 h-6 md:w-8 md:h-8" />}
              />
              <TimelineEvent
                date="31 décembre 2025"
                title="Nouvel An"
                desc="The best turn of the year"
                media={[{ type: "video", src: "videos/dia-31.mov" }]}
                icon={<InfinityIcon className="w-6 h-6 md:w-8 md:h-8" />}
              />
              <TimelineEvent
                side="right"
                date="01 Janvier 2026"
                title="Premier Jour"
                desc="Our first sunset of the year"
                media={[{ type: "video", src: "videos/dia-01/01.mov" }]}
                icon={<InfinityIcon className="w-6 h-6 md:w-8 md:h-8" />}
              />
              <TimelineEvent
                date="02 Janvier 2026"
                title="Aventures d'été"
                desc="When I almost crashed the car, with us kissing"
                media={[
                  { type: "video", src: "videos/dia-02/01.MOV" },
                  { type: "video", src: "videos/dia-02/02.MOV" },
                  { type: "video", src: "videos/dia-02/03.MOV" },
                  { type: "video", src: "videos/dia-02/04.mov" },
                  { type: "video", src: "videos/dia-02/05.MOV" },
                  { type: "video", src: "videos/dia-02/06.MOV" },
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
            </div>
          </div>

          <div className="mt-40 text-center px-6 pb-20 reveal-section">
            <h3 className="text-3xl md:text-5xl dancing-script text-romantic-300">
              "Made with love, care, and that energy only we have — for my
              French girl."
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

const VideoItem = memo(({ src }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;
        if (entry.isIntersecting) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      },
      { threshold: 0.1 },
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div className="w-full h-full bg-romantic-900/20">
      <video
        key={src}
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        preload="auto"
        onLoadedMetadata={() => ScrollTrigger.refresh()}
        className="w-full h-full object-cover"
      />
    </div>
  );
});

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
