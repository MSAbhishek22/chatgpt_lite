"use client";

import { useEffect, useRef } from "react";

/**
 * chatgpt_lite — 3D orbiting chat orb (hero strip).
 * Glowing core sphere, orbiting message bubbles, typing-wave rings.
 * Loads Three.js r160 UMD from jsDelivr at runtime (no new npm
 * dependency). Auto-plays on first load, drag to rotate, one still
 * frame under prefers-reduced-motion, pauses off-screen.
 */
const THREE_CDN = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ThreeGlobal = any;

function loadThree(): Promise<ThreeGlobal> {
  return new Promise((resolve) => {
    const w = window as unknown as { THREE?: ThreeGlobal };
    if (w.THREE) { resolve(w.THREE); return; }
    const existing = document.querySelector(`script[src="${THREE_CDN}"]`);
    if (existing) {
      const t = setInterval(() => {
        if ((window as unknown as { THREE?: ThreeGlobal }).THREE) {
          clearInterval(t);
          resolve((window as unknown as { THREE: ThreeGlobal }).THREE);
        }
      }, 100);
      setTimeout(() => clearInterval(t), 10000);
      return;
    }
    const s = document.createElement("script");
    s.src = THREE_CDN;
    s.async = true;
    s.onload = () => resolve((window as unknown as { THREE: ThreeGlobal }).THREE);
    s.onerror = () => resolve(undefined);
    document.head.appendChild(s);
    setTimeout(() => {
      if (!(window as unknown as { THREE?: ThreeGlobal }).THREE) resolve(undefined);
    }, 10000);
  });
}

export default function Hero3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    loadThree().then((THREE: ThreeGlobal) => {
      if (cancelled || !THREE || !canvas) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let renderer: ThreeGlobal;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      } catch {
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.set(0, 1.6, 7.2);
      camera.lookAt(0, 0, 0);
      scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      const key = new THREE.DirectionalLight(0xffffff, 1.2);
      key.position.set(4, 6, 5);
      scene.add(key);

      const world = new THREE.Group();
      scene.add(world);

      // Glowing core sphere.
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(1.0, 32, 24),
        new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.25, metalness: 0.1, emissive: 0x0369a1, emissiveIntensity: 0.9 })
      );
      world.add(core);
      const coreHalo = new THREE.Mesh(
        new THREE.SphereGeometry(1.18, 32, 24),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.18 })
      );
      world.add(coreHalo);

      // Orbiting message bubbles.
      const bubbles: ThreeGlobal[] = [];
      const bubbleColors = [0xffffff, 0xdbeafe, 0xbfdbfe];
      bubbleColors.forEach((c, i) => {
        const b = new THREE.Mesh(
          new THREE.BoxGeometry(0.55, 0.4, 0.12),
          new THREE.MeshStandardMaterial({ color: c, roughness: 0.4, emissive: 0x0ea5e9, emissiveIntensity: 0.25 })
        );
        world.add(b);
        bubbles.push(b);
        void i;
      });

      // Typing-wave rings: expanding, fading.
      const rings: ThreeGlobal[] = [];
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(1, 0.03, 10, 64),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 })
        );
        ring.rotation.x = Math.PI / 2 - 0.4;
        world.add(ring);
        rings.push(ring);
      }

      let rotY = 0;
      let targetRotY = 0;
      let dragging = false;
      let lastX = 0;
      const onDown = (e: PointerEvent) => { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); };
      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        targetRotY += (e.clientX - lastX) * 0.008;
        lastX = e.clientX;
      };
      const onUp = () => { dragging = false; };
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointercancel", onUp);

      const resize = () => {
        const w = canvas.clientWidth || 340;
        const h = canvas.clientHeight || 220;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", resize);
      resize();

      let visible = true;
      const io = new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }, { threshold: 0.02 });
      io.observe(canvas);

      const clock = new THREE.Clock();
      let raf = 0;
      const frame = () => {
        raf = 0;
        const t = clock.getElapsedTime();
        if (!dragging) targetRotY += 0.0016;
        rotY += (targetRotY - rotY) * 0.08;
        world.rotation.y = rotY;
        core.scale.setScalar(1 + Math.sin(t * 2) * 0.04);
        bubbles.forEach((b, i) => {
          const a = (i / bubbles.length) * Math.PI * 2 + t * 0.55;
          b.position.set(Math.cos(a) * 2.1, Math.sin(t * 1.1 + i * 2) * 0.5, Math.sin(a) * 2.1);
          b.rotation.y = -a;
        });
        rings.forEach((r, i) => {
          const cycle = ((t * 0.5 + i / 3) % 1);
          const s = 1 + cycle * 1.6;
          r.scale.set(s, s, 1);
          r.material.opacity = 0.6 * (1 - cycle);
        });
        renderer.render(scene, camera);
        if (!reduced && visible && !document.hidden) raf = requestAnimationFrame(frame);
      };
      const kick = () => { if (!raf) { clock.getDelta(); raf = requestAnimationFrame(frame); } };
      const onVis = () => { if (!document.hidden) kick(); };
      document.addEventListener("visibilitychange", onVis);
      if (reduced) frame();
      else kick();

      cleanup = () => {
        cancelAnimationFrame(raf);
        document.removeEventListener("visibilitychange", onVis);
        window.removeEventListener("resize", resize);
        io.disconnect();
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerup", onUp);
        canvas.removeEventListener("pointercancel", onUp);
        renderer.dispose();
      };
    });

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <canvas
      id="hero3d"
      ref={canvasRef}
      aria-label="3D chat orb: a glowing core with orbiting message bubbles and typing-wave rings"
      className="h-[220px] w-full rounded-2xl border bg-gradient-to-br from-sky-50 to-white shadow-sm md:h-[220px]"
    />
  );
}
