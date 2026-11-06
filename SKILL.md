---
name: video-inspector
description: >-
  Comprehensive video quality inspection, technical auditing, and visual fidelity QA skill.
  Audits MP4/WebM videos and HTML5 Canvas renders for:
  1. Technical stream encoding & EBU R128 loudness compliance (-18 LUFS / -14 LUFS, True Peak <= -1.0 dBTP),
  2. Character anatomical naturalness & movement ergonomics (1:6.5 build, trapezius slope),
  3. Scene object semantic fidelity (avoiding crude primitive placeholders, ensuring organic textures),
  4. Light-to-emitter alignment & beam coincidence,
  5. Hand-Socket & Prop Grip Alignment QA (bag, milk carton, mop 2-hand grip <= 2–3px offset, Z-index occlusion),
  6. 2-Segment FK Walk & Foot-Planting Audit (knee angle >= 0 swing, 0px floor clipping, sole plane alignment, anti-moonwalk sync),
  7. Macro POV Hand & Progressive Masking QA (ctx.clip() mask synchronization, zero ghosting/pre-render lines),
  8. HUD Typography & Thai Overflow Check (Thai vowel & tone mark clearance: กฎ/ที่/น้ำพุ/ฟู้ดคอร์ท, card padding >= 12px, WCAG contrast ratio),
  9. 9:16 Shorts / TikTok UI Safe Zone Mask (right 140px, bottom 320px, top 180px dead zones, contact sheet visual overlay),
  and generates annotated visual keyframe contact sheet reports.
---

# Video Quality Inspector & Technical QA Skill

This skill provides an automated, rigorous quality assurance (QA) pipeline to audit, verify, and diagnose video production deliverables for both **16:9 Long-Form Masters** and **9:16 Vertical Shorts/Reels/TikTok Episodes**.

---

## 1. Quality Assurance Dimensions

When inspecting any video render or source codebase, evaluate across 12 core QA pillars:

### 1.1 Technical Encoding & Container Specs
- **Resolution & Aspect Ratio:**
  - 16:9 Master: `1920x1080` (or `1280x720` standard), Square Pixels (`SAR 1:1`).
  - 9:16 Vertical Shorts: `1080x1920`, exact vertical aspect.
- **Frame Rate (FPS):** Strictly deterministic `24.0` or `30.0` FPS (constant frame rate, no variable frame rate drops).
- **Pixel Format:** `yuv420p` (maximum cross-device/browser compatibility).
- **Moov Atom Location:** `+faststart` enabled (moov atom placed at file head for instant web playback).

### 1.2 Character Anatomical Naturalness & Movement Ergonomics (สรีระและการเคลื่อนไหวที่เป็นธรรมชาติ)
- **Proportions & Silhouette:**
  - Head-to-body ratio: approximately $1:6.5$ to $1:7.0$.
  - Neck anatomy: Short, natural cervical slope ($8$–$14\text{px}$) blending smoothly into trapezius shoulders. **STRICTLY FORBIDDEN:** "Giraffe/ostrich necks", bowling-pin necks, or floating mushroom heads.
  - Limb proportions: Upper arm (bicep) $\approx$ forearm; thigh $\approx$ calf.
  - Foot structure: Must feature footwear anatomy (heel, arch, sole, toe box) rather than blunt rounded capsules.
- **Joint Kinematics & Ergonomics:**
  - Joint angles must adhere to human biomechanics: elbows do not hyperextend ($< 160^\circ$), knees bend forward/downward only.
  - Arms must never dislocate or bend backwards over shoulders unnaturally.
- **Weight-Bearing Dynamics:**
  - When carrying heavy loads (e.g. 15 kg rice sack / grab bag): Spine must lean forward $15^\circ$–$20^\circ$, knees slightly bent, center of gravity shifted over feet.
  - Hands must physically support/cradle the load (underneath and gripping corners), not dangle or float in empty space.

