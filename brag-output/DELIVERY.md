# Delivery notes — Lucidex brag video

---

## ⚠ Blocked: the end card needs the mark-only asset

The end-card spec says to use `/landing/logo-mark.svg` — the Lucidex mark with
no "Lucidex" text under it — and to **stop and ask rather than crop a combined
file**. Neither referenced file exists:

| Referenced | Status |
| --- | --- |
| `/landing/logo-mark.svg` | **Missing.** `public/landing/` has only `logo-icon-rev.png`. |
| `/reference/lucidex-logo-endcard.html` | **Missing.** No `reference/` directory anywhere. |

Checked the main worktree and the `feature/landing-page` worktree. The only
logo assets in the repo are `public/logo-icon.png`, `public/logo-icon-rev.png`
and `public/landing/logo-icon-rev.png` — all three are **full lockups** that
already contain the wordmark, so cropping one would both violate the spec's
instruction and print "Lucidex" twice beside the text.

**So the end card ships with the wordmark only.** Everything else in the spec is
built and rendered. Note the spec makes "Lucidex" a *text* element (Inter 600),
not part of the asset — the only missing piece is the icon glyph. Dropping it in
is a one-line change at the two `MARK SLOT` comments in
`composition/index.html`; the flex lockup re-centres itself and nothing else
moves. Send me the mark-only SVG and I will re-render.

---

## Output

| File | What it is |
| --- | --- |
| `brag.mp4` | **Current English cut (v2).** 1920x1080, 30fps, 23.0s. Enlarged type + spark end card. |
| `brag-v1.mp4` | The previous English cut (22.2s, smaller type, plain wordmark outro). |
| `brag-vi.mp4` | Vietnamese cut, built from **v1** — not yet rebuilt with the v2 sizes or end card. |
| `brag-vi.jpg` | Vietnamese poster still (the settled `Bằng cấp Hợp lệ` panel). |
| `share-copy-vi.txt` | Vietnamese caption. |
| `brag.jpg` | English poster still (the settled `Credential Valid` panel). |
| `share-copy.txt` | English caption. |
| `brag-plan.md` | Plan, storyboard, and a build-notes section on what changed during authoring. |
| `composition-brief.md` | The Hyperframes handoff brief. |
| `composition/` | The Hyperframes project — currently holds the **Vietnamese** `index.html`. |
| `composition-en.index.html` | The English `index.html`, archived before the Vietnamese rewrite. |

### Re-rendering either language

`composition/index.html` is whichever language was built last (Vietnamese). To
go back to English, swap the archived file in:

```bash
cd brag-output
cp composition/index.html composition-vi.index.html
cp composition-en.index.html composition/index.html
cd composition && export PATH="$PWD/.bin:$PATH" && npx hyperframes render --quality looks --output ../brag.mp4
```

## v2 (current English cut) — what changed

**Bigger type for the landing-page embed.** The video plays inside the demo
frame, well under 1920px wide, so everything readable was scaled up:

| Element | v1 | v2 |
| --- | --- | --- |
| Share code | 86px | **112px** |
| Card width | 1180px | 1560px |
| Card label | 20px | 28px |
| Consent chip label / value | 17 / 28px | 22 / **38px** |
| Verify heading | 34px | 46px |
| Input field text | 30px | **42px** |
| `Check` button | 210px @ 26px | 280px @ 34px |
| `Credential Valid` | 36px | **50px** |
| Record label / value | 16 / 27px | 22 / **38px** |
| Audit line | 18px | 24px |
| Closing claim | 92px | 104px |

Scene 3's pre-result offset dropped 200px → 150px: at the larger size the
reserved (invisible) result panel was hanging 134px below the canvas, which the
layout audit flagged as `panel_out_of_canvas`.

**New end card replaces the plain wordmark outro.** Built to the supplied spec:
lockup fades in and scales 0.97 → 1 over 0.55s and is then completely static; a
spark crosses the **full frame** (not the lockup box) from -22% to 122% over
1.15s with ease-in-out, fading in over the first 6% of travel and out over the
last 10%; a white duplicate of the lockup masked to a ±60px band tracks the
spark so the logo catches the light; then a static hold. Total 2.1s, matching
the spec. Duration went 22.2s → **23.0s** to fit it.

