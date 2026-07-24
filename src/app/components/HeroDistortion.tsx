"use client";

import { useEffect, useRef } from "react";
import {
  Clock,
  Mesh,
  NoColorSpace,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
  TextureLoader,
  SRGBColorSpace,
  ClampToEdgeWrapping,
  LinearFilter,
  type Texture,
} from "three";

const MAX_RIPPLES = 12;

const vertexShader = `
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  #define MAX_RIPPLES ${MAX_RIPPLES}

  uniform sampler2D uTexture;
  uniform vec3 iResolution; // xy = pixel size, z = elapsed time
  uniform vec2 uImageResolution;

  uniform bool interactive;
  uniform vec2 uRipplePos[MAX_RIPPLES];   // ripple origins, in baseUv space
  uniform float uRippleTime[MAX_RIPPLES]; // elapsed time when each ripple spawned
  uniform float rippleStrength;
  uniform float rippleFrequency;
  uniform float rippleSpeed;
  uniform float rippleLife;
  uniform float rippleFalloff;

  uniform bool parallax;
  uniform vec2 parallaxOffset;

  uniform float uZoom;

  // Standard "cover" mapping in pixel space — scales the image by
  // whichever axis needs the LARGER scale factor so it always fully
  // covers the container, then centers it. This avoids the old bug
  // where extreme aspect-ratio mismatches (e.g. landscape image on a
  // tall mobile viewport) pushed sampled UVs outside [0,1] and the
  // ClampToEdgeWrapping smeared/stretched the edge pixels.
  vec2 coverUv(vec2 uv, vec2 res, vec2 imgRes) {
    vec2 s = res / imgRes;
    float scale = max(s.x, s.y);
    vec2 scaledImgRes = imgRes * scale;
    vec2 offset = (res - scaledImgRes) * 0.5;
    return (uv * res - offset) / scaledImgRes;
  }

  void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uv = fragCoord / iResolution.xy;

    // aspect-corrected, centered space
    vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
    float time = iResolution.z;

    vec2 displacement = vec2(0.0);

    if (interactive) {
      for (int i = 0; i < MAX_RIPPLES; i++) {
        float age = time - uRippleTime[i];
        if (age < 0.0 || age > rippleLife) continue;

        vec2 diff = baseUv - uRipplePos[i];
        float dist = length(diff);
        vec2 dir = dist > 0.0001 ? diff / dist : vec2(0.0);

        float timeFade = 1.0 - age / rippleLife;
        float ring = sin(dist * rippleFrequency - age * rippleSpeed);
        float spatialFalloff = exp(-dist * rippleFalloff);

        // push pixels outward along the ring, strongest right after spawn
        displacement += dir * ring * spatialFalloff * timeFade * timeFade * rippleStrength;
      }
    }

    vec2 sampleUv = coverUv(uv, iResolution.xy, uImageResolution);

    // Zoom in around the center. uZoom > 1 crops in (useful on mobile to
    // pull the subject away from the edges instead of just cover-cropping).
    sampleUv = (sampleUv - 0.5) / uZoom + 0.5;

    if (parallax) {
      sampleUv += parallaxOffset;
    }

    // 0.05 converts baseUv-scale displacement into 0..1 uv-scale
    sampleUv += displacement * 0.05;

    gl_FragColor = texture2D(uTexture, sampleUv);
  }
`;

type HeroDistortionProps = {
  src: string;
  className?: string;
  interactive?: boolean;
  /** how far pixels displace at the peak of a ripple */
  rippleStrength?: number;
  /** ring density - higher = tighter concentric rings */
  rippleFrequency?: number;
  /** how fast rings expand outward */
  rippleSpeed?: number;
  /** seconds a ripple stays visible before fully fading */
  rippleLife?: number;
  /** how quickly a ripple's effect fades with distance from its origin */
  rippleFalloff?: number;
  /** min pointer travel (in shader units, roughly -1..1 space) before a new ripple spawns */
  rippleSpacing?: number;
  parallax?: boolean;
  parallaxStrength?: number;
  /**
   * Manual zoom override (1 = no zoom, >1 crops in toward center).
   * If omitted, mobile/touch viewports auto-zoom slightly via `mobileZoom`
   * and desktop stays at 1.
   */
  zoom?: number;
  /** zoom applied automatically on mobile/touch viewports when `zoom` isn't set */
  mobileZoom?: number;
  /** below this width (px) the ripple interaction is force-disabled */
  mobileBreakpoint?: number;
};