### 1.3 Scene Object Semantic Fidelity (ความสมจริงของวัตถุ ไม่ใช้รูปทรงเรขาคณิตดิบ)
- **No Crude Geometric Primitives:**
  - Objects must NOT look like raw geometric primitive blocks (e.g. a plain flat rectangle for a sack, two plain boxes for a boat, or bare cylinders for flashlights).
  - **Burlap Sacks & Grab Bags (กระสอบป่าน/ถุงยังชีพ):** Must have organic bulging contours, cinched gather at the top, tied hemp twine tails, woven texture stitches, and realistic gravity sag.
  - **Survival Flashlights:** Detailed knurled aluminum barrel, fluted grip, metallic reflector bezel, rubberized tailcap, and button switch.
  - **Life Rafts & Inner Tubes:** Volumetric 2.5D torus with tire tread grooves, brass/rubber valve stem, weathered timber deck boards with grain lines, and multi-point cross-lashed nylon rope webbing.
  - **Animals & Companions (e.g. Korat Cat / Thai Ridgeback Dog):** Recognizable animal anatomy: alert triangular ears with inner ear shading, whiskers/snout, anatomical paws resting naturally.

### 1.4 Light Source & Beam Alignment
- **Coincident Emitter Origin:** Volumetric light cones must originate **precisely** from the front glass of the flashlight/torch reflector.
- **No Stray/Disconnected Beams:** Zero floating, disconnected, or orphaned light polygons separated from their source.
- **Inverse-Square Falloff:** Natural edge softness and volumetric rain particle scattering within the light cone.

### 1.5 Audio & Broadcast Loudness Standards (EBU R128)
- **Target Integrated Loudness:**
  - YouTube Master: `-14.0 LUFS` to `-18.0 LUFS` (standard: `-18.0 LUFS`).
  - Maximum True Peak (`TP`): $\le -1.0\text{ dBTP}$ (prevents clipping during AAC transcoding).
  - Loudness Range (`LRA`): $\le 7.0\text{ LU}$ (maintains vocal clarity over ambience).
- **Audio Codec & Bitrate:** Stereo or Mono `AAC` at $\ge 192\text{ kbps}$ or uncompressed PCM (`44.1 kHz` or `48 kHz`).
- **Audio-Video Duration Sync:** Audio and video duration must match within $< 0.05\text{s}$.

### 1.6 Visual Frame Integrity & Motion QA
- **Black Frame Detection:** Flag any unintended pure-black frames (`blackdetect=d=0.2:pix_th=0.10`).
- **Frozen Frame Detection:** Flag static/dropped frames during active scenes (`freezedetect=n=0.003:d=1.5`).
- **Aspect Ratio Distortion:** Ensure graphics and character rigs maintain proportions.

### 1.7 Content, Subtitle & HUD Safe-Zones (Standard 16:9)
- **Burned-In Subtitles:**
  - Safe distance from bottom edge ($\ge 40\text{px}$ on 16:9).
  - High-contrast text stroke (minimum 5px dark outline behind white `#FFFFFF` text).
  - Line length limit: $\le 36$ characters per subtitle cue.
- **HUD Card Legibility:**
  - Font size $\ge 24\text{px}$ for headers, $\ge 16\text{px}$ for body/notes.
  - Background rack-focus or darkened vignette to preserve readability.

---

### 1.8 การตรวจจับจุดยึดมือและวัตถุ (Hand-Socket & Prop Grip Alignment QA)
- **ปัญหาที่พบบ่อย:**
  - ตัวละครเดินหิ้วถุงพลาสติก (`carry_bag`) หรือนั่งถือกล่องนม (`crouch_hold_item`) แล้วพิกัดวัตถุลอยแยกออกจากฝ่ามือ (`handX`, `handY`)
  - ภารโรงถือไม้ถูพื้นสองมือ (`two_hand_mop`) แต่ด้ามไม้ถูพื้นลอยหลุดจากร่องมือ หรือวาดทับเลเยอร์แขนผิดลำดับ (Inverted Z-Index)
- **เกณฑ์และข้อกำหนด:**
  1. **Hand-Socket Offset Tolerance ($\le 2\text{–}3\text{px}$):**
     - พิกัดศูนย์กลางฝ่ามือ/ข้อมือ (`wristX, wristY` หรือ `handX, handY`) กับจุดยึดวัตถุ (`propAnchorX, propAnchorY`) ต้องมีระยะห่าง Euclidean distance คลาดเคลื่อนได้ไม่เกิน **$2\text{–}3\text{px}$**
     - `carry_bag`: หูหิ้วถุงต้องเริ่มจากพิกัดฝ่ามือของแขนหน้าโดยตรง (`moveTo(front[0] - 4, front[1])`)
     - `crouch_hold_item`: จุดศูนย์กลางกล่องนมหรือเสบียงต้องจัดตำแหน่งสัมผัสกับนิ้วมือและฝ่ามือพอดี ($\Delta d \le 3\text{px}$)
     - `two_hand_mop`: แกนเส้นด้ามไม้ถูพื้นต้องพาดผ่านพิกัดมือทั้งสองข้าง โดยมีระยะห่างในแนวตั้งฉาก (Perpendicular distance) $\le 2\text{px}$
  2. **Z-Index Layering Occlusion Hierarchy (ลำดับการวาดเลเยอร์):**
     $$\text{Far Arm (แขนหลัง)} < \text{Prop Body / Shaft (ตัววัตถุ/ด้ามจับ)} < \text{Near Arm (แขนหน้า)} < \text{Fingers / Palm Clamping (ฝ่ามือ/นิ้วที่โอบ)}$$
     - **ข้อห้ามเด็ดขาด:** ห้ามวาดด้ามไม้ถูพื้นหรือหูหิ้วถุงทับลงบนแขนท่อนหน้า (`nearArm`) หรือฝ่ามือที่อยู่ด้านหน้าเป็นอันขาด