Three deliberate departures from the spec, all because it was written as a web
implementation brief and this is a rendered composition:

- **No `requestAnimationFrame` loop.** The render contract requires one paused,
  seekable GSAP timeline — a rAF loop is non-deterministic and would not survive
  frame-by-frame seeking. Same timings, driven by the timeline.
- **`clamp()` / `vw` resolved to their maximums.** At a 1920px frame every clamp
  in the spec sits at its ceiling, so the mark is 84px, the wordmark 86px and
  the gap 30px — the values the spec itself would produce.
- **The separate radial background layer became a third box-shadow on the
  spark dot.** A 0.06-opacity gradient layer over pure black quantises to about
  13 alpha levels and rings visibly; blurring the source does not help because
  the banding appears at composite. A wide `0 0 190px 90px` shadow gives the
  same following ambient spill with a falloff fine enough not to band, and it
  tracks the spark for free. Verified against a snapshot before and after.

Not applicable in a render, so not implemented: the `ended`-event trigger,
`prefers-reduced-motion`, the IntersectionObserver stop, scroll-away reset, and
`npm run build` / `git diff` scope (nothing outside `brag-output/` was touched).
The AI-tool sparkle watermark was not reproduced, as instructed.

## Vietnamese cut — what changed

Copy comes from `src/i18n/vi.ts`, not from translation, so the video says
exactly what the app says:

| Moment | String | Source |
| --- | --- | --- |
| Hook | `TIÊU CHUẨN MỚI CHO BẰNG CẤP SỐ` | `heroTitle` |
| Subline / tagline | `Bảo mật. Tức thì. Kiểm chứng được.` | `heroSubtitle` |
| Card label | `Mã chia sẻ văn bằng` | `shareCodeTitle` |
| Consent chips | `Số lần truy cập tối đa · 5 lần` / `Thời gian hiệu lực · 24 giờ` | `maxAccessCountLabel`, `expireHoursLabel`, `timesUnit`, `hoursUnit` |
| Verify heading | `Xác minh Bằng cấp` | `verifyCredential` |
| Field placeholder | `Nhập mã chia sẻ...` | hardcoded in `VerifierVerify.tsx` |
| Button | `Kiểm tra` | `check` |
| Result | `Bằng cấp Hợp lệ` | `credentialValid` |
| Record labels | `Tên chủ sở hữu`, `Trường`, `Loại Bằng`, `Ngày Cấp` | `ownerName`, `institution`, `degreeType`, `issueDate` |
| Receipt | `Audit Trail Bất biến` | `step4` |
| Closing claim | `Xác minh bằng trong 30 giây.` | `featEmpDesc` |

Typographic work the Vietnamese copy required:

- **Vietnamese font subsets added.** `@fontsource` splits Inter and JetBrains
  Mono by subset, and the latin files carry no Vietnamese tone marks. Both
  families now declare latin *and* vietnamese `@font-face` rules with explicit
  `unicode-range`; without the range the browser picks one face wholesale and
  the diacritics drop to a system fallback mid-word.
- **Looser line-height on the headline** (1.16 → 1.3). Uppercase Vietnamese
  stacks tone marks above the cap height and the English value clipped them
  between lines. The mono and secondary styles also got explicit line-heights
  for the same reason.
- **Narrower headline measure** (1560px → 1060px) so the line breaks after
  `MỚI`. At a wider measure it broke as `... CHO BẰNG / CẤP SỐ`, splitting the
  compound *bằng cấp* across lines.
- **Smaller, tighter chip labels** (17px/0.18em → 16px/0.15em) — the Vietnamese
  consent labels are roughly twice the length of the English ones.
