import { useEffect, useRef, useState } from "react";

export default function OpeningScreen({ onEnter }) {
  const canvasRef = useRef(null);
  const [isBtnVisible, setIsBtnVisible] = useState(false);
  const [startTransition, setStartTransition] = useState(false);

  // --- CANVAS ANIMATION ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let shootingTimer;
    let btnTimer;

    // Arrays & Config
    const stars = [];
    const shootingStars = [];
    const fallingElements = [];
    const phrases = [
      "Ma Girl",
      "My Princess",
      "Ma sirène",
      "Ma voie",
      "Paty carioca",
      "girl from rio",
      "I love u",
      "Always Us",
      "Vibe Infinita",
    ];

    // Preload Images
    const heartImgs = [
      "/images/25.jpeg",
      "/images/08.jpeg",
      "/images/15.jpeg",
      "/images/22.jpeg",
      "/images/27.jpeg",
    ].map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
    const starImgNode = new Image();
    starImgNode.src =
      "https://png.pngtree.com/png-vector/20220619/ourmid/pngtree-sparkling-star-vector-icon-glitter-star-shape-png-image_5228522.png";

    const textColorsCycle = [
      "#FFD700",
      "#FFA500",
      "#ADFF2F",
      "#00FFFF",
      "#FF69B4",
      "#FFFFFF",
      "#9932CC",
    ];
    let currentColorIndex = 0;
    let nextColorIndex = 1;
    let transitionProgress = 0;
    const transitionSpeed = 0.005;
    const focalLength = 300;

    // Color Interpolation Helper
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

    const resize = () => {
      if (!canvas) return;
      // Optimize for mobile - use lower DPR for better performance
      const isMobile = window.innerWidth < 768;
      const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);

      stars.length = 0;
      // Reduce star count significantly on mobile
      const starCount = isMobile ? 40 : 100;
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          radius: Math.random() * 1.5 + 0.5,
          alpha: Math.random(),
          delta: Math.random() * 0.02 + 0.005,
        });
      }
    };

    const createShootingStar = () => {
      shootingStars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * (window.innerHeight / 2),
        length: Math.random() * 200 + 100,
        speed: Math.random() * 12 + 6,
        angle: Math.PI / 4,
        opacity: 1,
      });
    };

    const createFallingElement = () => {
      const isMobile = window.innerWidth < 768;
      const rand = Math.random();
      // Mais destaque para imagens: 45% frases, 35% fotos, 20% estrelas
      const type = rand < 0.45 ? "phrase" : rand < 0.8 ? "heart" : "image";
      const minZ = focalLength * 1.5;
      const maxZ = focalLength * 5;
      const z = minZ + Math.random() * (maxZ - minZ);
      const worldW = (window.innerWidth / focalLength) * maxZ;
      const worldH = (window.innerHeight / focalLength) * maxZ;

      let content,
        baseSize = isMobile ? 25 : 30;
      if (type === "phrase") {
        content = phrases[Math.floor(Math.random() * phrases.length)];
        baseSize = isMobile ? 25 : 30;
      } else if (type === "heart") {
        content = heartImgs[Math.floor(Math.random() * heartImgs.length)];
        // Imagens ainda maiores e com mais destaque
        baseSize = isMobile ? 60 : 90;
      } else {
        content = starImgNode;
        baseSize = isMobile ? 45 : 65;
      }

      fallingElements.push({
        type,
        content,
        z,
        baseSize,
        // Mais centralizado - reduzindo o spread
        x: (Math.random() - 0.5) * worldW * 0.9,
        y: (Math.random() - 0.5) * worldH * 0.9,
        speedZ: Math.random() * (isMobile ? 1.5 : 2) + 1,
      });
    };

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Background
      ctx.fillStyle = "#1f050a";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // Stars
      stars.forEach((s) => {
        s.alpha += s.delta;
        if (s.alpha <= 0 || s.alpha >= 1) s.delta *= -1;
        ctx.save();
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Shooting stars
      ctx.lineWidth = 2;
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        const endX = s.x - Math.cos(s.angle) * s.length;
        const endY = s.y - Math.sin(s.angle) * s.length;

        const grad = ctx.createLinearGradient(s.x, s.y, endX, endY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${Math.max(0, s.opacity)})`);
        grad.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.opacity -= 0.02;
        if (s.opacity <= 0) shootingStars.splice(i, 1);
      }

      // Falling elements
      const color = interpolateColor(
        textColorsCycle[currentColorIndex],
        textColorsCycle[nextColorIndex],
        transitionProgress,
      );

      // Batch text settings to avoid context switching
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = fallingElements.length - 1; i >= 0; i--) {
        const el = fallingElements[i];
        el.z -= el.speedZ;
        if (el.z <= 0) {
          fallingElements.splice(i, 1);
          createFallingElement();
          continue;
        }

        const scale = focalLength / el.z;
        const size = el.baseSize * scale;
        const x = el.x * scale + window.innerWidth / 2;
        const y = el.y * scale + window.innerHeight / 2;

        if (
          x < -size ||
          x > window.innerWidth + size ||
          y < -size ||
          y > window.innerHeight + size
        ) {
          if (el.z > focalLength) {
            fallingElements.splice(i, 1);
            createFallingElement();
            continue;
          }
        }

        // Imagens com muito mais destaque
        const opacity =
          el.type === "phrase"
            ? Math.max(0, Math.min(1, scale * 1.1))
            : Math.max(0, Math.min(1, scale * 1.8));

        ctx.globalAlpha = opacity;

        if (el.type === "phrase") {
          ctx.fillStyle = color;
          ctx.font = `bold ${Math.max(12, size)}px 'Dancing Script', cursive`;
          // Removed heavy shadowBlur for performance
          ctx.shadowColor = color;
          ctx.shadowBlur = 0;
          ctx.fillText(el.content, x, y);
        } else if (
          el.content &&
          el.content.complete &&
          el.content.naturalWidth > 0
        ) {
          try {
            // Adicionar sombra para destaque
            ctx.shadowColor = "rgba(244, 63, 94, 0.4)";
            ctx.shadowBlur = size * 0.2;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // Adicionar bordas arredondadas nas imagens
            ctx.save();
            ctx.beginPath();
            const radius = size * 0.15;
            ctx.roundRect(x - size / 2, y - size / 2, size, size, radius);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(el.content, x - size / 2, y - size / 2, size, size);
            ctx.restore();

            // Resetar sombra
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
          } catch (e) {}
        }
      }
      ctx.globalAlpha = 1;

      transitionProgress += transitionSpeed;
      if (transitionProgress >= 1) {
        transitionProgress = 0;
        currentColorIndex = nextColorIndex;
        nextColorIndex = (nextColorIndex + 1) % textColorsCycle.length;
      }

      animationId = requestAnimationFrame(draw);
    };

    // Init
    resize();
    window.addEventListener("resize", resize);
    // Mais elementos iniciais
    const isMobile = window.innerWidth < 768;
    const elementCount = isMobile ? 30 : 50;
    for (let i = 0; i < elementCount; i++) createFallingElement();
    shootingTimer = setInterval(createShootingStar, isMobile ? 1500 : 900);

    // Criar novos elementos continuamente para manter a tela cheia
    const fallingTimer = setInterval(
      createFallingElement,
      isMobile ? 150 : 100,
    );

    draw();

    // Show button after 3s
    btnTimer = setTimeout(() => setIsBtnVisible(true), 3000);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      clearInterval(shootingTimer);
      clearInterval(fallingTimer);
      clearTimeout(btnTimer);
    };
  }, []); // Empty dependency array: Run once on mount

  const handleButtonClick = () => {
    setStartTransition(true);
    setTimeout(() => {
      onEnter();
    }, 1000); // Wait for CSS transition
  };

  // Styles ensuring visibility
  const canvasStyle = {
    opacity: startTransition ? 0 : 1,
    transform: startTransition ? "scale(1.2)" : "scale(1)",
    transition: "opacity 1s ease, transform 1s ease",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 100,
    pointerEvents: "none",
  };

  const btnStyle = {
    opacity: isBtnVisible && !startTransition ? 1 : 0,
    pointerEvents: isBtnVisible && !startTransition ? "auto" : "none",
    transition: "all 0.8s ease",
    zIndex: 101,
  };

  return (
    <>
      <canvas ref={canvasRef} style={canvasStyle} />
      <button
        id="enter-btn"
        className="fixed bottom-[15%] left-1/2 -translate-x-1/2 px-10 py-4 bg-romantic-500 text-white rounded-full font-semibold shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:scale-110 hover:shadow-[0_0_30px_rgba(244,63,94,0.6)]"
        style={btnStyle}
        onClick={handleButtonClick}
      >
        Cliquez pour entrer ❤️
      </button>
    </>
  );
}
