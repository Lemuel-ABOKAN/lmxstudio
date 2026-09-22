# LMX STUDIO — Portfolio

Site vitrine premium d'un **Creative Developer** (Designer & Développeur web).
100 % frontend — aucun PHP, base de données, backend ou authentification.

**Stack :** HTML5 · CSS3 · JavaScript ES6+ · GSAP · ScrollTrigger · SVG (Three.js seulement si réellement nécessaire).

---

## Direction artistique — « Matière & Lumière »

Le site est traité comme une **chambre noire** : le contenu est *révélé par la lumière*,
comme l'arête dorée révèle le X du logo. Chaque animation sert la révélation, la
hiérarchie ou la navigation — jamais la décoration.

- **Fond** : noir profond sculpté par la lumière (pas par la couleur).
- **Matière** : argent brossé (typo, arêtes, UI).
- **Accent** : un unique filet doré, ~1 % de la surface, toujours en *ligne* ou *point*.

---

## État du projet — ÉTAPE 01 : Design System ✅

Les fondations visuelles sont posées. **Aucune section du site n'est encore construite.**

Pour prévisualiser le design system :

```bash
node .dev-server.js
```

Puis ouvrir <http://localhost:8777/styleguide.html> (page de référence, `noindex`).

---

## Architecture

```
/
├── index.html            (à venir)
├── styleguide.html       référence du design system (non indexée)
├── css/
│   ├── reset.css         reset moderne, terrain neutre
│   ├── variables.css     ★ tous les design tokens
│   ├── style.css         base, typo, boutons, liens, grille, surfaces
│   ├── responsive.css    contrat de breakpoints (mobile ≠ desktop réduit)
│   └── animations.css    keyframes, primitives de reveal, reduced-motion
├── js/                   (modules ES6 à venir : main, animations, cursor,
│                          navigation, projects, utils)
├── assets/
│   ├── images/
│   │   ├── lmx-logo.png
│   │   └── about/        portrait-ambient.jpg · portrait-cutout.jpg
│   ├── icons/
│   └── fonts/            (Clash Display + Inter self-hosted à venir)
└── README.md
```

---

## Design tokens (`css/variables.css`)

| Catégorie | Contenu |
|---|---|
| **Couleurs** | valeurs brutes + rôles sémantiques (`--bg`, `--text`, `--accent`…) + triplets RGB pour l'alpha |
| **Métal** | dégradés `--metal-silver`, `--metal-gold-edge` (réservés au wordmark & moments signature) |
| **Typographie** | familles (display / body / mono), poids, échelle fluide `clamp()`, line-height, letter-spacing |
| **Espacements** | rythme 8px (`--space-*`) + gaps de section fluides |
| **Grille** | 12 colonnes, gouttières fluides, largeurs max, `--measure` (62ch) |
| **Radius / Bordures** | arêtes nettes (métal), hairlines argentées |
| **Profondeur** | ombres = obscurité + rim métallique (pas de drop-shadow gris) |
| **Lumière** | `--glow-gold-*`, ligne de lumière signature, wash ambiant |
| **Z-index** | échelle nommée, zéro magic number |
| **Motion** | durées + easings cinématiques (`transform`/`opacity` uniquement) |
| **UI** | curseur custom, focus, hauteurs de contrôles, tap targets 44px |

### Palette

| Token | Hex | Rôle |
|---|---|---|
| `--c-black` | `#050505` | fond scénique |
| `--c-dark` | `#0B0B0B` | sections alternées |
| `--c-dark-grey` | `#151515` | surfaces / cartes |
| `--c-silver` | `#D8D8D8` | texte secondaire, UI métal |
| `--c-white` | `#F5F5F5` | titres, texte principal |
| `--c-gold` | `#C99A4A` | **accent unique** (lumière, jamais un aplat) |

---

## Principes tenus dès les fondations

- **Responsive** : mobile n'est pas un desktop réduit — la grille passe de 12 → 8 → 4 colonnes, l'échelle typo se recalibre, hover-only neutralisé au tactile.
- **Performance** : uniquement `transform` / `opacity` animés ; `will-change` ciblé.
- **Accessibilité** : `:focus-visible` avec anneau doré, skip-link, `.visually-hidden`, cibles 44px, contrastes AA.
- **Motion** : `prefers-reduced-motion` ramène chaque animation à son état final lisible.

---

## Prochaines étapes (en attente de validation)

- ÉTAPE 02 — structure HTML sémantique + head SEO/OG + intégration fonts self-hosted
- ÉTAPE 03 — Hero « révélation métal »
- puis navigation, curseur, sections Work / Approche / About / Contact, GSAP timelines.
