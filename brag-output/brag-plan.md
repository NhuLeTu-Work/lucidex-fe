# Brag Plan: Lucidex

## What is this app?
Lucidex is a digital credential platform where a university issues degrees in
bulk, the graduate owns and shares them behind a consent-scoped code, and an
employer verifies them in seconds with an immutable audit trail.

## The angle
Not a joke product — so the video is not a joke. The angle is **trust made
visible**: a monochrome, instrument-grade film where the only colour in the
entire 22 seconds is the green that appears the moment a credential is proven
real. Everything else is black, white, and monospace. The product's own design
language (Inter Black display, JetBrains Mono data, #000 surfaces, one green
verified state) *is* the creative direction — nothing invented, nothing
decorated.

The video earns its specificity by showing the actual handshake the product
exists for: a code is minted under the owner's consent, and a stranger turns
that code into a verified degree. That exchange is the whole company.

## Hook (first 2-3 seconds)
Pure black. The hero line arrives the way the app itself arrives — the real
`blurReveal` treatment from `src/index.css` (blur 8px → 0, slight 3D rotate,
20px rise) on the product's own headline:

**THE NEW STANDARD FOR DIGITAL CREDENTIALS**

No logo yet. No music swell. Just the claim, at full scale, holding.

## Key moments (the middle)
- **The share code being minted.** A credential card in the owner's portal.
  `Credential Share Code` label, then a monospace code resolving character by
  character into place — scrambling mono glyphs settling to a final value.
  Under it, the two real consent chips: `5 times` and `24 hours`. This is the
  product's actual consent model, not a generic "share" button.
- **The consent constraint stated plainly.** The chips are the point: the owner
  decided how many times and for how long. Hold them long enough to read.
- **The verification landing.** The verifier's mono input field, the code typed
  in, the black `Check` button pressed, a beat of nothing — then the border
  turns `#22c55e` and `Credential Valid` lands with the degree record beneath
  it: owner name, institution, degree type, issue date. First and only colour
  in the film.
- **The receipt.** A single mono line inside the verified panel, confirming
  the check was logged: `Immutable Audit Trail`.

## Outro / punchline
The product's own hardest number, used straight:

**Verify degrees in 30 seconds.**

Then the mark: `Lucidex` in Inter Black, with `Secure. Instant. Auditable.`
tracked out in mono beneath it. Hold on near-empty black. (The bundled logo
files are full lockups that already contain the wordmark, so the mark is the
type alone — the more minimal read anyway.)

## User flow worth showing
Three beats, taken from the real routed portals:

1. **Entry** — Owner portal (`src/components/owner/OwnerShareCodeWidget.tsx`):
   the owner opens the share code on one of their credentials.
2. **Key action** — the code is generated under consent settings
   (`max access count: 5 times`, `validity period: 24 hours`).
3. **Result** — Verifier portal (`src/components/verifier/VerifierVerify.tsx`):
   the code is pasted into the mono field, `Check` is pressed, and the
   `Credential Valid` state resolves with the degree record.

Scenes 2 and 3 are this flow. The landing-page hero is used once, as the frame
around it — not as a substitute for it.

## Tone
- Preset: `polished`
- Creative direction: high-tech tối giản premium — minimalist, instrument-grade,
  the restraint *is* the flex
- Interpretation: 4 scenes, long holds, soft 0.6-0.8s crossfades. Type is
  light-to-medium weight with generous tracking except the display headline.
  Motion is short-travel and heavily eased — nothing bounces, nothing spins,
  nothing slides more than ~24px. Colour is withheld for 14.4 seconds so that one
  green border reads as an event. Silence and negative space are load-bearing.

## Format: landscape — 1920x1080
## Duration: 22.2 seconds

## Visual identity (from the project)
- Background: `#000000` (`--ct-bg`, dark theme)
- Surface: `#0a0a0a` (`--ct-surface`), border `#333333` (`--ct-border`)
- Text: `#f9f9f9` (`--ct-text`), secondary `#999999` (`--ct-text-secondary`)
- Accent (withheld until scene 3): `#22c55e` — the verified green from
  `.drop-zone.verified` in `src/index.css`
- Display font: Inter 900, `letter-spacing: -0.02em` (the `.font-display` class)
- Body font: Inter 300/400
- Data font: JetBrains Mono 400/500 (the `.font-mono-ct` class)
- Strongest visual element: the `blurReveal` keyframe on the hero headline, and
  the black-on-black credential card with a single mono code in it

