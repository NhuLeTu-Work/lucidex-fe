# Hyperframes Composition Brief: Lucidex

## Objective
Create a short launch-style brag video for Lucidex — a digital credential
platform (issue → own/share under consent → verify with an audit trail).

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 22.2 seconds

## Source Material
- Project root: `D:/work/lucidex/lucidex-fe`
- Primary files read: `index.html`, `src/index.css`, `src/pages/LandingPage.tsx`,
  `src/i18n/en.ts`, `src/components/owner/OwnerShareCodeWidget.tsx`,
  `src/components/verifier/VerifierVerify.tsx`, `src/app/router.tsx`,
  `package.json`, `info.md`
- Product name: **Lucidex**
- Tagline / strongest claim: `Verify degrees in 30 seconds. Full audit trail compliance.`
- Key UI or visual moment to recreate:
  1. The owner's **Credential Share Code** card with its two consent chips
     (`5 times`, `24 hours`) — from `OwnerShareCodeWidget.tsx`
  2. The verifier's **single-verify** row (mono input + black `Check` button)
     resolving to the `Credential Valid` state — from `VerifierVerify.tsx`
- Copy that must appear verbatim (all strings are the product's own, from
  `src/i18n/en.ts` unless noted):
  - `THE NEW STANDARD FOR DIGITAL CREDENTIALS`
  - `Secure. Instant. Auditable.`
  - `Credential Share Code`
  - `Max access count` / `5 times`
  - `Validity period` / `24 hours`
  - `Verify Credential`
  - `Enter verification code`
  - `Check`
  - `Credential Valid`
  - `Owner Name`, `Institution`, `Degree Type`, `Issue Date`
  - `Immutable Audit Trail`
  - `Verify degrees in 30 seconds.`
  - `Lucidex`

## Creative Direction
- Tone preset: `polished`
- Creative direction: **high-tech tối giản premium** — minimalist,
  instrument-grade, the restraint is the flex
- Interpretation: 4 scenes, long holds, soft 0.6–0.8s crossfades. Short-travel,
  heavily eased motion (nothing travels more than ~24px, nothing bounces,
  nothing spins). Type is light-to-medium with generous tracking, except the
  Inter 900 display headline. Colour is withheld for the first ~14.5 seconds so
  that a single green border reads as an event.
- Angle: Trust made visible. A monochrome film in which the only colour is the
  green that appears the instant a credential is proven real. The product's own
  design language (Inter Black display, JetBrains Mono data, `#000` surfaces,
  one `#22c55e` verified state) *is* the art direction — nothing invented. The
  video shows the actual handshake the product exists for: a code minted under
  the owner's consent, and a stranger turning that code into a verified degree.
- Hook: pure black, then `THE NEW STANDARD FOR DIGITAL CREDENTIALS` arriving
  word by word via the project's own `blurReveal` keyframe (blur 8px → 0,
  `rotateY(90deg) rotateX(45deg)` → 0, `translateY(20px)` → 0).
- Outro / punchline: `Verify degrees in 30 seconds.` → the `Lucidex` mark with
  `Secure. Instant. Auditable.` tracked out in mono beneath it.
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals, gradients, particles, glass morphism
  - Any colour other than the single `#22c55e` accent
  - Unrelated visual redesign — do not invent a brand that is not in the CSS

## Visual Identity
- Background: `#000000` (`--ct-bg`, dark theme)
- Surface: `#0a0a0a` (`--ct-surface`)
- Border: `#333333` (`--ct-border`)
- Text: `#f9f9f9` (`--ct-text`)
- Secondary text: `#999999` (`--ct-text-secondary`)
- Accent: `#22c55e` (the verified green from `.drop-zone.verified`) — withheld
  until scene 3
- Display font: Inter 900, `letter-spacing: -0.02em` (the `.font-display` class)
- Body font: Inter 300/400/600
- Data font: JetBrains Mono 400/500 (the `.font-mono-ct` class)
- Visual references from the project:
  - `@keyframes blurReveal` in `src/index.css` — the hero entrance
  - Rounded `#0a0a0a`-on-`#000` cards with hairline `#333333` borders
  - Mono pill chips with hairline borders for the consent settings
  - The black `Check` button (`background: #000`, white text, `rounded-xl`)
  - The closing mark is the `Lucidex` wordmark in Inter 900; the bundled logo
    PNGs are full lockups that already contain the wordmark, so no image is used

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. **Hook / the claim** — clip 0.0→5.6 — the hero headline arriving word by
   word on black, then `Secure. Instant. Auditable.` in tracked mono.
2. **The owner mints a share code** — clip 5.0→11.5 — a credential card; the
   two consent chips arrive at 6.56s and 7.64s, then scrambling mono glyphs
   resolve into the share code, settling at 8.74s.
