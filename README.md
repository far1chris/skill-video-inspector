# Video Inspector (Antigravity Skill)

[![Antigravity Skill](https://img.shields.io/badge/Antigravity-Skill-orange.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

An automated video quality inspection, technical auditing, and visual fidelity QA skill for **Google Antigravity**. Audits MP4/WebM renders and HTML5 Canvas animation codebases across broadcast standards, human biomechanics, HUD typography, and vertical social media safe zones.

---

## 📖 Overview

The **Video Inspector** skill provides a programmatic, multi-pillar quality assurance suite designed specifically for procedural 2D/2.5D animation pipelines (such as Real Lens, survival horror, and calculated disaster video production).

It performs both binary video stream inspections (via FFmpeg filters) and static AST/regex audits on rig definitions (`core.js`) and scene implementations (`views.js`).

---

## ✨ Core QA Dimensions

1. **Broadcast Technical & Loudness Standards (EBU R128):**
   - Integrated loudness measurement (`-18.0 ± 1.5 LUFS`).
   - True Peak compliance ($\le -1.0\text{ dBTP}$).
   - Deterministic constant frame rate (`24` or `30` FPS).
   - Pixel format compatibility (`yuv420p`).
   - Unintended black frame and frozen frame detection.

2. **Character Anatomical Naturalness & Ergonomics:**
   - Balanced human proportion ratio ($1:6.5$ build).
   - Continuous trapezius shoulder slope (prevents disjoint ostrich necks).
   - Articulated limbs, knees, calves, and lug-soled boot anatomy.
   - Forward spine flexion ($15^\circ$–$20^\circ$) and knee absorption under heavy loads.

3. **Hand-Socket & Prop Grip Alignment QA:**
   - Euclidean distance between palm center `(handX, handY)` and prop socket anchor $\le 2\text{–}3\text{px}$.
   - Full-body socket verification: shopping bag (`carry_bag`), milk carton/ration (`crouch_hold_item`), and two-handed mop (`two_hand_mop`).
   - Strict Z-Index occlusion hierarchy:
     $$\text{Far Arm} < \text{Prop Body / Shaft} < \text{Near Arm} < \text{Fingers / Clamping Palm}$$

4. **2-Segment FK Walk & Foot-Planting Audit:**
   - 2-Segment articulated leg kinematics (`thigh` + `calf` + `planted shoe`).
   - Knee flexion angle constraint: $\text{kneeAngle} \ge 0$ during lift/swing phase (strictly prevents forward flamingo knee inversion).
   - Floor plane contact: $\text{ankleY} + \text{shoeHeight}$ flush with tile plane ($0\text{px}$ floor clipping).
   - Anti-moonwalk stride synchronization ($v = f \times L_{\text{stride}}$).

5. **Macro POV Hand & Progressive Masking QA:**
   - Macro close-up verification (`macro_tape_unroll`, `macro_marker_write`, `tapeArrow`, `blockMap`).
   - `ctx.clip()` mask synchronization with marker tip or tape dispenser ($\Delta \le 2\text{–}3\text{px}$).
   - Zero-ghosting: guarantees no text strokes or tape strips appear before the physical tool arrives.

6. **HUD Typography & Thai Overflow Check:**
   - Thai vertical vowel & tone mark clearance (ิ ี ึ ื ั ็ ่ ้ ๊ ๋ ุ ู in words like `กฎ`, `ที่`, `น้ำพุ`, `ฟู้ดคอร์ท`, `มล.`).
   - Badge pill height $\ge 24\text{–}26\text{px}$ with vertical accent headroom.
   - Internal card padding $\ge 12\text{px}$ (prevents calorie/modulo formula overflow).
   - WCAG Contrast Ratio verification ($\ge 4.5:1$ on cream cards and dark telemetry boxes).

7. **9:16 Shorts / TikTok UI Safe Zone Mask:**
   - Automatic vertical format detection ($1080 \times 1920$).
   - Dead zone exclusions:
     - **Right Margin:** $140\text{px}$ (Like, Comment, Share, Audio Disc).
     - **Bottom Margin:** $320\text{px}$ (Channel handle, captions, Seek Bar).
     - **Top Margin:** $180\text{px}$ (Search bar, status bar, navigation tabs).
   - Subtitle placement validation ($Y \le 1600\text{px}$).
   - Generates contact sheet keyframe proof-of-work with embedded semi-transparent red Dead Zone bounding overlays.

---

## 📂 Repository Structure

```
skill-video-inspector/
├── SKILL.md                          # Main skill documentation & Pass/Fail matrix
├── README.md                         # Documentation & usage guide
├── LICENSE                           # MIT License
├── .gitignore                        # Git ignore rules
└── scripts/
    └── inspect_video.js              # Programmatic Node.js + FFmpeg QA audit tool
```

---

## 🚀 Installation & Usage in Google Antigravity

Clone this repository into your local Antigravity skills directory:

```bash
git clone https://github.com/far1chris/skill-video-inspector.git ~/.gemini/config/skills/video-inspector
```

Or on Windows PowerShell:

```powershell
git clone https://github.com/far1chris/skill-video-inspector.git "$HOME\.gemini\config\skills\video-inspector"
```

### Running Video Inspections

Run the inspection tool against any rendered video file:

```bash
node scripts/inspect_video.js <path-to-video.mp4>
```

For vertical 9:16 Shorts/Reels/TikTok deliverables:

```bash
node scripts/inspect_video.js <path-to-shorts.mp4> --shorts
```

---

## 📊 Sample Output & Scorecard

```
=================================================================
📊 FINAL QA VERIFICATION SCORECARD:
   ✅ PASS | Video Stream Present
   ✅ PASS | Audio Stream Present
   ✅ PASS | Frame Rate Determinism (24/30 FPS)
   ✅ PASS | Pixel Format Standard (yuv420p)
   ✅ PASS | Audio Integrated Loudness (-18 LUFS)
   ✅ PASS | True Peak Headroom (<= -1.0 dBTP)
   ✅ PASS | Zero Stale Black Intervals
   ✅ PASS | Character Proportions & Posture Naturalness
   ✅ PASS | Weight-Bearing Movement Ergonomics
   ✅ PASS | Scene Object Semantic Fidelity (Anti-Primitives)
   ✅ PASS | Strict Light-to-Emitter Coincidence
   ✅ PASS | Hand-Socket & Prop Grip Alignment (<= 2-3px, Z-index)
   ✅ PASS | 2-Segment FK Walk & Foot-Planting (Knee >= 0, 0px Clip)
   ✅ PASS | Macro POV Hand & Progressive Masking (ctx.clip() sync)
   ✅ PASS | HUD Typography & Thai Overflow (Accents, Padding >= 12px)
   ✅ PASS | 9:16 Shorts / TikTok UI Safe Zone (Right 140px, Bottom 320px)

Overall QA Status: 🎉 100% PRODUCTION READY & COMPLIANT
=================================================================
```

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
