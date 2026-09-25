# LMX STUDIO — Portfolio

Site vitrine premium d'un **Creative Developer** (Designer & Développeur web).
100 % frontend — aucun PHP, base de données, backend ou authentification.

**Stack :** HTML5 · CSS3 · JavaScript ES6+ · GSAP · ScrollTrigger · SVG.

---

## Direction artistique — « Matière & Lumière »

Le site est traité comme une **chambre noire** : le contenu est *révélé par la lumière*,
comme l'arête dorée révèle le X du logo. Chaque animation sert la révélation, la
hiérarchie ou la navigation — jamais la décoration.

- **Fond** : noir profond sculpté par la lumière (pas par la couleur).
- **Matière** : argent brossé (typo, arêtes, UI).
- **Accent** : un unique filet doré, ~1 % de la surface, toujours en *ligne* ou *point*.

---

## État du projet

Le site est **construit et complet** : preloader, header, menu plein écran, hero,
projets, agence, services, stack technique, process, contact et footer.

Prévisualiser en local :

```bash
node .dev-server.js
```

- Site : <http://localhost:8777/index.html>
- Référence du design system : <http://localhost:8777/styleguide.html> (`noindex`)

---

## Architecture

```
/
├── index.html            le site
├── styleguide.html       référence du design system (non indexée)
├── css/
│   ├── reset.css         reset moderne + baseline tactile
│   ├── variables.css     ★ tous les design tokens
│   ├── style.css         base, composants et sections
│   ├── responsive.css    contrat de breakpoints (mobile ≠ desktop réduit)
│   └── animations.css    keyframes, primitives de reveal, reduced-motion
├── js/
│   ├── utils.js          helpers + ★ vocabulaire de motion partagé (EASE / DUR)
│   ├── main.js           orchestrateur de boot + preloader (avec watchdog)
│   ├── navigation.js     header au scroll + état du menu (l'animation est en CSS)
│   ├── animations.js     hero + agence (GSAP / ScrollTrigger)
│   ├── cursor.js         curseur custom (pointeur fin uniquement)
│   ├── interactions.js   barre de progression + éléments magnétiques
│   └── projects.js · services.js · stack.js · process.js · contact.js
├── assets/images/        webp uniquement — les masters lourds ne sont pas versionnés
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
| **Motion** | budgets par fréquence (`--dur-press/hover/pop/menu`) + easings (`--ease-*`) |
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

`--text-faint` est à `rgba(silver, 0.55)` = **4,69:1** sur `--c-black`. C'est le
minimum qui passe WCAG AA. Ne pas le baisser sans remesurer.

---

## Règles tenues

**Motion — un seul vocabulaire.** Les courbes et durées existent en double, dans
`css/variables.css` (`--ease-*`, `--dur-*`) et dans `js/utils.js`
(`LMX.motion`), avec les paires documentées. Ne jamais écrire un cubic-bezier ni
un `"power3.out"` en dur : étendre les tokens.

**La durée suit la fréquence.** `--dur-press` (140ms) pour un appui,
`--dur-hover` (180ms) pour ce qui est vu des dizaines de fois par jour,
`--dur-menu` (320ms) pour un panneau occasionnel. Aucune animation d'UI ne
dépasse 300ms ; seules les révélations éditoriales vues une fois par visite ont
le droit d'être cinématiques.

**`ease-in` est proscrit sur l'UI.** Il retarde les premières frames, exactement
là où l'œil regarde : à durée égale, ça se ressent comme de la latence.

**Tout `:hover` vit derrière `@media (hover: hover) and (pointer: fine)`.** Le
tactile simule un hover au tap et le laisse collé. Le pendant obligatoire est un
`:active` : `reset.css` supprime le tap-highlight du navigateur, donc sans
`:active` un doigt n'a plus aucun retour du tout.

**Le site ne doit jamais dépendre de GSAP pour fonctionner.** Le preloader a un
watchdog `setTimeout` (rAF est throttlé dans un onglet d'arrière-plan) et le menu
mobile s'ouvre entièrement en CSS. GSAP n'ajoute que la couche cinématique.

**`prefers-reduced-motion` réduit, il ne supprime pas.** Les transitions de
mouvement sautent ; celles d'opacité et de couleur restent, plafonnées à 120ms,
parce que ce sont elles qui disent à l'utilisateur que l'interface a réagi.

**`will-change` seulement là où quelque chose bouge en continu** (parallaxe,
curseur). Une couche promue en permanence rasterise le texte en bitmap sur
mobile.

---

## Vérifier avant de livrer

- Ouvrir le site dans un **onglet d'arrière-plan** (⌘-clic) puis y revenir : le
  preloader doit déjà être parti et le scroll débloqué.
- Bloquer le CDN GSAP dans les devtools : le menu mobile doit rester ouvrable.
- Tester sur un **vrai téléphone**, pas en émulation. Le hover collé, le délai de
  tap, le rebond de scroll et les safe areas ne se reproduisent pas autrement.