3. **A stranger verifies it** — clip 10.9→17.8 — the code types into the mono
   field, a cursor presses `Check` at 13.11s, a held second of spinner, then the
   `#22c55e` `Credential Valid` state with four mono record rows and the
   `Immutable Audit Trail` receipt line.
4. **The mark** — clip 17.2→22.2 — `Verify degrees in 30 seconds.` landing at
   18.56s, then the `Lucidex` mark.

## Audio
- Audio role: sparse professional accents over a restrained bed
- Audio arc: a flat low bed runs the whole film carrying only three sound
  events — a soft drop when the code is minted, a clean click when the verifier
  commits, one deep bell the instant the credential is proven real — then the
  bed ducks and fades out under the mark. The film ends quieter than it started.
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` (steady and
  clean; the `polished` pick)
- Music treatment: `data-volume` ≈ 0.26 flat from 0.0; duck to ~0.16 at ~19.6s
  under the logo; fade to 0 across the final 1.2s. No swell, no build.
- Music cue guidance: bundled preset —
  `assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`
  (tempo ~110 BPM). Three strong-cue locks: **8.74s** (share code resolves),
  **13.11s** (`Check` pressed), **18.56s** (closing claim lands). Beat-grid pair
  for the consent chips: **6.56s** and **7.64s** — every *other* beat, so each
  chip clears the ~0.8s reading floor. Ignore any cue that shortens a read.
- Audio-reactive treatment: subtle. Let the credential card's surface elevation
  and the hero's faint radial vignette breathe a few percent with music RMS.
  Nothing that moves text. No waveform, bars, particles, or strobing. If the
  extraction helper or FFmpeg is unavailable, skip audio-reactive and note it —
  do not block the render.
- Audio-coupled moments:
  - Scene 2, 8.74s — the mono code finishes settling → one gentle drop cue
    (explicitly NOT a per-character keypress layer)
  - Scene 3, ~11.2–12.8s — code types into the field → a very thin low-volume
    keypress layer, or nothing; pick whichever reads as more restrained
  - Scene 3, 13.11s — simulated cursor press on `Check` → one clean UI click
  - Scene 3, ~14.5s — border turns `#22c55e` → one deep bell, the single
    "event" sound in the video
  - Scene 4, 18.56s — closing claim lands → nothing; the bell already paid off
- SFX selection guidance: 3–4 cues total, all soft, all aligned to the *start*
  of the motion they score. Suggested families only: `interface/drop_*` for the
  code settling, `interface/click_*` or `ui/mouseclick1` for the `Check` press,
  `impact/impactBell_heavy_000` for the valid state. Nothing percussive,
  nothing above 0.7 volume, no sound on text entrances or crossfades.
- SFX analysis guidance: read
  `~/.claude/plugins/cache/brag/brag/0.2.2/skills/brag/assets/sfx/sfx-analysis.md`
  and prefer low high-frequency-risk files — every cue here is a polished
  moment.
- Exact SFX choice: Hyperframes should choose filenames, timestamps, density,
  and volume based on the implemented animation.
- Audio files: copy the chosen music and SFX into
  `brag-output/composition/assets/`. Reference them with paths relative to
  `composition/`. Never absolute paths.

## Hyperframes Instructions
Load the composition-building Hyperframes domain skills — `hyperframes-core`
(composition contract + `data-*` timing), `hyperframes-animation` (motion),
`hyperframes-creative` (design spec, beats, audio-reactive),
`hyperframes-keyframes` (seek-safe keyframes), and `hyperframes-cli`
(lint/check/render). `/brag` is its own workflow: do not enter the
`hyperframes` entry-point intent interview and do not route into its generic
promo / launch-video workflow. Prefer native Hyperframes conventions over
anything in `/brag`.

Requirements:
- Show at least one real UI, copy, or visual element from the source project.
- Keep all text readable in the final render (≥0.8s settled for a short label,
  ~0.3s per word for a sentence).
- Keep the video within 15–25 seconds (target 22.2s).
- Include the planned music/SFX layer.
- Treat the `/brag` audio notes as guidance, not a fixed cue sheet. Choose SFX
  after the visual animation exists.
- Treat music cue metadata as optional timing hints; ignore cues that hurt
  readability, pacing, or the product story. Use only the three strong-cue locks
  listed above.
- Major reveals may move toward a nearby strong cue within ~0.15s; smaller
  entrances may align to nearby beats within ~0.10s.
- Honour the planned music duck and fade-out under the mark.
- Use local assets for audio and any runtime dependency where possible.
- Run `npx hyperframes check` before render — it is brag's single gate.