- **Wider `Kiểm tra` button** (210px → 230px) and a wider scene-4 measure.
- **Duration 22.2s → 22.4s.** `Xác minh bằng trong 30 giây.` is six words to the
  English five, so the closing claim needed ~0.15s more hold to clear the
  reading floor. The three beat locks (8.74s, 13.11s, 18.56s) are unchanged.

The Vietnamese cut's gate is **cleaner** than the English one: 0 errors,
0 warnings, and contrast 33/33 passing (the English cut had one transient
crossfade contrast warning).

## Gate results

`npx hyperframes check` — **passed, 0 errors.** Remaining findings, all reviewed:

- **4 layout warnings + 5 infos, `content_overlap`** at t=5.24–5.36s, t=11.22s and
  t=20.45s. Every one falls inside a 0.6s scene crossfade, where two scenes are
  deliberately layered. `data-layout-allow-overlap` is set on all four scene
  clips; the audit still reports cross-scene text pairs because the finding is
  raised against the text nodes rather than the clips. Intentional.
- **1 contrast warning**, `#s3-btn-label` at 1.52:1, t=11.1s. This is 0.2s into
  the scene-3 fade-in, while the whole block is still near opacity 0. At every
  settled sample the `Check` button is black `#000` on `#f9f9f9` (~20:1). The
  audit reported it at exactly one timestamp and did not gate the run.
- **1 lint warning**, `composition_file_too_large` (383 lines). A single-file
  composition is easier to read here than four sub-composition mounts; left
  as-is.

## Deviations from the plan

All recorded in `brag-plan.md` → *Build notes*. The substantive ones:

- Duration moved 20.8s → **22.2s** so the record block and the closing claim
  each clear the reading-time floor.
- `Immutable Audit Trail` moved from its own scene-4 card into the verified
  panel in scene 3, where it reads as a receipt instead of competing for a hold.
- The consent chips moved ahead of the code resolve, keeping the resolve as the
  scene's climax.
- The closing-claim beat lock moved 17.47s → 18.56s (also a 0.99 strong cue);
  17.47s fell inside the scene 3 → 4 crossfade.
- The logo image was dropped. Both `public/logo-icon.png` and
  `logo-icon-rev.png` are full lockups that already contain the wordmark, so
  placing one beside the `Lucidex` type printed the name twice.

## Not implemented: audio-reactive treatment

The brief asked for a subtle audio-reactive pass (card elevation and vignette
breathing a few percent with music RMS). **It was not implemented.** The
`hyperframes-creative` extraction helper needs FFmpeg present at authoring time,
and this machine had no FFmpeg until late in the build (see below). The brief's
own fallback — "skip audio-reactive and note it, do not block the render" — was
taken. Everything else in the audio plan shipped: the bed, the volume
automation lane (duck at 20.7s, fade to 0 by 22.2s), and all three SFX cues.

To add it later: install the helper's dependencies, follow
`~/.claude/skills/hyperframes-creative` audio-reactive guidance, and wire the
per-frame data to `#s2-card` elevation and `.vignette` opacity only.

## Environment: FFmpeg

`hyperframes doctor` reported no FFmpeg or FFprobe on this machine, and neither
`winget` nor `choco` was on PATH. Rather than changing system state, prebuilt
binaries were installed as project dev dependencies and staged locally:

```
composition/node_modules/ffmpeg-static/ffmpeg.exe   -> composition/.bin/ffmpeg.exe
composition/node_modules/ffprobe-static/.../ffprobe.exe -> composition/.bin/ffprobe.exe
```

Nothing outside `brag-output/composition/` was modified. To re-render later,
put `.bin` on PATH first:

```bash
cd brag-output/composition && export PATH="$PWD/.bin:$PATH" && npx hyperframes render --quality looks --output ../brag.mp4
```

Fonts are also local (`@fontsource/inter`, `@fontsource/jetbrains-mono`, copied
into `composition/assets/fonts/`), so the composition renders without network
access to Google Fonts.

`doctor` also flagged low free memory (1.8 GB of 15.7 GB at the start). The
render completed in 1m 10s with 3 workers and did not hit it, but a delivery-
quality re-render on a loaded machine may want other apps closed first.