## Share copy (draft)
Shipped Lucidex — universities issue degrees in bulk, graduates share them with
a consent-scoped code, employers verify in 30 seconds. Every check is logged
immutably.

## Audio direction
- Role: sparse professional accents over a restrained bed
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` (steady and
  clean — the `polished` / `cinematic` pick)
- Music treatment: starts at 0.0 at volume 0.26, holds flat, ducks to ~0.16
  under the scene-4 mark (20.7s) and fades to 0 by 22.2s. No swell, no
  build. The bed is a floor, not a driver.
- Music cue guidance: bundled preset read —
  `assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`,
  tempo ~110 BPM. Three strong-cue locks: **8.74s** (share code resolves),
  **13.11s** (Check pressed), **17.47s** (closing claim lands). Beat-grid window
  for the two consent chips: **6.56s** and **7.64s** (every other beat, so each
  chip clears the reading floor). Restraint note: cues bias timing only — if a
  lock shortens a read, use natural timing.
- Audio-reactive treatment: subtle; use music RMS to let the credential card's
  surface elevation and the hero's faint vignette breathe by a few percent. No
  waveform, no bars, no particles. Nothing that moves text.
- SFX posture: sparse — 3 to 4 cues total, all soft, all motion-matched. A
  polished film with 10 SFX is not polished.
- Audio-coupled moments: the mono code settling (soft drop, once — not per
  character); the simulated `Check` press (one clean UI click); the
  `Credential Valid` border turning green (one deep bell, the only "event"
  sound in the video).
- Restraint rule: no sound on text entrances, no sound on crossfades, nothing
  percussive, nothing above 0.7 volume. If the code scramble tempts a
  per-character keypress layer — don't. One drop when it settles.

## Storyboard

### Scene 1 - Hook / the claim - clip 0.0 to 5.6 (content to 5.0, then a 0.6s crossfade)
Full black with a faint radial vignette. `THE NEW STANDARD FOR DIGITAL
CREDENTIALS` centred, Inter 900, `letter-spacing: -0.02em`, breaking to two
lines at 104px. Each word arrives with the project's own `blurReveal`:
blur 8px -> 0, `rotateY(90deg) rotateX(45deg)` -> 0, `translateY(20px)` -> 0,
opacity 0 -> 1, 0.78s ease `power3.out`, staggered 0.15s from t=0.35.
Fully settled ~1.88s, then holds ~3.1s.
At 3.0s `Secure. Instant. Auditable.` fades up beneath it in JetBrains Mono,
uppercase, tracked 0.34em, `#999999`, 22px. Settled 3.5s, holds 1.5s.
Sequential/interaction: yes - headline word by word (0.15s apart), then the
mono subline as one unit.
Audio intent: the bed enters already running, as if we joined it. No accent.
Audio-coupled idea: none - deliberately. The first sound event is in scene 2.
Music: steady, low, flat. Volume 0.26.
Transition mood: soft crossfade (0.6s) -> Scene 2

### Scene 2 - The owner mints a share code - clip 5.0 to 11.5 (content to 10.9)
The owner's credential card: `#0a0a0a` surface on `#000`, 1px `#333333` border,
28px radius, 1180px wide, floating centre-frame with a lot of black around it.
The card scales 0.988 -> 1 over 0.9s as it arrives - the only scale move in the
film. At 5.75s the real label `Credential Share Code` fades up in small tracked
mono `#999999`.
The code area runs a deterministic glyph scramble from 6.0s and resolves left to
right into `LCX-7F3A-92KD-4B1E` - JetBrains Mono 500, 86px - settling at
**8.74s**, beat-locked to the strongest cue in the window. It then holds
perfectly still and readable for 2.16s.
The two real consent chips arrive on alternating beats, 1.08s apart, both well
before the code settles so the resolve stays the scene's climax:
`Max access count / 5 times` at **6.56s** and `Validity period / 24 hours` at
**7.64s** - small mono in hairline `#333333` pills.
Sequential/interaction: yes - the code resolves character by character, and the
two consent chips arrive one by one on alternating beats.
Audio intent: the first moment anything is "made". One soft, low placement.
Audio-coupled idea: `interface/bong_001.ogg` at 8.70s, volume 0.42 - the instant
the code settles. Explicitly NOT a per-character keypress layer. Chips get none.
Music: unchanged, flat, 0.26.
Transition mood: soft crossfade (0.6s) -> Scene 3

