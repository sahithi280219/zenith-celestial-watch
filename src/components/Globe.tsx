import { useEffect, useRef } from "react";
import * as THREE from "three";
import { subSolarPoint } from "@/lib/astro";

export type GlobeProps = {
  lat: number;
  lon: number;
  issLat?: number;
  issLon?: number;
  onPick?: (lat: number, lon: number) => void;
};

/**
 * Procedural neon Earth globe using three.js. No external textures required.
 * - Animated continents via simplex-like noise (built into shader)
 * - Atmospheric rim glow
 * - Day/night terminator from real sub-solar point
 * - ISS marker + orbit trail
 * - Click to pick lat/lon
 */
export function Globe({ lat, lon, issLat, issLon, onPick }: GlobeProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const propsRef = useRef({ lat, lon, issLat, issLon, onPick });
  propsRef.current = { lat, lon, issLat, issLon, onPick };

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // Earth shader
    const earthUniforms = {
      uTime: { value: 0 },
      uSunDir: { value: new THREE.Vector3(1, 0, 0) },
      uOcean: { value: new THREE.Color("#0a2a4a") },
      uLand: { value: new THREE.Color("#0e7a55") },
      uAtmos: { value: new THREE.Color("#00F5FF") },
    };

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 128, 128),
      new THREE.ShaderMaterial({
        uniforms: earthUniforms,
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vPos;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPos = normal;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vPos;
          uniform vec3 uSunDir;
          uniform vec3 uOcean;
          uniform vec3 uLand;
          uniform vec3 uAtmos;
          uniform float uTime;

          // hash + fbm noise
          float hash(vec3 p){ return fract(sin(dot(p, vec3(17.1, 31.7, 73.3))) * 43758.5453); }
          float noise(vec3 p){
            vec3 i = floor(p); vec3 f = fract(p);
            f = f*f*(3.0-2.0*f);
            float n = mix(
              mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x),
                  mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
              mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
                  mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z);
            return n;
          }
          float fbm(vec3 p){
            float v=0.0, a=0.5;
            for(int i=0;i<5;i++){ v += a*noise(p); p*=2.05; a*=0.5; }
            return v;
          }

          void main(){
            vec3 n = normalize(vPos);
            float continents = fbm(n * 2.3);
            float detail = fbm(n * 8.0) * 0.3;
            float h = continents + detail;
            vec3 base = h > 0.52 ? mix(uLand, vec3(0.9,0.85,0.6), smoothstep(0.65, 0.85, h)) : uOcean;
            // ice caps
            base = mix(base, vec3(0.85,0.95,1.0), smoothstep(0.78, 0.95, abs(n.y)));

            // lighting
            float sun = dot(normalize(vNormal), normalize((viewMatrix * vec4(uSunDir, 0.0)).xyz));
            float day = smoothstep(-0.15, 0.2, sun);
            vec3 lit = base * (0.15 + 0.95 * day);

            // night city glow (random sparkles on land)
            float city = step(0.62, h) * step(0.985, fbm(n * 120.0 + uTime*0.02));
            lit += city * vec3(1.0, 0.85, 0.4) * (1.0 - day);

            // atmospheric rim
            float rim = pow(1.0 - max(dot(normalize(vNormal), vec3(0,0,1)), 0.0), 2.5);
            lit += uAtmos * rim * 0.5;

            gl_FragColor = vec4(lit, 1.0);
          }
        `,
      }),
    );
    scene.add(earth);

    // Atmosphere shell (back-side rendering glow)
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.15, 64, 64),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color("#00F5FF") } },
        vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
        fragmentShader: `varying vec3 vN; uniform vec3 uColor; void main(){ float i = pow(0.7 - dot(vN, vec3(0,0,1)), 2.0); gl_FragColor = vec4(uColor, 1.0)*i; }`,
      }),
    );
    scene.add(atmosphere);

    // Helpers
    function latLonToVec3(latDeg: number, lonDeg: number, r = 1.0) {
      const phi = (90 - latDeg) * (Math.PI / 180);
      const theta = (lonDeg + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      );
    }

    // Selected location marker
    const markerGroup = new THREE.Group();
    scene.add(markerGroup);
    const markerCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x00f5ff }),
    );
    const markerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.04, 0.05, 32),
      new THREE.MeshBasicMaterial({ color: 0x00f5ff, side: THREE.DoubleSide, transparent: true, opacity: 0.7 }),
    );
    markerGroup.add(markerCore);
    markerGroup.add(markerRing);

    // ISS marker
    const issGroup = new THREE.Group();
    scene.add(issGroup);
    const issDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffd166 }),
    );
    const issHalo = new THREE.Mesh(
      new THREE.RingGeometry(0.05, 0.065, 32),
      new THREE.MeshBasicMaterial({ color: 0xffd166, side: THREE.DoubleSide, transparent: true, opacity: 0.6 }),
    );
    issGroup.add(issDot);
    issGroup.add(issHalo);

    // ISS orbit trail (estimated 51.6° inclination)
    const orbitPoints: THREE.Vector3[] = [];
    const inclination = 51.6 * (Math.PI / 180);
    for (let i = 0; i <= 256; i++) {
      const t = (i / 256) * Math.PI * 2;
      const x = Math.cos(t);
      const y = Math.sin(t) * Math.sin(inclination);
      const z = Math.sin(t) * Math.cos(inclination);
      orbitPoints.push(new THREE.Vector3(x, y, z).multiplyScalar(1.15));
    }
    const orbit = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(orbitPoints),
      new THREE.LineBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.4 }),
    );
    scene.add(orbit);

    // Satellites (fake constellation)
    const satGeo = new THREE.BufferGeometry();
    const satCount = 220;
    const satPositions = new Float32Array(satCount * 3);
    const satData: { incl: number; raan: number; phase: number; radius: number }[] = [];
    for (let i = 0; i < satCount; i++) {
      satData.push({
        incl: (Math.random() * 100 - 10) * (Math.PI / 180),
        raan: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
        radius: 1.08 + Math.random() * 0.15,
      });
    }
    satGeo.setAttribute("position", new THREE.BufferAttribute(satPositions, 3));
    const sats = new THREE.Points(
      satGeo,
      new THREE.PointsMaterial({ color: 0x9d4edd, size: 0.025, transparent: true, opacity: 0.8 }),
    );
    scene.add(sats);

    // Raycast picking
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let isDragging = false;
    let downX = 0, downY = 0;
    const onDown = (e: PointerEvent) => { isDragging = false; downX = e.clientX; downY = e.clientY; };
    const onMove = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 4) isDragging = true;
    };
    const onUp = (e: PointerEvent) => {
      if (isDragging) return;
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObject(earth);
      if (hits.length) {
        // Convert hit point in earth-local space back to lat/lon
        const local = earth.worldToLocal(hits[0].point.clone()).normalize();
        const latPicked = 90 - (Math.acos(local.y) * 180) / Math.PI;
        let lonPicked = (Math.atan2(local.z, -local.x) * 180) / Math.PI - 180;
        lonPicked = ((((lonPicked + 180) % 360) + 360) % 360) - 180;
        propsRef.current.onPick?.(latPicked, lonPicked);
      }
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerup", onUp);

    // Drag to rotate camera around globe
    let rotX = 0, rotY = 0, targetRotX = 0, targetRotY = 0;
    let dragging = false;
    let lx = 0, ly = 0;
    renderer.domElement.addEventListener("pointerdown", (e) => { dragging = true; lx = e.clientX; ly = e.clientY; });
    window.addEventListener("pointerup", () => { dragging = false; });
    window.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      targetRotY += (e.clientX - lx) * 0.005;
      targetRotX += (e.clientY - ly) * 0.005;
      targetRotX = Math.max(-1.2, Math.min(1.2, targetRotX));
      lx = e.clientX; ly = e.clientY;
    });

    // Zoom
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(1.8, Math.min(8, camera.position.z + e.deltaY * 0.002));
    };
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    // Resize
    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    const clock = new THREE.Clock();
    let raf = 0;
    let autoRotate = 0;

    const animate = () => {
      const t = clock.getElapsedTime();
      earthUniforms.uTime.value = t;

      // sun direction (sub-solar point in world space, earth fixed frame)
      const ss = subSolarPoint(new Date());
      const sunVec = (() => {
        const phi = (90 - ss.lat) * (Math.PI / 180);
        const theta = (ss.lon + 180) * (Math.PI / 180);
        return new THREE.Vector3(
          -Math.sin(phi) * Math.cos(theta),
          Math.cos(phi),
          Math.sin(phi) * Math.sin(theta),
        );
      })();
      earthUniforms.uSunDir.value.copy(sunVec).applyAxisAngle(new THREE.Vector3(0, 1, 0), -autoRotate);

      rotX += (targetRotX - rotX) * 0.08;
      rotY += (targetRotY - rotY) * 0.08;
      if (!dragging) autoRotate += 0.0008;

      const group = new THREE.Group();
      earth.rotation.set(rotX, rotY + autoRotate, 0);
      atmosphere.rotation.copy(earth.rotation);
      orbit.rotation.set(rotX + Math.sin(t * 0.1) * 0.05, rotY + autoRotate + t * 0.05, 0);

      // place selected marker on earth surface (rotates with earth)
      const v = latLonToVec3(propsRef.current.lat, propsRef.current.lon, 1.005);
      v.applyEuler(earth.rotation);
      markerGroup.position.copy(v);
      markerGroup.lookAt(v.clone().multiplyScalar(2));
      const pulse = 1 + Math.sin(t * 4) * 0.25;
      markerRing.scale.set(pulse, pulse, pulse);

      // ISS
      if (propsRef.current.issLat !== undefined && propsRef.current.issLon !== undefined) {
        const iv = latLonToVec3(propsRef.current.issLat, propsRef.current.issLon, 1.15);
        iv.applyEuler(earth.rotation);
        issGroup.position.copy(iv);
        issGroup.lookAt(iv.clone().multiplyScalar(2));
        const pp = 1 + Math.sin(t * 6) * 0.3;
        issHalo.scale.set(pp, pp, pp);
        issGroup.visible = true;
      } else {
        issGroup.visible = false;
      }

      // sats
      const pos = sats.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < satCount; i++) {
        const s = satData[i];
        const a = s.phase + t * 0.12 + i * 0.001;
        const x = Math.cos(a) * s.radius;
        const y = Math.sin(a) * Math.sin(s.incl) * s.radius;
        const z = Math.sin(a) * Math.cos(s.incl) * s.radius;
        const v = new THREE.Vector3(x, y, z);
        v.applyAxisAngle(new THREE.Vector3(0, 1, 0), s.raan);
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      pos.needsUpdate = true;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
      group.clear();
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={ref} className="relative h-full w-full" />;
}
