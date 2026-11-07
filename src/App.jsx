import { useEffect, useRef, useState } from 'react';

import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Flower2,
  Heart,
  Infinity,
  MailOpen,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react';

import CelestialScene from './components/CelestialScene.jsx';
import LunarGarden from './components/LunarGarden.jsx';
import { letters, phrases } from './data/letters.js';

const shapes = [
  { id: 'heart', label: 'Corazón', Icon: Heart },
  { id: 'infinity', label: 'Infinito', Icon: Infinity },
  { id: 'flower', label: 'Flor lunar', Icon: Flower2 },
];

function LetterModal({ letter, onClose }) {
  const closeButton = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();

      if (event.key === 'Tab') {
        event.preventDefault();
        closeButton.current?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <article
        className="letter-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="letter-heading"
        style={{ '--letter-accent': letter.accent }}
      >
        <button
          ref={closeButton}
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar carta"
        >
          <X size={21} />
        </button>

        <div className="letter-sigil">
          <Heart size={20} fill="currentColor" />
        </div>

        <p className="eyebrow">
          UNA CARTA PARA TI · {letter.number}
        </p>

        <h2 id="letter-heading">{letter.title}</h2>

        <span className="letter-date">{letter.date}</span>

        <div className="letter-body">
          {letter.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <p className="letter-signature">
          {letter.signature} ♡
        </p>
      </article>
    </div>
  );
}

export default function App() {
  const [shape, setShape] = useState('heart');
  const [activeLetter, setActiveLetter] = useState(null);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const pointer = useRef([0, 0]);

  useEffect(() => {
    const media = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    const updateMotion = () => {
      setReducedMotion(media.matches);
    };

    updateMotion();
    media.addEventListener('change', updateMotion);

    const updatePointer = (event) => {
      pointer.current[0] =
        (event.clientX / window.innerWidth) * 2 - 1;

      pointer.current[1] =
        (event.clientY / window.innerHeight) * 2 - 1;

      document.documentElement.style.setProperty(
        '--pointer-x',
        `${event.clientX}px`
      );

      document.documentElement.style.setProperty(
        '--pointer-y',
        `${event.clientY}px`
      );
    };

    window.addEventListener('pointermove', updatePointer, {
      passive: true
    });

    return () => {
      media.removeEventListener('change', updateMotion);
      window.removeEventListener('pointermove', updatePointer);
    };
  }, []);

  const nextShape = () => {
    setShape((current) => {
      const index = shapes.findIndex(
        (item) => item.id === current
      );

      return shapes[(index + 1) % shapes.length].id;
    });
  };

  return (
    <div className="app-shell">
      <div className="cursor-light" aria-hidden="true" />
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <header className="site-header">
        <a
          className="brand"
          href="#inicio"
          aria-label="Amorosa, ir al inicio"
        >
          <span className="brand-mark">
            <Sparkles size={18} />
          </span>

          <span>
            amorosa<span className="brand-dot">.</span>
          </span>
        </a>

        <nav aria-label="Navegación principal">
          <a href="#historia">Nuestra magia</a>
          <a href="#cartas">Cartas</a>
          <a href="#siempre">Un deseo</a>
        </nav>

        <a className="header-link" href="#cartas">
          Algo para ti <ArrowUpRight size={16} />
        </a>
      </header>

      <main>
        {/* HERO PRINCIPAL */}

        <section className="hero" id="inicio">
          <CelestialScene
            shape={shape}
            pointer={pointer}
            reducedMotion={reducedMotion}
          />

          <div className="hero-aura" aria-hidden="true" />
          <div className="hero-grain" aria-hidden="true" />

          <div className="hero-content">
            <p className="eyebrow hero-eyebrow">
              <span /> UN PEQUEÑO UNIVERSO PARA TI
            </p>

            <h1>
              Entre infinitas<br />
              posibilidades,<br />
              <em>te encontré.</em>
            </h1>

            <p className="hero-description">
              Algunas personas llegan y lo cambian todo.
              Esta es una pequeña forma de decirte que,
              entre millones de estrellas, tú brillas diferente.
            </p>

            <div className="hero-actions">
              <a
                className="button button-primary"
                href="#cartas"
              >
                Leer mis cartas <ArrowUpRight size={18} />
              </a>

              <button
                className="button button-outline"
                onClick={nextShape}
              >
                Cambiar el universo <RefreshCw size={17} />
              </button>
            </div>
          </div>

          <div
            className="shape-controls"
            aria-label="Formas de partículas"
          >
            <span>DALE FORMA A ESTE AMOR</span>

            <div className="shape-buttons">
              {shapes.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  className={`shape-button ${
                    shape === id ? 'is-active' : ''
                  }`}
                  onClick={() => setShape(id)}
                  aria-label={`Mostrar ${label.toLowerCase()}`}
                  aria-pressed={shape === id}
                  title={label}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <a className="scroll-prompt" href="#historia">
            DESLIZA PARA DESCUBRIR
            <ArrowDown size={15} />
          </a>

          <span className="hero-coordinate">
            COORDENADAS: TÚ + YO · ∞
          </span>
        </section>

        {/* BANDA ANIMADA */}

        <div className="infinity-strip" aria-hidden="true">
          <div className="strip-track">
            {Array.from({ length: 4 }, (_, index) => (
              <span key={index}>
                TÚ ERES MI CASUALIDAD FAVORITA
                <i>✦</i>
                EN ESTA Y MIL VIDAS
                <i>✦</i>
              </span>
            ))}
          </div>
        </div>

        {/* HISTORIA */}

        <section
          className="story-section section-wrap"
          id="historia"
        >
          <div className="story-copy">
            <p className="eyebrow">
              <span className="tiny-star">✧</span>
              EL ARTE DE COINCIDIR
            </p>

            <h2>
              El universo es<br />
              inmenso. <em>Y aun así...</em>
            </h2>

            <p>
              Con tantas historias por vivir, tantas ciudades
              por recorrer y tantos caminos diferentes, hay
              algo extraordinario en que nuestras vidas hayan
              encontrado un mismo punto.
            </p>

            <p>
              No sé si existen los destinos escritos. Pero
              me encanta la idea de seguir escribiendo algo
              bonito contigo.
            </p>

            <a className="text-link" href="#cartas">
              Hay algo que quiero contarte
              <ArrowRight size={18} />
            </a>
          </div>

          <div className="orbit-art" aria-hidden="true">
            <div className="orbit-glow" />
            <div className="orbit-ring orbit-ring-one" />
            <div className="orbit-ring orbit-ring-two" />
            <div className="orbit-ring orbit-ring-three" />

            <span className="orbit-core">
              <Heart size={50} strokeWidth={1.2} />
            </span>

            <span className="orbit-star orbit-star-one">✦</span>
            <span className="orbit-star orbit-star-two">✧</span>
            <span className="orbit-label">DOS ALMAS. UN INFINITO.</span>
          </div>
        </section>

        {/* Jardin Lunar */}

        <LunarGarden
          letters={letters}
          onOpenLetter={setActiveLetter}
          reducedMotion={reducedMotion} />

        {/* CARTAS */}

        <section className="letters-section" id="cartas">
          <div className="section-wrap">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  <span className="tiny-star">✧</span>
                  PALABRAS QUE ME GUARDÉ
                </p>

                <h2>
                  Mi colección de <em>cartas.</em>
                </h2>
              </div>

              <p>
                No todas las cosas bonitas caben en una
                conversación. Algunas merecen su propio rincón.
              </p>
            </div>

            <div className="letters-grid">
              {letters.map((letter) => (
                <button
                  key={letter.id}
                  type="button"
                  className="letter-card"
                  onClick={() => setActiveLetter(letter)}
                  style={{
                    '--letter-accent': letter.accent
                  }}
                  aria-label={`Leer carta: ${letter.title}`}
                >
                  <span className="letter-card-top">
                    <span>{letter.number} / CARTA</span>
                    <MailOpen size={19} />
                  </span>

                  <span className="letter-card-orb">
                    <Heart size={30} strokeWidth={1.2} />
                  </span>

                  <span className="letter-card-category">
                    {letter.category}
                  </span>

                  <span className="letter-card-title">
                    {letter.title}
                  </span>

                  <span className="letter-card-preview">
                    {letter.preview}
                  </span>

                  <span className="letter-card-bottom">
                    ABRIR CARTA <ArrowUpRight size={17} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FRASES DINÁMICAS */}

        <section
          className="wish-section section-wrap"
          id="siempre"
        >
          <div className="wish-stars" aria-hidden="true">
            ✦　·　✧　·　✦
          </div>

          <p className="eyebrow">
            UN DESEO PEDIDO A LAS ESTRELLAS
          </p>

          <h2>
            Y si tuviera que decirte<br />
            solo una cosa...
          </h2>

          <p className="wish-phrase" key={phraseIndex}>
            “{phrases[phraseIndex]}”
          </p>

          <button
            className="button button-outline wish-button"
            onClick={() => {
              setPhraseIndex(
                (current) => (current + 1) % phrases.length
              );
            }}
          >
            Otra estrella, otra frase
            <Sparkles size={17} />
          </button>

          <span className="wish-counter">
            0{phraseIndex + 1} / 0{phrases.length}
          </span>
        </section>
      </main>

      {/* FOOTER */}

      <footer className="footer">
        <a className="brand" href="#inicio">
          <span className="brand-mark">
            <Sparkles size={16} />
          </span>
          amorosa<span className="brand-dot">.</span>
        </a>

        <span>
          Hecho con código, estrellas y un poquito de amor.
        </span>

        <a href="#inicio">VOLVER AL CIELO ↑</a>
      </footer>

      {/* MODAL DE CARTAS */}

      {activeLetter && (
        <LetterModal
          letter={activeLetter}
          onClose={() => setActiveLetter(null)}
        />
      )}
    </div>
  );
}