---

### 1.9 การตรวจสอบท่าเดิน 2 ท่อน และการวางเท้า (2-Segment FK Walk & Foot-Planting Audit)
- **ปัญหาที่พบบ่อย:**
  - อาการเท้าจมทะลุพื้นกระเบื้อง (Floor Clipping)
  - หัวเข่างอผิดทิศทาง (งอไปข้างหน้าเหมือนขานกฟลามิงโก: Flamingo Inversion Defect)
  - เท้าลื่นไถลไม่สัมพันธ์กับความเร็วการเคลื่อนที่ (Moonwalking / Foot Skating)
- **เกณฑ์และข้อกำหนด:**
  1. **2-Segment Forward Kinematics (FK) Kinematics:**
     - ขาต้องประกอบด้วย 2 ท่อนที่ชัดเจน: ต้นขา (`thigh` $\approx 45\text{–}46\text{px}$) + น่อง (`calf` $\approx 44\text{–}46\text{px}$) + รองเท้าบู้ตพร้อมพื้นยาง (`boot / lug sole`)
  2. **Knee Flexion Angle Constraint (`kneeAngle >= 0`):**
     - ในจังหวะยกเท้าก้าวไปข้างหน้า (Swing / Lift Phase): ข้อเข่าต้องพับไปข้างหลัง/ลงล่างเท่านั้น:
       $$\text{kneeAngle} = \max(0, -\sin(p + \phi)) \times A_{\text{knee}}$$
     - **ห้ามมุมเข่าติดลบ ($\text{kneeAngle} < 0$)** โดยเด็ดขาด เพราะจะทำให้เข่างอแอ่นไปข้างหน้าแบบผิดกายวิภาคศาสตร์มนุษย์
     - ในจังหวะเหยียดสุด (Extension): มุมเข่าต้องไม่เกิน $165^\circ$ ป้องกันอาการข้อต่อหลุด (Hyperextension)
  3. **Foot-Planting & Floor Plane Alignment ($0\text{px}$ Floor Clipping):**
     - พิกัดใต้พื้นรองเท้า: $\text{soleY} = \text{ankleY} + \text{shoeHeight}$
     - ในเฟรมที่เท้าสัมผัสพื้น (Weight-Bearing / Stance Phase): $\text{soleY}$ ต้องแตะระนาบพื้นกระเบื้องพอดี ($\Delta y \le 1.5\text{px}$) ห้ามจมทะลุพื้นและห้ามลอยเคว้ง
     - เงาตกกระทบใต้ฝ่าเท้า (`dropShadow`): ต้องแนบสนิทกับพื้นรองเท้าในเฟรมสัมผัสพื้น และหดเล็กลงเมื่อยกเท้า
  4. **Anti-Moonwalking Stride Sync:**
     - อัตราการก้าวขา (Stride Frequency $f$) และระยะก้าว ($L_{\text{stride}}$) ต้องสัมพันธ์กับความเร็วการเลื่อนตำแหน่งตัวละคร ($v$):
       $$v = f \times L_{\text{stride}}$$
     - ขณะที่เท้าข้างใดข้างหนึ่งแตะพื้น (Stance Phase) พิกัด $X$ ของเท้านั้นบนโลกจะต้องอยู่นิ่ง ไม่ลื่นไถลไปกับพื้นผิว

---

