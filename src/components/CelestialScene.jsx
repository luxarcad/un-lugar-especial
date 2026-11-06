import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COUNT = 2200;
const TAU = Math.PI * 2;

const random = (seed) => {
  const value = Math.sin(seed * 127.1 + 78.233) * 43758.5453;
  return value - Math.floor(value);
};

function createShape(type) {
  const array = new Float32Array(COUNT * 3);

  for (let i = 0; i < COUNT; i += 1) {
    const a = random(i + 11) * TAU;
    const fill = Math.sqrt(random(i + 713));
    const scatter = random(i + 1731) - 0.5;

    let x = 0;
    let y = 0;
    let z = 0;

    if (type === 'heart') {
      const hx = 16 * Math.sin(a) ** 3;

      const hy =
        13 * Math.cos(a)
        - 5 * Math.cos(2 * a)
        - 2 * Math.cos(3 * a)
        - Math.cos(4 * a);

      x = hx * 0.18 * fill;
      y = hy * 0.18 * fill + 0.15;

      z = scatter * 0.9
        + 0.35 * Math.sin(a * 3) * fill;

    } else if (type === 'flower') {
      const r = (1.35 + 0.7 * Math.cos(6 * a)) * fill;

      x = Math.cos(a) * r * 1.35;
      y = Math.sin(a) * r * 1.35;

      z = scatter * 0.6
        + Math.sin(6 * a) * 0.3 * fill;

    } else {
      const divisor = 1 + Math.cos(a) ** 2;

      x = (3.8 * Math.sin(a)) / divisor
        + scatter * 0.22;

      y = (3.2 * Math.sin(a) * Math.cos(a)) / divisor
        + (random(i + 814) - 0.5) * 0.2;

      z = (random(i + 971) - 0.5) * 0.9;
    }

    array[i * 3] = x;
    array[i * 3 + 1] = y;
    array[i * 3 + 2] = z;
  }

  return array;
}

function LoveParticles({ shape, pointer, reducedMotion }) {
  const group = useRef();
  const geometry = useRef();

  const targets = useMemo(() => ({
    heart: createShape('heart'),
    infinity: createShape('infinity'),
    flower: createShape('flower'),
  }), []);

  const initial = useMemo(
    () => new Float32Array(targets.heart),
    [targets]
  );

  useFrame(({ clock }) => {
    if (!group.current || !geometry.current || reducedMotion) {
      return;
    }

    const attribute = geometry.current.attributes.position;
    const positions = attribute.array;
    const destination = targets[shape];

    for (let i = 0; i < positions.length; i += 1) {
      positions[i] += (destination[i] - positions[i]) * 0.045;
    }

    attribute.needsUpdate = true;

    group.current.rotation.y += (
      pointer.current[0] * 0.22
      - group.current.rotation.y
    ) * 0.035;

    group.current.rotation.x += (
      -pointer.current[1] * 0.12
      - group.current.rotation.x
    ) * 0.035;

    group.current.rotation.z =
      Math.sin(clock.elapsedTime * 0.22) * 0.045;

    group.current.position.y =
      Math.sin(clock.elapsedTime * 0.65) * 0.12;
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry ref={geometry}>
          <bufferAttribute
            attach="attributes-position"
            args={[initial, 3]}
          />
        </bufferGeometry>

        <pointsMaterial
          color="#ffc6ec"
          size={0.057}
          sizeAttenuation
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

function Starfield({ reducedMotion }) {
  const stars = useRef();

  const positions = useMemo(() => {
    const result = new Float32Array(850 * 3);

    for (let i = 0; i < 850; i += 1) {
      result[i * 3] = (random(i + 311) - 0.5) * 22;
      result[i * 3 + 1] = (random(i + 571) - 0.5) * 13;
      result[i * 3 + 2] = -2 - random(i + 997) * 5;
    }

    return result;
  }, []);

  useFrame((_, delta) => {
    if (stars.current && !reducedMotion) {
      stars.current.rotation.z += delta * 0.0015;
    }
  });

  return (
    <points ref={stars}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>

      <pointsMaterial
        color="#c7b6ff"
        size={0.023}
        transparent
        opacity={0.65}
        depthWrite={false}
      />
    </points>
  );
}

export default function CelestialScene({
  shape,
  pointer,
  reducedMotion
}) {
  return (
    <div className="celestial-scene" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 48 }}
        dpr={[1, 1.75]}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: 'high-performance'
        }}
        frameloop={reducedMotion ? 'demand' : 'always'}
      >
        <Starfield reducedMotion={reducedMotion} />

        <LoveParticles
          shape={shape}
          pointer={pointer}
          reducedMotion={reducedMotion}
        />
      </Canvas>
    </div>
  );
}