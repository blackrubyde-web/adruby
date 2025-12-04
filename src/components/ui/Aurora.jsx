import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';
import './Aurora.css';

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

float snoise(vec2 v){
  return fract(sin(dot(v ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float n = snoise(uv * 6.0 + uTime * 0.1);

  vec3 c = mix(uColorStops[0], uColorStops[1], n);
  c = mix(c, uColorStops[2], uv.y);

  fragColor = vec4(c * 0.2, 0.35);
}
`;

export default function Aurora({
  colorStops = ["#3A29FF", "#FF94B4", "#FF3232"],
  amplitude = 1.0,
  blend = 0.4,
  speed = 0.5
}) {
  const el = useRef(null);

  useEffect(() => {
    const container = el.current;
    if (!container) return;

    const renderer = new Renderer({
      alpha: true,
      antialias: true,
      premultipliedAlpha: true
    });

    const gl = renderer.gl;
    gl.canvas.style.position = 'absolute';
    gl.canvas.style.inset = 0;
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.style.pointerEvents = 'none';

    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);

    const stops = colorStops.map((hex) => {
      const c = new Color(hex);
      return [c.r, c.g, c.b];
    });

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uColorStops: { value: stops },
        uResolution: { value: [container.offsetWidth, container.offsetHeight] },
        uAmplitude: { value: amplitude },
        uBlend: { value: blend }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });

    function update(t) {
      program.uniforms.uTime.value = t * speed * 0.0008;
      renderer.render({ scene: mesh });
      requestAnimationFrame(update);
    }
    requestAnimationFrame(update);

    function resize() {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      renderer.setSize(w, h);
      program.uniforms.uResolution.value = [w, h];
    }

    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      container.removeChild(gl.canvas);
    };
  }, []);

  return <div ref={el} className="aurora-container"></div>;
}