### 1.10 การตรวจฉากโคลสอัพมือ (Macro POV Hand & Progressive Masking QA)
- **ปัญหาที่พบบ่อย:**
  - ในฉากมือแปะเทปกาว (`macro_tape_unroll`) หรือเขียนเลข/วาดแผนที่ (`macro_marker_write`, `tapeArrow`, `blockMap`) เส้นปากกาหรือแถบเทปกาวโผล่ขึ้นมาก่อนที่ปลายปากกาหรือม้วนเทปจะลากไปถึง (Premature Reveal / Ghosting Artifact)
- **เกณฑ์และข้อกำหนด:**
  1. **`ctx.clip()` Mask Synchronization:**
     - การเปิดเผยเส้นหมึกหรือแถบเทปทีละส่วน (Progressive Reveal) ต้องเชื่อมโยงกับพิกัดหัวเครื่องมือในเฟรมปัจจุบันอย่างเคร่งครัด:
       $$\text{maskBoundaryX} \le \text{toolTipX} + 2\text{px}$$
     - สำหรับปากกา: ขอบของ `clip()` Mask ต้องตรงกับพิกัดหัวปากกาสีแดง/ดำ (`markerTipX, markerTipY`)
     - สำหรับม้วนเทปกาว: ขอบของแถบเทปที่เปิดเผยต้องตรงกับจุดสัมผัสของม้วนเทปหรือนิ้วที่กดรีดเทป
  2. **Zero-Ghosting Verification:**
     - ห้ามมีเส้นตัวเลข, หมึก, หรือเนื้อเทปปรากฏล่วงหน้าเกินตำแหน่งหัวปากกาเด็ดขาด
     - หากตรวจพบว่าเส้นหมึกหรือเทปแสดงผลนำหน้าหัวเครื่องมือเกิน $3\text{px}$ ให้ถือเป็นข้อผิดพลาด `FAIL`

---

### 1.11 การตรวจการ์ด HUD และฟอนต์ภาษาไทยล้นกรอบ (HUD Typography & Overflow Check)
- **ปัญหาที่พบบ่อย:**
  - สระบน-ล่างและวรรณยุกต์ภาษาไทย (เช่น กฎ, ที่, น้ำพุ, ฟู้ดคอร์ท, มล.) ชนหรือซ้อนทับขอบป้าย Badge
  - ข้อความในการ์ดคำนวณแคลอรี (`CALORIES`) หรือ Modulo (`EXIT`) ยาวทะลุกรอบการ์ดสีครีม (`#FAF7F2`)
  - ค่า Contrast ต่ำเกินไปจนกลืนกับพื้นหลังมืด
- **เกณฑ์และข้อกำหนด:**
  1. **Thai Vertical Accent & Tone Clearance:**
     - โครงสร้างตัวอักษรภาษาไทยประกอบด้วย 3–4 ระดับ (วรรณยุกต์ ่ ้ ๊ ๋, สระบน ิ ี ึ ื ั ็, สระล่าง ุ ู)
     - ป้าย Badge (`⚠️ กฎข้อ 1`, `• ของที่มี`, `• ฟู้ดคอร์ท`):
       - ความสูงของ Badge ต้องไม่ต่ำกว่า $24\text{px}$ (ค่ามาตรฐานคือ $26\text{px}$)
       - ระยะห่างด้านบน-ล่าง (Vertical Padding) ต้องมีอย่างน้อย $4\text{–}5\text{px}$ ป้องกันวรรณยุกต์ซ้อนทับขอบมนของ Badge
  2. **Bounding Box Internal Padding ($\ge 12\text{px}$):**
     - การ์ด HUD ทุกใบ (Rule Card, Telemetry Pill, Inventory Card, Calorie Calculation Card, Modulo Card):
       - ระยะห่างระหว่างขอบนอกของข้อความไปยังขอบการ์ดสีครีม (`#FAF7F2`) ต้องมีอย่างน้อย **$12\text{px}$** (ค่ามาตรฐานคือ $20\text{–}26\text{px}$)
       - ความกว้างของการ์ดต้องคำนวณแบบ Dynamic รองรับความยาวข้อความภาษาไทย:
         $$W_{\text{card}} \ge \max(W_{\text{min}}, \max(W_{\text{line}}) + 2 \times \text{pad})$$
       - ข้อความต้องไม่ล้นทะลุเส้นขอบการ์ดในทุกกรณี (Zero Horizontal/Vertical Text Overflow)
  3. **WCAG Contrast Ratio Compliance:**
     - ข้อความบนการ์ดสีครีม: `#1C1917` บน `#FAF7F2` ต้องมี Contrast Ratio $\ge 7:1$ (ระดับ AAA, ปกติได้ $15.8:1$)
     - ป้ายเตือนภัยสีแดง: ตัวหนังสือสีขาว `#FFFFFF` บนพื้นแดง `#B91C1C` ต้องมี Contrast Ratio $\ge 4.5:1$ (ระดับ AA, ปกติได้ $4.8:1$)
     - Telemetry บนพื้นมืด: ตัวหนังสือสีขาว `#FFFFFF` หรือเหลือง `#FACC15` บนพื้นหลังมืด `rgba(14, 14, 18, 0.72)` ต้องมี Contrast Ratio $\ge 4.5:1$

