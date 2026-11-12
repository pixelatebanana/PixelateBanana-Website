'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function BananaScene() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ok, setOk] = useState(true);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const mk = () => { try { return new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch { return null; } };
    const R = mk(); if (!R) { setOk(false); return; }
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const dl = new THREE.DirectionalLight(0xffffff, 2.6); dl.position.set(4, 6, 8); scene.add(dl);
    const box = new THREE.BoxGeometry(0.3, 0.3, 0.3), eg = new THREE.EdgesGeometry(box), lm = new THREE.LineBasicMaterial({ color: 0x111111 });
    const ym = new THREE.MeshStandardMaterial({ color: 0xffe135 }), tip = new THREE.MeshStandardMaterial({ color: 0x3a2a10 }), pk = new THREE.MeshStandardMaterial({ color: 0xffb3d1 });
    const g = new THREE.Group(), seen = new Set<string>();
    for (let a = -1.1; a <= 1.1; a += 0.04) {
      const th = (1 - (a / 1.2) ** 2) * 0.45 + 0.08;
      for (let k = -1; k <= 1; k++) for (let q = -1; q <= 1; q++) {
        if (Math.abs(k) + Math.abs(q) > 1 + (th > 0.35 ? 1 : 0)) continue;
        const px = Math.round((Math.sin(a) * 2.6 + k * 0.3) / 0.3), py = Math.round((Math.cos(a) * 2.6 - 2.2 + q * 0.3) / 0.3), key = `${px},${py},${k}`;
        if (seen.has(key)) continue; seen.add(key);
        const m = new THREE.Mesh(box, Math.abs(a) > 1.05 ? tip : ym);
        m.position.set(px * 0.3, py * 0.3, k * 0.3); m.add(new THREE.LineSegments(eg, lm)); g.add(m);
      }
    }
    g.rotation.z = -0.3; scene.add(g);
    const fl: { m: THREE.Mesh; s: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const c = new THREE.Mesh(box, pk); c.scale.setScalar(0.8 + Math.random() * 1.4); c.add(new THREE.LineSegments(eg, lm));
      c.position.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8, -2 - Math.random() * 4); scene.add(c); fl.push({ m: c, s: Math.random() * 0.02 + 0.005 });
    }
    let raf = 0, vis = true, mx = 0, my = 0, sy = 0;
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver((e) => { vis = e[0].isIntersecting; }); io.observe(cv);
    const rs = () => { const p = cv.parentElement; if (!p) return; const w = p.clientWidth, h = p.clientHeight; R.setPixelRatio(Math.min(window.devicePixelRatio, 2)); R.setSize(w, h, false); cam.aspect = w / h; cam.position.z = w < 700 ? 13 : 9; cam.updateProjectionMatrix(); };
    const onP = (e: PointerEvent) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; };
    const onS = () => { sy = scrollY; };
    window.addEventListener('resize', rs); window.addEventListener('pointermove', onP, { passive: true }); window.addEventListener('scroll', onS, { passive: true }); rs();
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop); if (!vis) return;
      if (!rm) { g.rotation.y += 0.008 + mx * 0.02; g.rotation.x += (my * 0.8 + sy * 0.002 - g.rotation.x) * 0.05; g.position.y = Math.sin(t * 0.002) * 0.2; fl.forEach(({ m, s }) => { m.rotation.x += s; m.rotation.y += s * 1.3; }); }
      R.render(scene, cam);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('resize', rs); window.removeEventListener('pointermove', onP); window.removeEventListener('scroll', onS); R.dispose(); };
  }, []);
  return ok ? <canvas id="gl" ref={ref} aria-hidden="true" /> : <div className="gl-load" aria-hidden="true">🍌</div>;
}