export default function HeroDistortion({
  src,
  className,
  interactive = true,
  rippleStrength = 0.9,
  rippleFrequency = 18,
  rippleSpeed = 6,
  rippleLife = 1.1,
  rippleFalloff = 1.4,
  rippleSpacing = 0.05,
  parallax = true,
  parallaxStrength = 0.04,
  zoom,
  mobileZoom = 1.18,
  mobileBreakpoint = 767,
}: HeroDistortionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSpawnRef = useRef(new Vector2(9999, 9999));
  const rippleIndexRef = useRef(0);
  const targetParallaxRef = useRef(new Vector2(0, 0));
  const currentParallaxRef = useRef(new Vector2(0, 0));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      container.style.backgroundImage = `url(${src})`;
      container.style.backgroundSize = "cover";
      container.style.backgroundPosition = "center";
      return;
    }

    let active = true;
    let raf = 0;

    // Detect mobile/touch once up front. Ripple interaction is disabled
    // entirely on these viewports, and the image auto-zooms in a bit so
    // the subject isn't cover-cropped into the far edges of a tall,
    // narrow screen.
    const isMobile =
      window.matchMedia(`(max-width: ${mobileBreakpoint}px)`).matches ||
      window.matchMedia("(pointer: coarse)").matches;

    const interactiveActive = interactive && !isMobile;
    const zoomValue = zoom ?? (isMobile ? mobileZoom : 1);

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = SRGBColorSpace;
    Object.assign(renderer.domElement.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
    });
    container.appendChild(renderer.domElement);

    const ripplePos = Array.from({ length: MAX_RIPPLES }, () => new Vector2(0, 0));
    const rippleTime = new Float32Array(MAX_RIPPLES).fill(-999);

    const uniforms = {
      uTexture: { value: null as Texture | null },
      iResolution: { value: new Vector3(1, 1, 1) },
      uImageResolution: { value: new Vector2(1, 1) },
      interactive: { value: interactiveActive },
      uRipplePos: { value: ripplePos },
      uRippleTime: { value: rippleTime },
      rippleStrength: { value: rippleStrength },
      rippleFrequency: { value: rippleFrequency },
      rippleSpeed: { value: rippleSpeed },
      rippleLife: { value: rippleLife },
      rippleFalloff: { value: rippleFalloff },
      parallax: { value: parallax },
      parallaxOffset: { value: new Vector2(0, 0) },
      uZoom: { value: zoomValue },
    };

    const loader = new TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      src,
      (tex) => {
        // No sRGB decode here: this shader is a raw passthrough with no
        // lighting math, so we want the stored bytes displayed unchanged.
        // Decoding on sample without re-encoding on output is what caused
        // the reddish/washed-out cast.
        tex.colorSpace = NoColorSpace;
        tex.wrapS = tex.wrapT = ClampToEdgeWrapping;
        tex.minFilter = tex.magFilter = LinearFilter;
        uniforms.uTexture.value = tex;
        uniforms.uImageResolution.value.set(tex.image.width, tex.image.height);
      },
      undefined,
      (err) => {
        console.error("HeroDistortion: failed to load texture", err);
      }
    );

    const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true });
    const geometry = new PlaneGeometry(2, 2);
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    const setSize = () => {
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      renderer.setSize(width, height, false);
      uniforms.iResolution.value.set(
        renderer.domElement.width,
        renderer.domElement.height,
        uniforms.iResolution.value.z
      );
    };
    setSize();

    const ro = new ResizeObserver(() => active && setSize());
    ro.observe(container);

    // Converts a client-space pointer position into the same aspect-corrected
    // "baseUv" space the fragment shader uses, so ripple origins line up.
    const clientToBaseUv = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const dpr = renderer.getPixelRatio();
      const fx = (clientX - rect.left) * dpr;
      const fy = (rect.height - (clientY - rect.top)) * dpr; // flip to bottom-up, matches gl_FragCoord
      const resX = renderer.domElement.width;
      const resY = renderer.domElement.height;
      return new Vector2((2 * fx - resX) / resY, (2 * fy - resY) / resY);
    };

    const spawnRipple = (uv: Vector2) => {
      const i = rippleIndexRef.current;
      ripplePos[i].copy(uv);
      rippleTime[i] = clock.getElapsedTime();
      rippleIndexRef.current = (i + 1) % MAX_RIPPLES;
      lastSpawnRef.current.copy(uv);
    };

    const handlePointerMove = (e: PointerEvent) => {
      const uv = clientToBaseUv(e.clientX, e.clientY);

      if (uv.distanceTo(lastSpawnRef.current) >= rippleSpacing) {
        spawnRipple(uv);
      }

      if (parallax) {
        const rect = renderer.domElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const offsetX = (x - rect.width / 2) / rect.width;
        const offsetY = -(y - rect.height / 2) / rect.height;
        targetParallaxRef.current.set(offsetX * parallaxStrength, offsetY * parallaxStrength);
      }
    };

    const handlePointerLeave = () => {
      targetParallaxRef.current.set(0, 0);
    };

    if (interactiveActive) {
      renderer.domElement.addEventListener("pointermove", handlePointerMove);
      renderer.domElement.addEventListener("pointerleave", handlePointerLeave);
    }

    let isVisible = true;
    const io = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { threshold: 0 }
    );
    io.observe(container);

    const clock = new Clock();
    const tick = () => {
      if (!active) return;
      raf = requestAnimationFrame(tick);
      if (!isVisible || !uniforms.uTexture.value) return;

      uniforms.iResolution.value.z = clock.getElapsedTime();

      if (parallax) {
        currentParallaxRef.current.lerp(targetParallaxRef.current, 0.08);
        uniforms.parallaxOffset.value.copy(currentParallaxRef.current);
      }

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      if (interactiveActive) {
        renderer.domElement.removeEventListener("pointermove", handlePointerMove);
        renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
      }
      geometry.dispose();
      material.dispose();
      uniforms.uTexture.value?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    src,
    interactive,
    rippleStrength,
    rippleFrequency,
    rippleSpeed,
    rippleLife,
    rippleFalloff,
    rippleSpacing,
    parallax,
    parallaxStrength,
    zoom,
    mobileZoom,
    mobileBreakpoint,
  ]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
      aria-hidden="true"
    />
  );
}