---

### 1.12 การตรวจพื้นที่ปลอดภัยสำหรับคลิปแนวตั้ง (9:16 Shorts / TikTok UI Safe Zone Mask)
- **ปัญหาที่พบบ่อย:**
  - ตอนแปลงหรือตัดคลิปเป็น $1080 \times 1920$ (EP 1–5): ซับไตเติลภาษาไทย, การ์ด HUD (เช่น Rule Cards, Telemetry, Proximity Meter), หรือป้ายบอกตอน ถูกปุ่ม Like/Comment ด้านขวา หรือแถบแคปชันด้านล่างของ TikTok/Reels/Shorts บัง
- **เกณฑ์และข้อกำหนด:**
  1. **ขนาดของ Dead Zones สำหรับวิดีโอ 9:16 ($1080 \times 1920$):**
     - **ขอบขวา (Right Dead Zone):** กว้าง **$140\text{px}$** ($X: 940 \rightarrow 1080\text{px}$) สำหรับปุ่ม Action (Like, Comment, Bookmark, Share, Audio Disc)
     - **ขอบล่าง (Bottom Dead Zone):** สูง **$320\text{px}$** ($Y: 1600 \rightarrow 1920\text{px}$) สำหรับชื่อช่อง, คำอธิบายแคปชัน, แท็ก, และแถบ Seek Bar
     - **ขอบบน (Top Dead Zone):** สูง **$180\text{px}$** ($Y: 0 \rightarrow 180\text{px}$) สำหรับช่องค้นหา, แท็บ Following/For You, และ Status Bar ของสมาร์ทโฟน
  2. **Safe Active Zone (พื้นที่ปลอดภัย):**
     - แนวนอน: $60\text{px} \le X \le 940\text{px}$ (ความกว้างปลอดภัยสูงสุด $880\text{px}$)
     - แนวตั้ง: $180\text{px} \le Y \le 1600\text{px}$ (ความสูงปลอดภัย $1420\text{px}$)
  3. **การวางตำแหน่ง Subtitles & HUD Cards ใน 9:16:**
     - ซับไตเติลภาษาไทย: ต้องวางอยู่ที่พิกัด $Y \le 1600\text{px}$ (เช่น $Y = 1520\text{px}$ หรือ $Y = 1450\text{px}$) **ห้ามใช้สูตร $H - 46$ ($1874\text{px}$) ของ 16:9 เดิมเด็ดขาด!**
     - การ์ดกฎและ HUD: ต้องมีความกว้าง $W \le 900\text{px}$ และจัดวางกึ่งกลางหน้าจอ ($X = 540\text{px}$) หลบขอบขวา $140\text{px}$
  4. **Contact Sheet Visual Dead Zone Overlay:**
     - สคริปต์ตรวจสอบต้องวาดกรอบสีแดงโปร่งแสง (`rgba(239, 68, 68, 0.28)`) พร้อมเส้นขอบสีแดงเตือนภัยทับบนเฟรมตัวอย่างของ Contact Sheet เพื่อเป็นหลักฐานตรวจสอบด้วยสายตา (Proof-of-Work)

---

## 2. Automated Programmatic Inspection Script

รันสคริปต์ตรวจสอบผ่านคำสั่ง:
```bash
node inspect_video.js <path-to-video.mp4> [--shorts]
```

### การทำงานของสคริปต์:
1. **Stream & Loudness Analysis:** ตรวจสอบความละเอียด, FPS deterministic, Codec, EBU R128 loudness (`-18.0 LUFS`), True Peak ($\le -1.0\text{ dBTP}$), และค้นหา Black frames
2. **Code AST & Rig Verification:** ค้นหาและวิเคราะห์โค้ดต้นทาง (`core.js` และ `views.js`) ในโฟลเดอร์ของวิดีโอ เพื่อตรวจสอบ:
   - จุดยึดมือและวัตถุ (`carry_bag`, `crouch_hold_item`, `two_hand_mop`, Z-index)
   - ท่าเดิน 2 ท่อน (`kneeAngle >= 0`, floor clipping, shadow contact, anti-moonwalk)
   - Progressive Masking (`ctx.clip()` mask-to-tip sync, zero ghosting)
   - HUD typography (ความสูง Badge, padding $\ge 12\text{px}$, WCAG contrast ratio)
   - Vertical Safe Zone (ระยะห่างซับไตเติลและการ์ดในคลิป 9:16)