### Scene 3 - A stranger verifies it - clip 10.9 to 17.8 (content to 17.2)
The verifier's single-verify panel. `Verify Credential` in Inter 600, 34px,
top-left of an 1180px block. Beneath it the real input row: a `#0a0a0a` field
with a `#333333` border and the mono placeholder `Enter verification code`, and
a `#f9f9f9` `Check` button with a black label (the app's dark-theme primary).
The result panel reserves its space from the start but is fully invisible
(transparent border, transparent fill), and the whole block sits 200px low so
the heading and input row read as centred; it settles up as the panel lands.
A cursor drifts in from 11.3s. The placeholder clears at 11.4s and the code
types in character by character 11.5 -> 12.75s behind a steady caret.
At **13.11s** - beat-locked - the cursor presses `Check`: the button compresses
to 0.98 and the caret vanishes. The label swaps for a spinner that turns twice
(0.55s each, finite) through a held 1.1s of nothing.
At 14.4s the result lands: the field border and the result panel go `#22c55e`
with a 5% green fill - the first colour in the film - `Credential Valid` sets in
Inter 600 beside a check glyph, and the block settles up 200px -> 0 over 0.6s.
At 14.65s the four mono record rows fade in as one block (not staggered - they
are read as a group): `Owner Name`, `Institution`, `Degree Type`, `Issue Date`.
At 14.8s the `Immutable Audit Trail` footer fades in below a hairline rule with
a `#22c55e` dot. The whole panel holds still and readable for ~2.4s.
Sequential/interaction: yes - simulated typing, a simulated cursor click on
`Check`, then the valid state resolving.
Audio intent: the payoff. Tension through the held second after the click,
released by one deep bell as the green lands.
Audio-coupled idea: `interface/click_003.ogg` at 13.11s, volume 0.45 (the
press); `impact/impactBell_heavy_000.ogg` at 14.40s, volume 0.50 (the green).
No typing SFX - the restraint rule won.
Music: unchanged underneath; the bell rings over it.
Transition mood: soft crossfade (0.6s) -> Scene 4

### Scene 4 - The mark - clip 17.2 to 22.2
Back to black with the vignette. The closing claim fades up from 18.06s and
lands settled at **18.56s** - beat-locked to the final strong cue - in Inter 900
at 92px: `Verify degrees in 30 seconds.` It holds 1.74s, comfortably past the
five-word reading floor.
At 20.3s it fades out, and at 20.4s the mark fades in as one unit: `Lucidex` in
Inter 900 at 84px with `Secure. Instant. Auditable.` in tracked mono beneath.
It holds 1.4s. The music ducks to 0.16 at 20.7s and fades to 0 by 22.2s, so the
last second is near-silent black with the mark still on screen.
Sequential/interaction: none - two held cards, the second replacing the first.
Audio intent: withdraw. The film ends quieter than it started.
Audio-coupled idea: none - the bell in scene 3 was the payoff.
Music: ducks then fades out completely.
Transition mood: fade to black - end

**Music mood for this video:** steady, clean, restrained corporate bed - present
but never leading.
**Audio summary:** A flat low bed runs the whole film with only three sound
events placed on it - a soft accent when the code is minted (8.70s), a clean
click when the verifier commits (13.11s), and one deep bell at the instant the
credential is proven real (14.40s) - before the bed ducks and fades under the
mark.

## Build notes (what shipped vs. what was planned)
- Total duration moved 20.8s -> **22.2s**: scene 3 and scene 4 each needed more
  hold to clear the reading floor for the record block and the closing claim.
- The `Immutable Audit Trail` line moved out of scene 4 and into the verified
  panel in scene 3, where it reads as a receipt on the verification rather than
  as a separate card fighting for its own hold.
- The consent chips moved *before* the code resolve (6.56s / 7.64s instead of
  after it), so the code settling stays the scene's climax and both chips get a
  long, still read.
- The closing-claim beat lock moved 17.47s -> **18.56s** (also a 0.99 strong
  cue) because 17.47s fell inside the scene 3 -> 4 crossfade.
- The logo image was dropped: both `public/logo-icon.png` and
  `logo-icon-rev.png` are full lockups that already contain the wordmark, so
  placing one beside the `Lucidex` type printed the name twice.
- Audio-reactive treatment was **not** implemented - see `DELIVERY.md`.
