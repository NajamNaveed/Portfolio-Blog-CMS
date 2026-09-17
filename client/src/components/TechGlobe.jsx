import { useEffect, useMemo, useRef, useState } from 'react';
import { resolveTechIcon } from '../utils/iconMap';

// Evenly distributes `count` points across a sphere of the given radius
// using the Fibonacci (golden-angle) spiral method — avoids the pole
// clustering a naive lat/long grid would produce.
function fibonacciSphere(count, radius) {
  const points = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    points.push([Math.cos(theta) * radiusAtY * radius, y * radius, Math.sin(theta) * radiusAtY * radius]);
  }

  return points;
}

const RAD = Math.PI / 180;

export default function TechGlobe({ items, radius: radiusProp = 190, height = 520 }) {
  const containerRef = useRef(null);
  const iconRefs = useRef([]);
  const wireRef = useRef(null);
  const [radius, setRadius] = useState(radiusProp);
  const [boxHeight, setBoxHeight] = useState(height);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    function updateRadius() {
      // Icon badges are 56px plus label, so keep enough margin that the
      // sphere never gets visually clipped by the card edge on phones.
      const available = container.clientWidth;
      const nextRadius = Math.max(120, Math.min(radiusProp, available / 2 - 60));
      setRadius(nextRadius);
      setBoxHeight(Math.max(360, Math.min(height, nextRadius * 2 + 170)));
    }

    updateRadius();
    const observer = new ResizeObserver(updateRadius);
    observer.observe(container);
    return () => observer.disconnect();
  }, [radiusProp, height]);

  // Stop paying for the render loop entirely when the globe has scrolled
  // out of view — no point animating 3D transforms nobody can see.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  // All rotation state lives in refs and is pushed straight to the DOM
  // every animation frame — this keeps a 40+ node drag interaction at a
  // smooth 60fps instead of re-rendering React on every pointer move.
  const state = useRef({
    yaw: 20,
    pitch: -12,
    velYaw: prefersReducedMotion.current ? 0 : 0.06, // idle baseline spin, deg/frame
    velPitch: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    lastT: 0,
  });

  const points = useMemo(() => fibonacciSphere(items.length, radius), [items.length, radius]);

  useEffect(() => {
    if (!inView) return undefined;

    let raf;
    let frame = 0;

    function render() {
      const s = state.current;

      if (!s.dragging) {
        // Momentum decays toward the gentle baseline idle spin rather
        // than toward zero, so a fast flick gradually eases back into
        // the ambient rotation instead of coming to a dead stop.
        const baseline = prefersReducedMotion.current ? 0 : 0.06;
        s.velYaw += (baseline - s.velYaw) * 0.02;
        s.velPitch *= 0.94;
        s.yaw += s.velYaw;
        s.pitch += s.velPitch;
      }

      const yawRad = s.yaw * RAD;
      const pitchRad = s.pitch * RAD;
      const cosY = Math.cos(yawRad);
      const sinY = Math.sin(yawRad);
      const cosP = Math.cos(pitchRad);
      const sinP = Math.sin(pitchRad);
      // z-index precision beyond ~20 steps is invisible to the eye but
      // still costs a style write per icon per frame, so it's throttled
      // separately from the transform/opacity that need to stay smooth.
      const updateZIndex = frame % 3 === 0;

      points.forEach(([x, y, z], i) => {
        const el = iconRefs.current[i];
        if (!el) return;

        // Rotate around Y (yaw), then around X (pitch).
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        const y2 = y * cosP - z1 * sinP;
        const z2 = y * sinP + z1 * cosP;

        const depth = (z2 + radius) / (radius * 2); // 0 (back) → 1 (front)
        const scale = 0.62 + depth * 0.62;
        const opacity = 0.35 + depth * 0.75;

        el.style.transform = `translate3d(${x1.toFixed(1)}px, ${y2.toFixed(1)}px, ${z2.toFixed(1)}px) scale(${scale.toFixed(2)})`;
        el.style.opacity = Math.min(opacity, 1).toFixed(2);
        if (updateZIndex) el.style.zIndex = Math.round(depth * 100);
      });

      if (wireRef.current) {
        wireRef.current.style.transform = `rotateX(${(s.pitch * 0.5).toFixed(1)}deg) rotateY(${s.yaw.toFixed(1)}deg)`;
      }

      frame += 1;
      raf = requestAnimationFrame(render);
    }

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [points, radius, inView]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    function handleDown(e) {
      const s = state.current;
      s.dragging = true;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.lastT = performance.now();
      s.velYaw = 0;
      s.velPitch = 0;
      container.setPointerCapture?.(e.pointerId);
      container.style.cursor = 'grabbing';
    }

    function handleMove(e) {
      const s = state.current;
      if (!s.dragging) return;
      const now = performance.now();
      // Clamp dt so a dropped frame (tab throttling, GC pause) can't
      // produce a huge velocity spike that snaps the sphere.
      const dt = Math.min(Math.max(now - s.lastT, 1), 48);

      const dx = e.clientX - s.lastX;
      const dy = e.clientY - s.lastY;

      // Sensitivity tuned so the sphere tracks the pointer almost 1:1 —
      // it should feel like you're grabbing the surface itself, not
      // steering it from a distance.
      const dYaw = dx * 0.4;
      const dPitch = -dy * 0.4;

      s.yaw += dYaw;
      s.pitch = Math.max(-85, Math.min(85, s.pitch + dPitch));

      // Smoothed velocity (blended with the previous sample) so momentum
      // after release reflects the overall gesture rather than whatever
      // the single last pointermove happened to measure.
      const instYaw = (dYaw / dt) * 16;
      const instPitch = (dPitch / dt) * 16;
      s.velYaw = s.velYaw * 0.7 + instYaw * 0.3;
      s.velPitch = s.velPitch * 0.7 + instPitch * 0.3;

      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.lastT = now;
    }

    function handleUp(e) {
      state.current.dragging = false;
      container.style.cursor = 'grab';
      container.releasePointerCapture?.(e.pointerId);
    }

    container.addEventListener('pointerdown', handleDown);
    container.addEventListener('pointermove', handleMove);
    container.addEventListener('pointerup', handleUp);
    container.addEventListener('pointercancel', handleUp);

    return () => {
      container.removeEventListener('pointerdown', handleDown);
      container.removeEventListener('pointermove', handleMove);
      container.removeEventListener('pointerup', handleUp);
      container.removeEventListener('pointercancel', handleUp);
    };
  }, []);

  if (!items?.length) return null;

  return (
    <div
      ref={containerRef}
      style={{ height: boxHeight, cursor: 'grab', perspective: '1400px' }}
      className="relative w-full touch-none select-none overflow-hidden rounded-3xl border border-line bg-[radial-gradient(circle_at_50%_45%,var(--color-ink-elevated),var(--color-ink)_70%)]"
    >
      <div className="pointer-events-none absolute left-1/2 top-5 z-20 -translate-x-1/2 font-mono text-[11px] uppercase tracking-widest text-stone-dim">
        drag to rotate
      </div>

      {/* Decorative wireframe sphere grid behind the icons, purely visual */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 opacity-40"
        style={{
          width: radius * 2,
          height: radius * 2,
          transformStyle: 'preserve-3d',
          marginLeft: -radius,
          marginTop: -radius,
        }}
      >
        <div ref={wireRef} style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d' }}>
          {[0, 45, 90, 135].map((deg) => (
            <div
              key={`h-${deg}`}
              className="absolute inset-0 rounded-full border border-accent/25"
              style={{ transform: `rotateY(${deg}deg)` }}
            />
          ))}
          {[-45, 0, 45].map((deg) => (
            <div
              key={`v-${deg}`}
              className="absolute inset-0 rounded-full border border-accent/15"
              style={{ transform: `rotateX(90deg) rotateZ(${deg}deg) scale(${Math.cos(deg * RAD)})` }}
            />
          ))}
        </div>
      </div>

      <div
        className="absolute left-1/2 top-1/2"
        style={{ transformStyle: 'preserve-3d', width: 0, height: 0 }}
      >
        {items.map((item, i) => {
          const Icon = resolveTechIcon(item.icon);
          return (
            <div
              key={`${item.name}-${i}`}
              ref={(el) => {
                iconRefs.current[i] = el;
              }}
              style={{ position: 'absolute', left: 0, top: 0, willChange: 'transform, opacity' }}
              className="group -ml-7 -mt-7 flex flex-col items-center"
            >
              <div className="flex size-14 items-center justify-center rounded-full border border-line bg-ink-soft transition-[border-color,box-shadow] duration-200 group-hover:border-accent group-hover:shadow-[0_0_28px_rgba(182,255,60,0.5)]">
                <Icon className="size-7 text-paper-dim transition-colors duration-200 group-hover:text-accent" />
              </div>
              <span className="pointer-events-none mt-1.5 whitespace-nowrap rounded-full bg-ink px-2 py-0.5 font-mono text-[10px] text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {item.name}
              </span>
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_55%,var(--color-ink)_100%)]" />
    </div>
  );
}