3. **Keyframe Contact Sheet พร้อม Dead Zone Overlay:**
   - สุ่มจับ 25 คีย์เฟรมแบบ $5 \times 5$
   - สำหรับคลิป 9:16 สคริปต์จะฝังเลเยอร์ Dead Zone Overlay สีแดง (ขวา 140px, ล่าง 320px, บน 180px) ลงในทุกช่องของ Contact Sheet โดยอัตโนมัติ

---

## 3. Pass/Fail Validation Matrix

| ลำดับ | มิติการตรวจสอบ (Dimension) | เป้าหมายที่ตรวจสอบ (Inspection Target) | เกณฑ์ผ่านการทดสอบ (Pass Condition) |
| :---: | :--- | :--- | :--- |
| **1** | **Character Anatomy** | สัดส่วนหัว ตัว คอ แขน ขา | สัดส่วน $1:6.5$; ความยาวคอ $\le 14\text{px}$; มีกล้ามเนื้อ Trapezius ลาดเอียงสมูท |
| **2** | **Load Ergonomics** | ท่าทางยกและหิ้วของหนัก | กระดูกสันหลังเอียงไปข้างหน้า $15^\circ$–$20^\circ$; สองมือโอบอุ้มวัตถุ; เข่าย่อรับน้ำหนัก |
| **3** | **Object Fidelity** | กระสอบป่าน, แพชูชีพ, ไฟฉาย | เส้นโค้ง Bezier แบบอินทรีย์, ลวดลายตะเข็บเย็บ, ไม่ใช้รูปทรงเรขาคณิตดิบ |
| **4** | **Light Alignment** | ลำแสงไฟฉาย | โคนแสงต้องเริ่มจากหน้ากระจกโคมไฟฉายพอดี ($0\text{px}$ offset, ไม่มีแสงลอยเคว้ง) |
| **5** | **Audio Loudness** | EBU R128 Integrated Loudness | $-18.0 \pm 1.5\text{ LUFS}$ |
| **6** | **Audio Headroom** | True Peak | $\le -1.0\text{ dBTP}$ |
| **7** | **Video Encoding** | Resolution & Codec | H.264, yuv420p, 24/30 FPS deterministic |
| **8** | **Visual Defects** | Black / Freeze frames | 0 unintended frames |
| **9** | **Hand-Socket & Prop Grip** | จุดยึดมือและวัตถุ (`carry_bag`, `mop`) | ระยะห่างศูนย์กลางฝ่ามือกับวัตถุ $\le 2\text{–}3\text{px}$; เลเยอร์ $\text{Back Arm} < \text{Prop} < \text{Front Arm}$ |
| **10** | **2-Segment FK Walk** | ท่าเดิน 2 ท่อน และการวางเท้า | มุมพับเข่า $\text{kneeAngle} \ge 0$ (ไม่บิดไปข้างหน้าแบบนกฟลามิงโก); เท้าแตะพื้นกระเบื้อง $0\text{px}$ clipping; ไม่มูนวอล์ก |
| **11** | **Macro Masking QA** | โคลสอัพมือแปะเทป/เขียนปากกา | `ctx.clip()` ขยายตัวตามหัวปากกา/เทป ($\Delta \le 2\text{–}3\text{px}$); ไม่มีหมึกหรือเทปลอยขึ้นมาก่อน |
| **12** | **HUD Typography** | สระบน-ล่างภาษาไทย และขอบการ์ด | ความสูง Badge $\ge 24\text{px}$; Padding ในการ์ด $\ge 12\text{px}$; Contrast Ratio $\ge 4.5:1$ (AAA บนการ์ดครีม) |
| **13** | **9:16 Shorts Safe Zone** | ขอบเขตปลอดภัย Shorts/TikTok | เว้นขอบขวา $140\text{px}$, ขอบล่าง $320\text{px}$, ขอบบน $180\text{px}$; ซับไตเติลและ HUD ไม่โดน UI แอปบัง |
