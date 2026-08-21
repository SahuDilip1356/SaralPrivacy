"use client";
// SetuOrb — the living ground the character sits in.
//
// What this is, precisely: a sphere lit per-pixel in a WebGL fragment shader,
// with animated value-noise displacing its surface normal so light crawls
// across it like a slow simmer. Real 3D shading — Lambert term, specular
// lobe, fresnel rim that brightens at the silhouette — not a CSS gradient
// doing an impression of one.
//
// What it is NOT: a 3D model of Setu. No mesh or rig exists in this repo and
// none can be authored here, so the character stays a 2D render composited at
// the centre. That is also the better outcome — SETU_CHARACTER_CANON.md is a
// real asset, and a faceless orb would have thrown it away to look like every
// other AI widget.
//
// Cost discipline, because this can sit in the corner of every page:
//   · opt-in per call site (see SetuStage) — the message rail never mounts one
//   · devicePixelRatio capped at 2
//   · the rAF loop parks itself when the tab is hidden
//   · prefers-reduced-motion renders exactly one frame and stops
//   · no WebGL → renders nothing, and SetuStage keeps its <Image>

import { useEffect, useRef } from "react";
import type { AvatarState } from "./SetuStage";

/** Glow colour + agitation per state. Hues follow the RING map SetuStage
 *  already used, so the orb reads as the same language, louder. */
const MOOD: Record<AvatarState, { rgb: [number, number, number]; energy: number }> = {
  idle:      { rgb: [0.208, 0.714, 0.682], energy: 0.16 }, // #35B6AE
  greeting:  { rgb: [0.027, 0.725, 0.506], energy: 0.58 }, // #07B981
  listening: { rgb: [0.125, 0.490, 0.471], energy: 0.34 }, // #207D78
  thinking:  { rgb: [0.910, 0.671, 0.259], energy: 0.82 }, // #E8AB42
  speaking:  { rgb: [0.027, 0.725, 0.506], energy: 0.70 },
  pointing:  { rgb: [0.122, 0.800, 0.553], energy: 0.62 },
  unsure:    { rgb: [0.910, 0.671, 0.259], energy: 0.40 },
  error:     { rgb: [0.878, 0.400, 0.365], energy: 0.52 },
};

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2  u_res;
uniform float u_time;
uniform vec3  u_glow;
uniform float u_energy;

float hash(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
}

float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = hash(i + vec3(0.0, 0.0, 0.0));
  float n100 = hash(i + vec3(1.0, 0.0, 0.0));
  float n010 = hash(i + vec3(0.0, 1.0, 0.0));
  float n110 = hash(i + vec3(1.0, 1.0, 0.0));
  float n001 = hash(i + vec3(0.0, 0.0, 1.0));
  float n101 = hash(i + vec3(1.0, 0.0, 1.0));
  float n011 = hash(i + vec3(0.0, 1.0, 1.0));
  float n111 = hash(i + vec3(1.0, 1.0, 1.0));
  return mix(
    mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
    mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y),
    f.z
  );
}

// Four octaves is the point where the surface reads as simmering rather than
// as a moving texture. Fewer looks like a lava lamp; more costs frames.
float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / min(u_res.x, u_res.y);
  float r = length(uv);
  float R = 0.66;

  vec3 col = vec3(0.0);
  float alpha = 0.0;
  float t = u_time * (0.18 + u_energy * 0.30);

  if (r < R) {
    // Analytic sphere: z from the circle equation gives a true normal without
    // marching. Cheap, exact, and enough for a body this simple.
    float z = sqrt(max(0.0, R * R - r * r)) / R;
    vec3 n = normalize(vec3(uv / R, z));

    float b1 = fbm(n * 2.7 + vec3(0.0, 0.0, t));
    float b2 = fbm(n * 6.1 + vec3(t * 0.6, -t * 0.35, t * 0.2));
    float bump = (b1 - 0.5) * 0.75 + (b2 - 0.5) * 0.25;

    vec3 nb = normalize(n + bump * (0.30 + u_energy * 0.55) * vec3(b2 - 0.5, b1 - 0.5, 0.25));

    vec3 L = normalize(vec3(-0.42, 0.58, 0.80));
    float diff = max(dot(nb, L), 0.0);
    float spec = pow(max(dot(reflect(-L, nb), vec3(0.0, 0.0, 1.0)), 0.0), 26.0);
    float fres = pow(1.0 - z, 2.3);

    col  = u_glow * (0.14 + 0.60 * diff);
    col += u_glow * fres * (0.85 + u_energy * 0.95);
    col += vec3(1.0) * spec * 0.42;
    // Crests of the noise catch the light — this is the "bubbling" read.
    col += u_glow * smoothstep(0.58, 0.96, b1 + b2 * 0.45) * (0.22 + u_energy * 0.50);

    alpha = smoothstep(R, R - 0.035, r);
  }

  // Emissive halo beyond the body, breathing slightly out of phase.
  float pulse = 0.86 + 0.14 * sin(u_time * (0.7 + u_energy * 1.5));
  float halo = exp(-max(0.0, r - R) * 6.2) * (0.42 + u_energy * 0.62) * pulse;
  col += u_glow * halo * 0.55;
  alpha = max(alpha, halo * 0.80);

  gl_FragColor = vec4(col * alpha, alpha);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function SetuOrb({ state, size }: { state: AvatarState; size: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Read through a ref so a state change never tears down the GL context —
  // recreating it per state would leak contexts fast at 16 per document.
  const stateRef = useRef<AvatarState>(state);
  stateRef.current = state;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      (canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: true }) as
        | WebGLRenderingContext
        | null) ?? null;
    if (!gl) return; // SetuStage still shows the character; we simply add nothing

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uGlow = gl.getUniformLocation(prog, "u_glow");
    const uEnergy = gl.getUniformLocation(prog, "u_energy");

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const px = Math.round(size * dpr);
    canvas.width = px;
    canvas.height = px;
    gl.viewport(0, 0, px, px);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // premultiplied

    // Eased so a state change glides instead of snapping — the difference
    // between a character reacting and a lamp switching.
    let glow = MOOD[state].rgb.slice() as [number, number, number];
    let energy = MOOD[state].energy;

    const draw = (tMs: number) => {
      const mood = MOOD[stateRef.current] ?? MOOD.idle;
      for (let i = 0; i < 3; i++) glow[i] += (mood.rgb[i] - glow[i]) * 0.06;
      energy += (mood.energy - energy) * 0.06;

      gl.uniform2f(uRes, px, px);
      gl.uniform1f(uTime, tMs / 1000);
      gl.uniform3f(uGlow, glow[0], glow[1], glow[2]);
      gl.uniform1f(uEnergy, energy);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      // One frame, held. Still dimensional, still glowing — just not moving.
      glow = MOOD[stateRef.current].rgb.slice() as [number, number, number];
      energy = MOOD[stateRef.current].energy;
      draw(0);
      return () => {
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    }

    let raf = 0;
    const loop = (t: number) => {
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // size is the only prop that must rebuild the context; state rides the ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
