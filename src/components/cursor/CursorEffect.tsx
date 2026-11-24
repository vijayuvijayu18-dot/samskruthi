import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  age: number;
  colorIndex: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface CursorConfig {
  coreRadius: number;
  haloRadius: number;
  haloHoverRadius: number;
  lerpFactor: number;
  maxTrailPoints: number;
  trailWidth: number;
  particleLimit: number;
  colors: string[];
}

const DEFAULT_CONFIG: CursorConfig = {
  coreRadius: 4,
  haloRadius: 20,
  haloHoverRadius: 36,
  lerpFactor: 0.16,
  maxTrailPoints: 24,
  trailWidth: 4.5,
  particleLimit: 35,
  colors: [
    '#f97316', // Saffron
    '#d4af37', // Antique Gold
    '#c85a32', // Terracotta
    '#ec4899', // Rose/Magenta
    '#7e22ce', // Purple
    '#0891b2', // Peacock Blue
    '#059669', // Emerald
  ],
};

export const CursorEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // 1. Accessibility & Device Checks
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const userReducedMotion = localStorage.getItem('samskruthi_reduced_motion') === 'true';

    if (!isFinePointer || prefersReducedMotion || userReducedMotion) {
      document.documentElement.classList.remove('custom-cursor-active');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Enable CSS class to hide default cursor
    document.documentElement.classList.add('custom-cursor-active');

    // 2. State & Coordinates
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let mouseX = -100;
    let mouseY = -100;
    let haloX = -100;
    let haloY = -100;
    let prevMouseX = -100;
    let prevMouseY = -100;
    let velocity = 0;
    let isMouseDown = false;
    let isHoveringInteractive = false;
    let currentCursorType: 'default' | 'link' | 'view' | 'drag' | 'text' | 'hide' = 'default';
    let cursorLabel = '';
    let currentScale = 1.0;
    let isTabVisible = true;
    let isIdle = true;
    let idleTimer: number | undefined;

    const trail: Point[] = [];
    const particles: Particle[] = [];
    let colorStep = 0;

    // 3. Event Listeners
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    const spawnParticles = (x: number, y: number, count: number, speedMultiplier = 1) => {
      if (particles.length > DEFAULT_CONFIG.particleLimit) return;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 2 + 0.5) * speedMultiplier;
        const color = DEFAULT_CONFIG.colors[Math.floor(Math.random() * DEFAULT_CONFIG.colors.length)];
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 2.5 + 1,
          color,
          alpha: 0.9,
          life: 0,
          maxLife: Math.random() * 25 + 15,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (haloX < 0) {
        haloX = mouseX;
        haloY = mouseY;
      }

      const dx = mouseX - prevMouseX;
      const dy = mouseY - prevMouseY;
      velocity = Math.sqrt(dx * dx + dy * dy);
      prevMouseX = mouseX;
      prevMouseY = mouseY;

      isIdle = false;
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        isIdle = true;
      }, 2000);

      // Add to ribbon trail
      colorStep = (colorStep + 0.1) % DEFAULT_CONFIG.colors.length;
      trail.push({
        x: mouseX,
        y: mouseY,
        age: 0,
        colorIndex: Math.floor(colorStep),
      });

      if (trail.length > DEFAULT_CONFIG.maxTrailPoints) {
        trail.shift();
      }

      // Sparkles on movement
      if (velocity > 8 && Math.random() > 0.4) {
        spawnParticles(mouseX, mouseY, 1, 0.8);
      }
    };

    const handleMouseDown = () => {
      isMouseDown = true;
      spawnParticles(mouseX, mouseY, 8, 2);
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const cursorTarget = target.closest('[data-cursor]') as HTMLElement | null;
      const isClickable = target.closest('a, button, [role="button"], input[type="submit"], input[type="button"], label');
      const isInput = target.closest('input, textarea, select, [contenteditable="true"]');
      const isImage = target.closest('img, figure, [data-gallery-item]');

      if (isInput) {
        currentCursorType = 'text';
        isHoveringInteractive = false;
        cursorLabel = '';
      } else if (cursorTarget) {
        const type = cursorTarget.getAttribute('data-cursor') || 'link';
        currentCursorType = type as any;
        cursorLabel = cursorTarget.getAttribute('data-cursor-label') || (type === 'view' ? 'View' : type === 'drag' ? 'Drag' : 'Explore');
        isHoveringInteractive = true;
      } else if (isImage) {
        currentCursorType = 'view';
        cursorLabel = 'View';
        isHoveringInteractive = true;
      } else if (isClickable) {
        currentCursorType = 'link';
        cursorLabel = '';
        isHoveringInteractive = true;
      } else {
        currentCursorType = 'default';
        cursorLabel = '';
        isHoveringInteractive = false;
      }
    };

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. Main Animation Loop
    let animationFrameId: number;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);

      if (!isTabVisible) return;
      if (isIdle && trail.length === 0 && particles.length === 0 && velocity === 0) {
        ctx.clearRect(0, 0, width, height);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth halo interpolation
      haloX += (mouseX - haloX) * DEFAULT_CONFIG.lerpFactor;
      haloY += (mouseY - haloY) * DEFAULT_CONFIG.lerpFactor;

      // Draw Ribbon Trail
      if (trail.length > 2 && currentCursorType !== 'text' && currentCursorType !== 'hide') {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 0; i < trail.length - 1; i++) {
          const pt1 = trail[i];
          const pt2 = trail[i + 1];
          pt1.age += 1;

          const progress = i / trail.length;
          const alpha = Math.max(0, progress * (1 - pt1.age / 40));
          const strokeWidth = DEFAULT_CONFIG.trailWidth * progress * (isMouseDown ? 0.6 : 1);

          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);
          ctx.lineTo(pt2.x, pt2.y);
          ctx.strokeStyle = DEFAULT_CONFIG.colors[pt1.colorIndex % DEFAULT_CONFIG.colors.length];
          ctx.globalAlpha = alpha * 0.75;
          ctx.lineWidth = strokeWidth;
          ctx.stroke();
        }
        ctx.restore();

        // Remove old points
        while (trail.length > 0 && trail[0].age > 35) {
          trail.shift();
        }
      }

      // Draw Particles
      if (particles.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.life++;
          const lifeProgress = 1 - p.life / p.maxLife;

          if (lifeProgress <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * lifeProgress, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * lifeProgress;
          ctx.fill();
        }
        ctx.restore();
      }

      // Hide custom cursor indicators over text inputs to let native I-beam work smoothly
      if (currentCursorType === 'text' || currentCursorType === 'hide') {
        return;
      }

      // Draw Classic Standard Arrow Cursor with Heritage Golden Styling
      ctx.save();

      // Smooth scale physics for interactive hover and click compression
      const targetScale = isMouseDown ? 0.82 : isHoveringInteractive ? 1.08 : 0.92;
      currentScale += (targetScale - currentScale) * 0.25;

      ctx.translate(mouseX, mouseY);
      ctx.scale(currentScale, currentScale);

      // Subtle tilt on mouse down for tactile click press feeling
      if (isMouseDown) {
        ctx.rotate(-0.05);
      }

      // Sleek official heritage arrow geometry (compact, perfectly proportioned: ~11px length)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 10.6);
      ctx.lineTo(2.8, 8.0);
      ctx.lineTo(4.8, 12.2);
      ctx.lineTo(6.8, 11.3);
      ctx.lineTo(4.5, 7.2);
      ctx.lineTo(8.0, 7.2);
      ctx.closePath();

      // Ambient drop shadow for high contrast & depth
      ctx.shadowColor = isHoveringInteractive ? 'rgba(245, 158, 11, 0.65)' : 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = isHoveringInteractive ? 4 : 2;
      ctx.shadowOffsetX = 0.5;
      ctx.shadowOffsetY = 1.0;

      // Dark crisp outline so arrow is razor-sharp on both dark & light backgrounds
      ctx.strokeStyle = '#0f0b06';
      ctx.lineWidth = 1.1;
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Samskruthi antique gold / warm amber fill
      ctx.fillStyle = isHoveringInteractive ? '#f59e0b' : '#d4af37';
      ctx.fill();

      // Elegant inner highlight on the spine
      ctx.shadowColor = 'transparent';
      ctx.beginPath();
      ctx.moveTo(0.7, 1.4);
      ctx.lineTo(0.7, 8.8);
      ctx.strokeStyle = isHoveringInteractive ? '#fef08a' : '#fef9c3';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      ctx.restore();

      // Floating badge pill for interactive targets with custom labels
      if (cursorLabel && isHoveringInteractive) {
        ctx.save();
        ctx.translate(mouseX + 12, mouseY + 10);
        const text = cursorLabel.toUpperCase();
        ctx.font = '600 8.5px Inter, sans-serif';
        const textWidth = ctx.measureText(text).width;
        const paddingX = 6;
        const badgeWidth = textWidth + paddingX * 2;
        const badgeHeight = 16;

        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(0, 0, badgeWidth, badgeHeight, 8);
        } else {
          ctx.rect(0, 0, badgeWidth, badgeHeight);
        }
        ctx.fillStyle = 'rgba(15, 11, 6, 0.88)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, badgeWidth / 2, badgeHeight / 2 + 0.5);
        ctx.restore();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    // 5. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.documentElement.classList.remove('custom-cursor-active');
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      aria-hidden="true"
      style={{ width: '100vw', height: '100vh', zIndex: 2147483647, pointerEvents: 'none' }}
    />
  );
};

