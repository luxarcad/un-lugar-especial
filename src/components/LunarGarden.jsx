
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ArrowUpRight, Flower2, MoonStar, Sparkles } from 'lucide-react';
import * as THREE from 'three';

const OUTER_PETALS = Array.from({ length: 7 }, (_, index) => index);
const INNER_PETALS = Array.from({ length: 6 }, (_, index) => index);
const PI2 = Math.PI * 2;

function random(seed) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

// Creamos la geometría curva de un pétalo.
function petalGeometry() {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const indices = [];
  const segments = 20;
  const sides = 8;

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const width = 0.36 * Math.pow(Math.sin(Math.PI * t), 0.78);

    for (let j = 0; j <= sides; j += 1) {
      const s = (j / sides) * 2 - 1;

      positions.push(
        t * 0.98,
        Math.sin(t * Math.PI) * 0.16 + t * t * 0.15,
        s * width + Math.sin(s * Math.PI) * 0.025
      );
    }
  }

  for (let i = 0; i < segments; i += 1) {
    for (let j = 0; j < sides; j += 1) {
      const a = i * (sides + 1) + j;
      const b = a + sides + 1;

      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );

  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

// Nuestra luna.
function Moon() {
  return (
    <group position={[0, 5.25, -7.5]}>
      <mesh>
        <sphereGeometry args={[1.45, 48, 48]} />
        <meshBasicMaterial color="#fff2df" />
      </mesh>

      <mesh>
        <sphereGeometry args={[1.72, 32, 32]} />
        <meshBasicMaterial
          color="#e5b8ff"
          transparent
          opacity={0.10}
          depthWrite={false}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[2.18, 32, 32]} />
        <meshBasicMaterial
          color="#d193ff"
          transparent
          opacity={0.045}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// Campo de estrellas del jardín.
function NightStars() {
  const positions = useMemo(() => {
    const array = new Float32Array(600 * 3);

    for (let i = 0; i < 600; i += 1) {
      array[i * 3] = (random(i + 1) - 0.5) * 24;
      array[i * 3 + 1] = random(i + 411) * 12;
      array[i * 3 + 2] = -5 - random(i + 813) * 10;
    }

    return array;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>

      <pointsMaterial
        color="#ead6ff"
        size={0.035}
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// Luciérnagas que se mueven lentamente por el jardín.
function Fireflies({ reducedMotion }) {
  const particles = useRef(null);

  const { initial, phases } = useMemo(() => {
    const positions = new Float32Array(75 * 3);
    const offsets = new Float32Array(75);

    for (let i = 0; i < 75; i += 1) {
      positions[i * 3] = (random(i + 73) - 0.5) * 13;
      positions[i * 3 + 1] =
        0.25 + random(i + 173) * 3.7;
      positions[i * 3 + 2] =
        (random(i + 243) - 0.5) * 6;

      offsets[i] = random(i + 99) * PI2;
    }

    return { initial: positions, phases: offsets };
  }, []);

  const positions = useMemo(
    () => new Float32Array(initial),
    [initial]
  );

  useFrame(({ clock }) => {
    if (reducedMotion || !particles.current) return;

    const attribute =
      particles.current.geometry.attributes.position;

    const time = clock.elapsedTime;

    for (let i = 0; i < phases.length; i += 1) {
      const k = i * 3;

      attribute.array[k] =
        initial[k] +
        Math.sin(time * 0.6 + phases[i]) * 0.13;

      attribute.array[k + 1] =
        initial[k + 1] +
        Math.cos(time * 0.8 + phases[i]) * 0.18;
    }

    attribute.needsUpdate = true;
  });

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>

      <pointsMaterial
        color="#ffd8ac"
        size={0.065}
        transparent
        opacity={0.92}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Cada flor es un objeto independiente.
// El color y la carta provienen de letters.js.
function Flower({
  letter,
  position,
  index,
  selected,
  onSelect,
  onHover,
  reducedMotion
}) {
  const flower = useRef(null);
  const core = useRef(null);

  const outer = useRef([]);
  const inner = useRef([]);
  const progress = useRef(0.2);

  const invalidate = useThree((state) => state.invalidate);
  const geometry = useMemo(() => petalGeometry(), []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const applyBloom = useCallback((value) => {
    outer.current.forEach((petal) => {
      if (petal) {
        petal.rotation.z = THREE.MathUtils.lerp(
          1.15,
          0.10,
          value
        );
      }
    });

    inner.current.forEach((petal) => {
      if (petal) {
        petal.rotation.z = THREE.MathUtils.lerp(
          1.38,
          0.35,
          value
        );
      }
    });

    if (core.current) {
      core.current.scale.setScalar(0.9 + value * 1.3);
    }
  }, []);

  // Sin movimiento continuo si el usuario lo desactivó.
  useEffect(() => {
    if (!reducedMotion) return;

    const value = selected ? 1 : 0.23;

    progress.current = value;
    applyBloom(value);
    invalidate();
  }, [selected, reducedMotion, applyBloom, invalidate]);

  useFrame(({ clock }, delta) => {
    if (reducedMotion) return;

    progress.current = THREE.MathUtils.damp(
      progress.current,
      selected ? 1 : 0.23,
      selected ? 2.65 : 1.8,
      delta
    );

    applyBloom(progress.current);

    if (flower.current) {
      flower.current.rotation.z =
        Math.sin(
          clock.elapsedTime * 0.63 + index * 1.5
        ) * 0.025;

      flower.current.position.y =
        Math.sin(
          clock.elapsedTime * 0.9 + index
        ) * 0.035;
    }
  });

  return (
    <group position={position}>
      <group ref={flower}>

        {/* TALLO */}

        <mesh position={[0, 0.78, 0]}>
          <cylinderGeometry
            args={[0.025, 0.06, 1.56, 10]}
          />

          <meshStandardMaterial
            color="#516b71"
            emissive="#24425c"
            emissiveIntensity={0.25}
          />
        </mesh>

        {/* HOJAS */}

        <mesh
          position={[-0.19, 0.53, 0]}
          rotation={[0, 0, -0.5]}
          scale={[0.22, 0.5, 0.09]}
        >
          <sphereGeometry args={[1, 12, 12]} />

          <meshStandardMaterial
            color="#466e68"
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh
          position={[0.19, 0.79, 0]}
          rotation={[0, 0, 0.55]}
          scale={[0.20, 0.42, 0.08]}
        >
          <sphereGeometry args={[1, 12, 12]} />

          <meshStandardMaterial
            color="#466e68"
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* CORONA DE LA FLOR */}

        <group position={[0, 1.55, 0]}>

          {/* SIETE PÉTALOS EXTERIORES */}

          {OUTER_PETALS.map((petal) => (
            <group
              key={`outer-${petal}`}
              rotation={[0, (petal / 7) * PI2, 0]}
            >
              <group
                ref={(node) => {
                  outer.current[petal] = node;
                }}
                rotation={[0, 0, 1.15]}
              >
                <mesh geometry={geometry}>
                  <meshStandardMaterial
                    color={letter.accent}
                    emissive={letter.accent}
                    emissiveIntensity={0.75}
                    transparent
                    opacity={0.9}
                    side={THREE.DoubleSide}
                    roughness={0.35}
                    metalness={0.15}
                    depthWrite={false}
                  />
                </mesh>
              </group>
            </group>
          ))}

          {/* SEIS PÉTALOS INTERIORES */}

          {INNER_PETALS.map((petal) => (
            <group
              key={`inner-${petal}`}
              rotation={[
                0,
                ((petal + 0.5) / 6) * PI2,
                0
              ]}
            >
              <group
                ref={(node) => {
                  inner.current[petal] = node;
                }}
                rotation={[0, 0, 1.38]}
                scale={0.72}
              >
                <mesh geometry={geometry}>
                  <meshStandardMaterial
                    color="#fff3f8"
                    emissive={letter.accent}
                    emissiveIntensity={1.1}
                    transparent
                    opacity={0.84}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                  />
                </mesh>
              </group>
            </group>
          ))}

          {/* HALO CENTRAL */}

          <mesh ref={core} scale={1}>
            <sphereGeometry args={[0.17, 20, 20]} />

            <meshBasicMaterial
              color={letter.accent}
              transparent
              opacity={0.18}
              depthWrite={false}
            />
          </mesh>

          {/* NÚCLEO LUMINOSO */}

          <mesh>
            <sphereGeometry args={[0.115, 24, 24]} />

            <meshStandardMaterial
              color="#fff5da"
              emissive={letter.accent}
              emissiveIntensity={2.5}
            />
          </mesh>
        </group>

        {/* ÁREA INVISIBLE PARA TOCAR LA FLOR */}

        <mesh
          position={[0, 1.55, 0]}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(letter);
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            onHover(true);
          }}
          onPointerOut={() => onHover(false)}
        >
          <sphereGeometry args={[1.0, 12, 12]} />

          <meshBasicMaterial
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

// La cámara responde suavemente al movimiento del cursor.
function CameraDrift({ reducedMotion }) {
  useFrame(({ camera, pointer }, delta) => {
    if (reducedMotion) return;

    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      pointer.x * 0.45,
      1.1,
      delta
    );

    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      5.4 + pointer.y * 0.16,
      1.1,
      delta
    );

    camera.lookAt(0, 1.2, 0);
  });

  return null;
}

// Escenario completo del jardín.
function GardenScene({
  letters,
  selectedId,
  onSelect,
  onHover,
  reducedMotion
}) {
  const { size } = useThree();
  const compact = size.width < 680;

  // Distribución adaptable de flores.
  const positions = useMemo(() => {
    const columns = compact
      ? 2
      : Math.min(Math.max(letters.length, 1), 5);

    return letters.map((_, index) => {
      const row = Math.floor(index / columns);
      const column = index % columns;

      const inRow = Math.min(
        columns,
        letters.length - row * columns
      );

      return [
        (column - (inRow - 1) / 2) *
          (compact ? 2.27 : 2.55),

        0,

        0.8 - row * (compact ? 1.6 : 1.45)
      ];
    });
  }, [compact, letters]);

  return (
    <>
      <color attach="background" args={["#080516"]} />

      <fog
        attach="fog"
        args={["#080516", 11, 27]}
      />

      <ambientLight intensity={1.0} />

      <hemisphereLight
        args={["#bfa7ff", "#120a1d", 1.4]}
      />

      <pointLight
        position={[0, 5, 3]}
        color="#f7b2e2"
        intensity={28}
        distance={14}
        decay={2}
      />

      <pointLight
        position={[-5, 3, -1]}
        color="#867aff"
        intensity={15}
        distance={12}
        decay={2}
      />

      <CameraDrift reducedMotion={reducedMotion} />

      <Moon />
      <NightStars />
      <Fireflies reducedMotion={reducedMotion} />

      {/* SUELO OSCURO */}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.06, 0]}
      >
        <circleGeometry args={[15, 64]} />

        <meshStandardMaterial
          color="#100b23"
          roughness={0.98}
        />
      </mesh>

      {/* FLORES Y SUS HALOS */}

      {letters.map((letter, index) => (
        <group key={letter.id}>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[
              positions[index][0],
              -0.045,
              positions[index][2]
            ]}
          >
            <circleGeometry args={[1.2, 32]} />

            <meshBasicMaterial
              color={letter.accent}
              transparent
              opacity={0.075}
              depthWrite={false}
            />
          </mesh>

          <Flower
            letter={letter}
            index={index}
            position={positions[index]}
            selected={selectedId === letter.id}
            onSelect={onSelect}
            onHover={onHover}
            reducedMotion={reducedMotion}
          />
        </group>
      ))}
    </>
  );
}

// Componente listo para insertar en App.jsx.
export default function LunarGarden({
  letters,
  onOpenLetter,
  reducedMotion
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [hovered, setHovered] = useState(false);
  const timer = useRef(null);

  useEffect(
    () => () => window.clearTimeout(timer.current),
    []
  );

  const selectFlower = useCallback((letter) => {
    window.clearTimeout(timer.current);

    setSelectedId(letter.id);

    timer.current = window.setTimeout(() => {
      onOpenLetter(letter);
      setHovered(false);
    }, reducedMotion ? 0 : 1000);
  }, [onOpenLetter, reducedMotion]);

  return (
    <section
      className="lunar-garden"
      id="jardin"
      aria-labelledby="garden-heading"
    >
      {/* ESCENARIO THREE.JS */}

      <div
        className="lunar-garden__scene"
        style={{
          cursor: hovered ? 'pointer' : 'default'
        }}
        aria-hidden="true"
      >
        <Canvas
          camera={{
            position: [0, 5.4, 13.5],
            fov: 44
          }}
          dpr={[1, 1.6]}
          gl={{
            alpha: false,
            antialias: false,
            powerPreference: 'high-performance'
          }}
          frameloop={
            reducedMotion ? 'demand' : 'always'
          }
        >
          <GardenScene
            letters={letters}
            selectedId={selectedId}
            onSelect={selectFlower}
            onHover={setHovered}
            reducedMotion={reducedMotion}
          />
        </Canvas>
      </div>

      {/* ENCABEZADO */}

      <div className="lunar-garden__intro">
        <p className="eyebrow">
          <MoonStar size={16} />
          EL LUGAR DONDE FLORECEN LAS PALABRAS
        </p>

        <h2 id="garden-heading">
          El jardín <em>lunar.</em>
        </h2>

        <p>
          Cada flor nació de algo que nunca quise olvidar.
          Acércate y descubre lo que guarda.
        </p>
      </div>

      {/* ACCESOS A LAS FLORES */}

      <div className="lunar-garden__legend">
        <span className="lunar-garden__hint">
          <Sparkles size={15} />
          TOCA UNA FLOR PARA ABRIR SU CARTA
        </span>

        <div
          className="lunar-garden__letters"
          aria-label="Elegir una carta del jardín"
        >
          {letters.map((letter) => (
            <button
              key={letter.id}
              type="button"
              className={`garden-seed ${
                selectedId === letter.id
                  ? 'garden-seed--active'
                  : ''
              }`}
              style={{
                '--seed-color': letter.accent
              }}
              onClick={() => selectFlower(letter)}
              aria-label={
                `Hacer florecer: ${letter.title}`
              }
            >
              <span className="garden-seed__number">
                {letter.number}
              </span>

              <Flower2 size={17} />

              <span className="garden-seed__name">
                {letter.title}
              </span>

              <ArrowUpRight
                size={15}
                className="garden-seed__arrow"
              />
            </button>
          ))}
        </div>
      </div>

      <span className="lunar-garden__signature">
        NO TODAS LAS FLORES NECESITAN SOL PARA FLORECER ✦
      </span>
    </section>
  );
}
