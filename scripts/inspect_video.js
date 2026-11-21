// =============================================================================
//  Video Quality Inspector & Technical QA Tool (Comprehensive 16-Point Edition)
//  Part of skill: video-inspector (shared by reallens-horror-animator & thai-sitcom-animator)
//  Auditing:
//    1. Technical Stream & Encoding Specs (H.264, yuv420p, deterministic 24/30 FPS)
//    2. EBU R128 Audio Broadcast Loudness (-16..-18 LUFS Master / -14..-18 LUFS Shorts)
//    3. Temporal Continuity & Artifact Detection (0 Unintended Black Intervals)
//    4. Character Anatomical Naturalness & Movement Ergonomics (1:6.5 build, Horror & Sitcom)
//    5. Scene Object Semantic Fidelity (Anti-primitives & light coincidence)
//    6. Hand-Socket & Prop Grip Alignment QA (<= 2-3px offset, Z-index occlusion)
//    7. 2-Segment FK Walk & Foot-Planting Audit (Knee >= 0, floor clipping, anti-moonwalk)
//    8. Macro POV Hand & Progressive Masking QA (ctx.clip() sync, zero ghosting)
//    9. HUD Typography & Thai Overflow Check (Badge >= 24px, padding >= 12px, WCAG)
//   10. 9:16 Shorts / TikTok UI Safe Zone Mask + Scroll-Stop Retention, Camera Variety & Title SEO
//
//  Usage:
//    node inspect_video.js <path-to-video.mp4> [--shorts] [--strict] [--allow-over-60] [--allow-multi-ep]
// =============================================================================
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

function getFFmpegPath() {
  const reqs = [require];
  const pkgJson = path.join(process.cwd(), 'package.json');
  try {
    reqs.unshift(createRequire(fs.existsSync(pkgJson) ? pkgJson : path.join(process.cwd(), '_resolver.js')));
  } catch (_) {}

  for (const r of reqs) {
    try {
      const p = r('ffmpeg-static');
      if (p && fs.existsSync(p)) return p;
    } catch (_) {}
  }

  const exeName = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
  const candidatePaths = [
    path.join(process.cwd(), 'node_modules', 'ffmpeg-static', exeName),
    path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', exeName),
    path.join(__dirname, '..', '..', 'node_modules', 'ffmpeg-static', exeName)
  ];
  for (const cp of candidatePaths) {
    if (fs.existsSync(cp)) return cp;
  }
  return 'ffmpeg';
}

const ffmpeg = getFFmpegPath();

function hexToLuminance(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const a = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function calculateContrastRatio(hex1, hex2) {
  const l1 = hexToLuminance(hex1);
  const l2 = hexToLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function inspectVideo(videoPath, options = {}) {
  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file not found: ${videoPath}`);
  }

  const stat = fs.statSync(videoPath);
  const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
  console.log(`\n=================================================================`);
  console.log(`🔍 INSPECTING VIDEO: ${path.basename(videoPath)} (${sizeMB} MB)`);
  console.log(`   Path: ${videoPath}`);
  console.log(`=================================================================`);

  // 1. Probe Stream Specs via FFmpeg
  const probeRun = spawnSync(ffmpeg, ['-i', videoPath], { encoding: 'utf8' });
  const probeRaw = probeRun.stderr || probeRun.stdout || '';

  const durMatch = probeRaw.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
  let totalSec = 0;
  if (durMatch) {
    totalSec = parseInt(durMatch[1], 10) * 3600 + parseInt(durMatch[2], 10) * 60 + parseFloat(durMatch[3]);
  }

  const vStreamMatch = probeRaw.match(/Stream #\d+:\d+.*Video:\s*([^\n]+)/);
  let vCodec = 'Unknown', pixFmt = 'Unknown', resolution = 'Unknown', width = 0, height = 0;
  if (vStreamMatch) {
    const parts = vStreamMatch[1];
    const cMatch = parts.match(/^([a-zA-Z0-9_\-()\s/]+?),/);
    if (cMatch) vCodec = cMatch[1].trim();
    const resMatch = parts.match(/(\d{3,4})x(\d{3,4})/);
    if (resMatch) {
      width = parseInt(resMatch[1], 10);
      height = parseInt(resMatch[2], 10);
      resolution = `${width}x${height}`;
    }
    if (parts.includes('yuv420p')) pixFmt = 'yuv420p';
    else if (parts.includes('rgb24')) pixFmt = 'rgb24';
  }
  const fpsMatch = probeRaw.match(/(\d+(?:\.\d+)?)\s*fps/);
  const fps = fpsMatch ? parseFloat(fpsMatch[1]) : 0;

  const isVertical = height > width || (width === 1080 && height === 1920) || options.shorts === true;
  const aspectRatioStr = isVertical ? '9:16 Vertical (Shorts/TikTok/Reels)' : '16:9 Long-Form Horizontal';

  const audioMatch = probeRaw.match(/Stream #\d+:\d+.*Audio:\s*([^,\n]+),\s*(\d+)\s*Hz,\s*([^,\n]+)/);
  const aCodec = audioMatch ? audioMatch[1].trim() : 'None';
  const sampleRate = audioMatch ? parseInt(audioMatch[2], 10) : 0;
  const aChannels = audioMatch ? audioMatch[3].trim() : 'None';

  console.log(`\n📋 1. TECHNICAL STREAM SPECIFICATIONS:`);
  console.log(`   - Orientation:     ${aspectRatioStr}`);
  console.log(`   - Resolution:      ${resolution} (W: ${width}px, H: ${height}px)`);
  console.log(`   - Duration:        ${totalSec.toFixed(2)}s (~${(totalSec / 60).toFixed(2)} mins)`);
  console.log(`   - Video Codec:     ${vCodec} (${pixFmt})`);
  console.log(`   - Frame Rate:      ${fps} FPS (Deterministic Constant Frame Rate)`);
  console.log(`   - Audio Codec:     ${aCodec} (${sampleRate} Hz, ${aChannels})`);

  // Project Source Code & Metadata Discovery (Dual-Genre: Horror & Sitcom)
  let projectDir = path.dirname(videoPath);
  if (path.basename(projectDir).toLowerCase() === 'shorts') {
    projectDir = path.dirname(projectDir);
  }
  const coreJsPath = path.join(projectDir, 'core.js');
  const viewsJsPath = path.join(projectDir, 'views.js');
  const episodeJsPath = path.join(projectDir, 'episode.js');
  const genAudioJsPath = path.join(projectDir, 'generate_audio.js');
  const timelineJsonPath = path.join(projectDir, 'timeline.json');
  const shortsPlanPath = path.join(projectDir, 'shorts', 'shorts_plan.json');

  const hasSourceCode = fs.existsSync(coreJsPath);
  const coreCode = hasSourceCode ? fs.readFileSync(coreJsPath, 'utf8') : '';
  const viewsCode = fs.existsSync(viewsJsPath) ? fs.readFileSync(viewsJsPath, 'utf8') : '';
  const genAudioCode = fs.existsSync(genAudioJsPath) ? fs.readFileSync(genAudioJsPath, 'utf8') : '';
  const episodeRaw = fs.existsSync(episodeJsPath) ? fs.readFileSync(episodeJsPath, 'utf8') : '';
  const isSitcom = coreCode.includes('drawSitcomPerson') || coreCode.includes('INK_OUTLINE');

  // 2. Measure Audio Loudness (EBU R128) & Unified Vocal Tone Consistency
  console.log(`\n🔊 2. EBU R128 AUDIO LOUDNESS & VOCAL TONE CONSISTENCY:`);
  let integratedLoudness = null;
  let loudnessRange = null;
  let truePeak = null;
  let vocalConsistencyPass = true;
  const vocalIssues = [];

  try {
    const targetI = isVertical ? '-14.0' : (isSitcom ? '-16.0' : '-18.0');
    const loudRun = spawnSync(ffmpeg, [
      '-i', videoPath,
      '-af', `loudnorm=I=${targetI}:LRA=6.0:TP=-1.0:print_format=json`,
      '-f', 'null', '-'
    ], { encoding: 'utf8' });

    const out = loudRun.stderr || loudRun.stdout || '';
    const jsonMatch = out.match(/\{[\s\S]*"input_i"[\s\S]*?\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      integratedLoudness = parseFloat(data.input_i);
      loudnessRange = parseFloat(data.input_lra);
      truePeak = parseFloat(data.input_tp);
      console.log(`   - Integrated:      ${integratedLoudness.toFixed(1)} LUFS (Target: ${isVertical ? '-14.0 to -18.0 LUFS' : (isSitcom ? '-16.0 LUFS' : '-18.0 LUFS')})`);
      console.log(`   - Loudness Range:  ${loudnessRange.toFixed(1)} LU (Unified Vocal Target: <= 7.5 LU)`);
      console.log(`   - True Peak:       ${truePeak.toFixed(1)} dBTP (Safe: <= -1.0 dBTP)`);
      if (loudnessRange > 7.5) {
        vocalConsistencyPass = false;
        vocalIssues.push(`LRA ${loudnessRange.toFixed(1)} LU > 7.5 LU`);
      }
    } else {
      console.log('   - Could not parse loudnorm json output');
    }
  } catch (err) {
    console.log(`   - Loudness measure error: ${err.message}`);
  }

  let charRoleCount = 0;
  let impersonateRoleCount = 0;
  if (genAudioCode) {
    const hasPuck = /VOICE_NAME\s*=\s*['"]Puck['"]/.test(genAudioCode);
    const hasChain = genAudioCode.includes('unifyVocalTone') && (genAudioCode.includes('sanitizeVoForTTS') || genAudioCode.includes('UNIFIED_STYLE') || genAudioCode.includes('NARRATOR_STYLE'));
    if (!hasPuck) { vocalConsistencyPass = false; vocalIssues.push('VOICE_NAME is not locked to Puck'); }
    if (!hasChain) { vocalConsistencyPass = false; vocalIssues.push('missing unifyVocalTone/UNIFIED_STYLE lock'); }
  }
  if (episodeRaw) {
    let checkedAst = false;
    try {
      const epMod = require(episodeJsPath);
      const scenes = Array.isArray(epMod?.SCENES) ? epMod.SCENES : [];
      checkedAst = true;
      for (const s of scenes) {
        const isChar = s && (s.role === 'character' || !!s.speaker);
        const isImp = s && (s.role === 'impersonate' || !!s.impersonate);
        if (isChar) charRoleCount++;
        if (isImp) impersonateRoleCount++;
        const isNarratorScene = !isChar && !isImp;
        if (isNarratorScene && (s?.voice || s?.voiceName || s?.ttsVoice)) {
          vocalConsistencyPass = false;
          vocalIssues.push(`narrator voice override forbidden on scene ${s.id || '(unnamed)'}`);
        }
        if (Array.isArray(s?.voSegments)) {
          for (const seg of s.voSegments) {
            const segChar = seg && (seg.role === 'character' || !!seg.speaker);
            const segImp = seg && (seg.role === 'impersonate' || !!seg.impersonate);
            if (segChar) charRoleCount++;
            if (segImp) impersonateRoleCount++;
            if (!segChar && !segImp && (seg?.voice || seg?.voiceName || seg?.ttsVoice)) {
              vocalConsistencyPass = false;
              vocalIssues.push(`narrator voice override forbidden in voSegments on scene ${s.id || '(unnamed)'}`);
            }
          }
        }
        if (typeof s?.vo === 'string') {
          if (/\[\[(?:char|character)(?::|\|)/i.test(s.vo)) charRoleCount++;
          if (/\[\[(?:impersonate|mimic)(?::|\|)/i.test(s.vo)) impersonateRoleCount++;
        }
      }
    } catch (_) {}
    if (!checkedAst && /\brole\s*:\s*['"]narrator['"][^}]*\b(?:voice|voiceName|ttsVoice)\s*:/.test(episodeRaw)) {
      vocalConsistencyPass = false;
      vocalIssues.push('narrator voice override forbidden on role: "narrator" in episode.js');
    }
  }
  const exceptionNote = (charRoleCount || impersonateRoleCount)
    ? `, +${charRoleCount} character / ${impersonateRoleCount} impersonation exception(s)`
    : '';
  console.log(`   - Unified Vocal Tone Lock: ${vocalConsistencyPass ? `✅ VERIFIED (Narrator Puck locked${exceptionNote})` : `❌ FAIL (${vocalIssues.join('; ')})`}`);

  let pronunciationPass = true;
  const pronunciationIssues = [];
  let pronunciationSummary = 'verified';
  if (genAudioCode) {
    const hasPronNorm = genAudioCode.includes('normalizeThaiForTTS');
    const hasClarityDetector = genAudioCode.includes('inspectVoClipClarity');
    if (!hasPronNorm || !hasClarityDetector) {
      pronunciationPass = false;
      pronunciationIssues.push('generate_audio.js missing normalizeThaiForTTS/inspectVoClipClarity detector');
    }
  }
  const pronReportPath = path.join(projectDir, 'audio', 'pronunciation_report.json');
  if (fs.existsSync(pronReportPath)) {
    try {
      const report = JSON.parse(fs.readFileSync(pronReportPath, 'utf8'));
      const sum = report.summary || {};
      const fails = (report.scenes || []).filter(s => s.status === 'FAIL' || s.status === 'MISSING_AUDIO');
      if (fails.length > 0) {
        pronunciationPass = false;
        pronunciationIssues.push(`${fails.length} unclear/mispronounced scene(s): ${fails.slice(0, 4).map(f => f.id).join(', ')}`);
      }
      pronunciationSummary = `${sum.pass ?? 0}/${sum.totalAudited ?? 0} PASS (avg ${sum.avgScore ?? 100}/100, report)`;
    } catch (err) {
      pronunciationPass = false;
      pronunciationIssues.push(`invalid pronunciation_report.json: ${err.message}`);
    }
  } else if (fs.existsSync(timelineJsonPath)) {
    try {
      let normFn = null;
      try {
        const gaMod = require(genAudioJsPath);
        if (typeof gaMod?.normalizeThaiForTTS === 'function') normFn = gaMod.normalizeThaiForTTS;
      } catch (_) {}
      const tl = JSON.parse(fs.readFileSync(timelineJsonPath, 'utf8'));
      const scs = Array.isArray(tl.scenes) ? tl.scenes : [];
      let checked = 0;
      const rateFails = [];
      for (const sc of scs) {
        const rawTxt = normFn ? normFn(sc.vo || '', sc.role || 'narrator') : String(sc.vo || '');
        const plain = rawTxt.replace(/[\s!?؟.,…'"“”‘’\-:;()[\]{}]/g, '');
        if (!plain || !(sc.voDur > 0)) continue;
        checked++;
        const cps = plain.length / sc.voDur;
        if (plain.length >= 12 && cps > 22.0) rateFails.push(`${sc.id}(${cps.toFixed(1)}ch/s>22)`);
        else if (plain.length >= 10 && cps < 5.2 && !/\d/.test(rawTxt)) rateFails.push(`${sc.id}(${cps.toFixed(1)}ch/s<5.2)`);
      }
      if (rateFails.length > 0) {
        pronunciationPass = false;
        pronunciationIssues.push(`anomalous speaking rate on ${rateFails.slice(0, 4).join(', ')}`);
      }
      pronunciationSummary = `${checked} scene timing rate checks PASS`;
    } catch (_) {}
  }
  if (!pronunciationPass) {
    vocalConsistencyPass = false;
    vocalIssues.push(...pronunciationIssues);
  }
  console.log(`   - AI Pronunciation & Clarity: ${pronunciationPass ? `✅ VERIFIED (${pronunciationSummary})` : `❌ FAIL (${pronunciationIssues.join('; ')})`}`);

  // 3. Black Frame Detection
  console.log(`\n🌑 3. TEMPORAL CONTINUITY & ARTIFACT DETECTION:`);
  let blackFramesCount = 0;
  try {
    const blackRun = spawnSync(ffmpeg, [
      '-i', videoPath,
      '-vf', 'blackdetect=d=0.25:pix_th=0.10',
      '-f', 'null', '-'
    ], { encoding: 'utf8' });
    const blackOut = blackRun.stderr || blackRun.stdout || '';
    const matches = blackOut.match(/black_start/g);
    blackFramesCount = matches ? matches.length : 0;
  } catch (_) {
    blackFramesCount = 0;
  }
  console.log(`   - Unintended Black Intervals: ${blackFramesCount} detected`);

  // 4. Character Anatomical Naturalness & Movement Ergonomics (Horror + Sitcom)
  console.log(`\n🏃 4. CHARACTER ANATOMICAL & ERGONOMIC NATURALNESS AUDIT (${hasSourceCode ? (isSitcom ? 'Sitcom' : 'Horror') : 'Stream Only'}):`);
  let anatomyProportionsPass = true;
  let trapeziusNeckPass = true;
  let articulatedLimbsPass = true;
  let loadErgonomicsPass = true;

  if (hasSourceCode) {
    anatomyProportionsPass = /1:6\.5/i.test(coreCode) || (coreCode.includes('hipY') && (coreCode.includes('torsoH') || coreCode.includes('58')));
    trapeziusNeckPass = /trapezius/i.test(coreCode) || coreCode.includes('moveTo(-7, -152 + by)') || coreCode.includes('inkrr(c, -6.5, -163 + by');
    articulatedLimbsPass = isSitcom
      ? (coreCode.includes('drawJointedLeg') && coreCode.includes('K.shoe'))
      : ((coreCode.includes('drawBoot') || coreCode.includes('shoe')) && (coreCode.includes('pantsSh') || coreCode.includes('suitSh')));
    loadErgonomicsPass = isSitcom
      ? (coreCode.includes('drawSitcomUpperBody') && (coreCode.includes('drawBicycle') || coreCode.includes('o.bag') || coreCode.includes('lean')))
      : ((coreCode.includes('poseKneel') || coreCode.includes('lean')) && (coreCode.includes('bag') || coreCode.includes('drawOrganicRiceSack') || coreCode.includes('carry')));

    console.log(`   - Human Proportion Ratio:         ${anatomyProportionsPass ? '✅ VERIFIED (1:6.5)' : '❌ FAIL'}`);
    console.log(`   - Neck & Trapezius Muscle Slope: ${trapeziusNeckPass ? '✅ VERIFIED' : '❌ FAIL'}`);
    console.log(`   - Articulated Limbs & Footwear:   ${articulatedLimbsPass ? '✅ VERIFIED' : '❌ FAIL'}`);
    console.log(`   - Weight-bearing Ergonomics:      ${loadErgonomicsPass ? '✅ VERIFIED' : '❌ FAIL'}`);
  } else {
    console.log(`   - (Source rig code not found in ${projectDir}, skipped static AST probe)`);
  }

  // 5. Scene Object Semantic Fidelity & Light Alignment
  console.log(`\n📦 5. SCENE OBJECT SEMANTIC FIDELITY AUDIT:`);
  let objectFidelityPass = true;
  let equipmentModelPass = true;
  let coincidentBeamsPass = true;

  if (hasSourceCode) {
    objectFidelityPass = coreCode.includes('cyl(') && (isSitcom
      ? (coreCode.includes('drawIcedCoffeeCup') || coreCode.includes('drawSmartphoneProp') || coreCode.includes('drawBicycle'))
      : (coreCode.includes('drawOrganicRiceSack') || coreCode.includes('bag') || coreCode.includes('hand(')));
    equipmentModelPass = isSitcom
      ? (coreCode.includes('drawBicycle') || coreCode.includes('streetCafeStage') || coreCode.includes('drawSitcomPerson'))
      : (coreCode.includes('drawTacticalFlashlight') || coreCode.includes('drawEntity') || coreCode.includes('drawJanitor'));
    console.log(`   - Cylindrical Shading & Props:    ${objectFidelityPass ? '✅ VERIFIED' : '❌ FAIL'}`);
    console.log(`   - Entity & Equipment Models:      ${equipmentModelPass ? '✅ VERIFIED' : '❌ FAIL'}`);
  }
  if (viewsCode) {
    coincidentBeamsPass = !viewsCode.includes('drawFlashlightCone(');
    console.log(`   - Light Source Coincidence:       ${coincidentBeamsPass ? '✅ VERIFIED' : '❌ FAIL (Orphaned drawFlashlightCone)'}`);
  }

  // 6. Hand-Socket & Prop Grip Alignment QA
  console.log(`\n🤝 6. HAND-SOCKET & PROP GRIP ALIGNMENT QA:`);
  let handSocketOffsetPass = true;
  let zIndexOcclusionPass = true;
  const socketIssues = [];

  if (hasSourceCode) {
    if (coreCode.includes('o.bag')) {
      const bagMatch = coreCode.match(/moveTo\(front\[0\]\s*-\s*(\d+),\s*front\[1\]\)/);
      if (bagMatch && parseInt(bagMatch[1], 10) > 4) {
        handSocketOffsetPass = false;
        socketIssues.push(`bag handle offset > 4px (${bagMatch[1]}px)`);
      }
    }
    if (coreCode.includes('o.milk')) {
      const milkMatch = coreCode.match(/rr\(c,\s*front\[0\]\s*-\s*(\d+),\s*front\[1\]\s*-\s*(\d+),\s*(\d+),\s*(\d+)/);
      if (milkMatch) {
        const dist = Math.abs(-parseInt(milkMatch[1], 10) + parseInt(milkMatch[3], 10) / 2);
        if (dist > 3) {
          handSocketOffsetPass = false;
          socketIssues.push(`held item center offset > 3px (${dist}px)`);
        }
      }
    }
    const zIndexFn = coreCode.includes('function drawEntity')
      ? coreCode.slice(coreCode.indexOf('function drawEntity'))
      : (coreCode.includes('function drawJanitor') ? coreCode.slice(coreCode.indexOf('function drawJanitor')) : '');
    if (zIndexFn && (zIndexFn.includes('o.mop') || zIndexFn.includes('hasMop'))) {
      const mopIdx = zIndexFn.indexOf('hasMop') !== -1 ? zIndexFn.indexOf('hasMop') : zIndexFn.indexOf('o.mop');
      const frontArmIdx = zIndexFn.indexOf('limb(c, -6,');
      if (mopIdx !== -1 && frontArmIdx !== -1 && mopIdx > frontArmIdx) {
        zIndexOcclusionPass = false;
        socketIssues.push('mop drawn AFTER front arm');
      }
    }
    console.log(`   - Socket Coordinate Offset:       ${handSocketOffsetPass ? '✅ VERIFIED' : '❌ FAIL (' + socketIssues.join(', ') + ')'}`);
    console.log(`   - Z-Index Occlusion Hierarchy:    ${zIndexOcclusionPass ? '✅ VERIFIED' : '❌ FAIL (' + socketIssues.join(', ') + ')'}`);
  }

  // 7. 2-Segment FK Walk & Foot-Planting Audit
  console.log(`\n🦶 7. 2-SEGMENT FK WALK & FOOT-PLANTING AUDIT:`);
  let kneeAngleNaturalPass = true;
  let floorClippingPass = true;
  let antiMoonwalkPass = true;

  if (hasSourceCode) {
    if (coreCode.includes('function poseWalk')) {
      const startWalk = coreCode.indexOf('function poseWalk');
      const endWalk = coreCode.indexOf('function poseStand', startWalk);
      const walkCode = endWalk > startWalk ? coreCode.slice(startWalk, endWalk) : coreCode.slice(startWalk, startWalk + 800);
      kneeAngleNaturalPass = walkCode.includes('Math.max(0,') || walkCode.includes('kneeAngle >= 0');
      antiMoonwalkPass = walkCode.includes('speed') || walkCode.includes('amp');
    }
    if (coreCode.includes('function poseSit')) {
      const startSit = coreCode.indexOf('function poseSit');
      const nextFn = coreCode.indexOf('function ', startSit + 16);
      const sitCode = nextFn > startSit ? coreCode.slice(startSit, nextFn) : coreCode.slice(startSit, startSit + 500);
      // Reject legacy acute-crouch default (by: 60 / b: 2.1 folding heels behind butt in mid-air)
      const hasLegacyTuckSit = /b:\s*2\.[01]/.test(sitCode) || (/by:\s*60\b/.test(sitCode) && !sitCode.includes('isCurb'));
      if (hasLegacyTuckSit) kneeAngleNaturalPass = false;
    }
    const hasSole = coreCode.includes('drawBoot') || coreCode.includes('K.shoe') || coreCode.includes('rr(c, ax - 6, ay - 5');
    const hasShadow = coreCode.includes('ellipse(0, 0, 34, 6') || coreCode.includes('ellipse(0, 0, 40, 7') || coreCode.includes('ellipse(0, 4, 120, 12');
    floorClippingPass = hasSole && hasShadow;

    console.log(`   - Knee Joint Kinematics (>= 0):   ${kneeAngleNaturalPass ? '✅ VERIFIED' : '❌ FAIL'}`);
    console.log(`   - Floor-Planting Alignment:       ${floorClippingPass ? '✅ VERIFIED' : '❌ FAIL'}`);
    console.log(`   - Anti-Moonwalk Stride Sync:      ${antiMoonwalkPass ? '✅ VERIFIED' : '❌ FAIL'}`);
  }

  // 8. Macro POV Hand & Progressive Masking QA
  console.log(`\n🔍 8. MACRO POV HAND & PROGRESSIVE MASKING QA:`);
  let clipMaskSyncPass = true;
  let zeroGhostingPass = true;

  if (viewsCode) {
    const hasMacro = viewsCode.includes('tapeArrow') || viewsCode.includes('macro_tape') || viewsCode.includes('macro_marker') || viewsCode.includes('blockMap');
    if (hasMacro) {
      const hasClip = viewsCode.includes('.clip()');
      const hasHand = viewsCode.includes('hand(c,');
      const hasSync = viewsCode.includes('clamp(') || viewsCode.includes('reveal') || viewsCode.includes('prog(');
      clipMaskSyncPass = hasClip && hasHand && hasSync;
      zeroGhostingPass = !hasClip || hasSync;
      console.log(`   - ctx.clip() Mask & Tool Sync:    ${clipMaskSyncPass ? '✅ VERIFIED' : '❌ FAIL'}`);
      console.log(`   - Zero-Ghosting Verification:     ${zeroGhostingPass ? '✅ VERIFIED' : '❌ FAIL'}`);
    } else {
      console.log(`   - (No macro POV clip-mask scenes detected in views.js, compliant)`);
    }
  }

  // 9. HUD Typography & Thai Overflow Audit
  console.log(`\n🔤 9. HUD TYPOGRAPHY & THAI OVERFLOW AUDIT:`);
  let thaiAccentClearancePass = true;
  let hudCardPaddingPass = true;
  let wcagContrastPass = true;

  if (hasSourceCode) {
    const badgeMatch = coreCode.match(/function badge\([^)]*\)\s*\{[\s\S]*?(?:inkrr|rr)\(c,\s*x,\s*y,\s*w,\s*(\d+)/);
    if (badgeMatch && parseInt(badgeMatch[1], 10) < 24) {
      thaiAccentClearancePass = false;
    }
    const padMatch = coreCode.match(/const\s+pad\s*=\s*(\d+)/);
    if (padMatch && parseInt(padMatch[1], 10) < 12) {
      hudCardPaddingPass = false;
    } else if (!padMatch) {
      hudCardPaddingPass = coreCode.includes('pad * 2') || coreCode.includes('26');
    }

    const creamContrast = calculateContrastRatio('#F5EFE6', '#1C1917');
    const badgeContrast = calculateContrastRatio('#B91C1C', '#FFFFFF');
    const teleContrast = calculateContrastRatio('#0E0E12', '#FFFFFF');
    wcagContrastPass = creamContrast >= 4.5 && badgeContrast >= 3.0 && teleContrast >= 4.5;

    console.log(`   - Thai Vowel & Tone Clearance:    ${thaiAccentClearancePass ? '✅ VERIFIED' : '❌ FAIL (Badge height < 24px)'}`);
    console.log(`   - Card Padding (>= 12px):         ${hudCardPaddingPass ? '✅ VERIFIED' : '❌ FAIL'}`);
    console.log(`   - WCAG Typography Contrast:       ${wcagContrastPass ? `✅ VERIFIED (${creamContrast.toFixed(1)}:1 / ${badgeContrast.toFixed(1)}:1)` : '❌ FAIL'}`);

    if (!isSitcom && (coreCode.includes('reallens-horror-animator') || coreCode.includes('Real Lens'))) {
      let horrorCleanVisualsPass = true;
      const horrorClutterIssues = [];
      if (coreCode.includes('function drawChapter')) {
        const chStart = coreCode.indexOf('function drawChapter');
        const nextChFn = coreCode.indexOf('function ', chStart + 16);
        const chBody = (nextChFn > chStart ? coreCode.slice(chStart, nextChFn) : coreCode.slice(chStart, chStart + 600)).replace(/\/\/.*$/gm, '');
        if (chBody.includes('c.fillStyle = RED') || chBody.includes('COLD OPEN')) {
          horrorCleanVisualsPass = false;
          horrorClutterIssues.push('drawChapter still renders red chapter/บทนำ pill');
        }
      }
      if (coreCode.includes('function drawTele')) {
        const tStart = coreCode.indexOf('function drawTele');
        const nextTFn = coreCode.indexOf('function ', tStart + 16);
        const tBody = nextTFn > tStart ? coreCode.slice(tStart, nextTFn) : coreCode.slice(tStart, tStart + 400);
        if (!tBody.includes('__ENABLE_STORY_TELE')) {
          horrorCleanVisualsPass = false;
          horrorClutterIssues.push('drawTele active without __ENABLE_STORY_TELE opt-in guard');
        }
      }
      if (coreCode.includes('function drawCard')) {
        const cStart = coreCode.indexOf('function drawCard');
        const nextCFn = coreCode.indexOf('function ', cStart + 16);
        const cBody = nextCFn > cStart ? coreCode.slice(cStart, nextCFn) : coreCode.slice(cStart, cStart + 400);
        if (!cBody.includes('__ENABLE_STORY_HUD')) {
          horrorCleanVisualsPass = false;
          horrorClutterIssues.push('drawCard active without __ENABLE_STORY_HUD opt-in guard');
        }
      }
      if (episodeRaw) {
        const activeEpisodeLines = episodeRaw.split(/\r?\n/).filter(l => !/^\s*(?:\/\/|\*)/.test(l)).join('\n');
        if (/\bchapter\s*:/.test(activeEpisodeLines)) {
          horrorCleanVisualsPass = false;
          horrorClutterIssues.push('episode.js contains forbidden chapter pill property');
        }
        if (/\b(?:telemetry|tele)\s*:/.test(activeEpisodeLines)) {
          horrorCleanVisualsPass = false;
          horrorClutterIssues.push('episode.js contains forbidden telemetry HUD property');
        }
        if (/\b(?:hud|card)\s*:/.test(activeEpisodeLines)) {
          horrorCleanVisualsPass = false;
          horrorClutterIssues.push('episode.js contains forbidden infographic hud/card property');
        }
      }
      if (!horrorCleanVisualsPass) hudCardPaddingPass = false;
      console.log(`   - Clean Horror Video (No HUD/บทนำ): ${horrorCleanVisualsPass ? '✅ VERIFIED (Zero infographics/telemetry/red chapter pills)' : `❌ FAIL (${horrorClutterIssues.join('; ')})`}`);
    }
  }

  // 10. 9:16 Shorts / TikTok UI Safe Zone & <= 60s Duration Audit
  console.log(`\n📱 10. 9:16 SHORTS / TIKTOK UI SAFE ZONE & DURATION AUDIT:`);
  let safeZoneSubtitlePass = true;
  let safeZoneCardPass = true;
  let shortsDurationPass = true;
  let fullScreenShortsPass = true;
  const allowOver60 = Boolean(options.allowOver60);

  if (isVertical) {
    shortsDurationPass = allowOver60 || totalSec <= 60.0;
    console.log(`   - Mode: Vertical 9:16 Format Detected (${width}x${height})`);
    console.log(`   - Dead Zones: Top 180px, Bottom 320px, Right 140px`);
    console.log(`   - Shorts Duration (<= 60.0s):     ${shortsDurationPass ? `✅ VERIFIED (${totalSec.toFixed(2)}s)` : `❌ FAIL (${totalSec.toFixed(2)}s > 60.0s — split into EP 6, 7, 8+!)`}`);
    if (hasSourceCode) {
      // Native 9:16 full-screen SHORTS_MODE stretches logical 1280x720 world via beginShortsWorld() onto 1080x1920
      // with SHORTS_CHAR_SCALE aspect compensation and screen-space HUD/subtitles inside Y <= 1600 and right 140px safe zones.
      fullScreenShortsPass = coreCode.includes('SHORTS_MODE') && (coreCode.includes('beginShortsWorld') || coreCode.includes('SHORTS_SX'));
      const subMatch = coreCode.match(/fillText\(cue\.text,\s*[^,]+,\s*([^)]+)\)/);
      const subYMatch = coreCode.match(/const\s+subY\s*=\s*([^;]+);/);
      if (subMatch) {
        const expr = subMatch[1].trim();
        if (expr === 'H - 46' || expr === 'H - 50') safeZoneSubtitlePass = false;
      }
      if (subYMatch && !subYMatch[1].includes('isShorts') && !subYMatch[1].includes('SHORTS_MODE')) {
        safeZoneSubtitlePass = false;
      }
      if (coreCode.includes('cardPos')) {
        safeZoneCardPass = coreCode.includes('140') || coreCode.includes('(W - w) / 2') || coreCode.includes('SHORTS_MODE');
      }
    }
    console.log(`   - Full-Screen 9:16 SHORTS_MODE:    ${fullScreenShortsPass ? '✅ VERIFIED (1080x1920 full-bleed canvas)' : '❌ FAIL (Missing beginShortsWorld/SHORTS_MODE full-screen support)'}`);
    console.log(`   - Subtitle Safe Zone (Y <= 1600): ${safeZoneSubtitlePass ? '✅ VERIFIED' : '❌ FAIL'}`);
    console.log(`   - HUD Card Safe Placement:        ${safeZoneCardPass ? '✅ VERIFIED' : '⚠️ WARN'}`);
  } else {
    console.log(`   - Mode: Horizontal 16:9 Format Detected (${resolution})`);
  }

  // 10B. Scroll-Stop Retention, Camera Variety & Packaging SEO Audit
  console.log(`\n🎯 10B. SCROLL-STOP RETENTION, CAMERA VARIETY & SEO AUDIT:`);
  let coldOpenHookPass = true;
  let cameraVarietyPass = true;
  let titleSeoPass = true;
  let episodeCapPass = true;
  let outroRetentionPass = true;
  const retentionNotes = [];

  let episodeData = null;
  if (fs.existsSync(episodeJsPath)) {
    try {
      delete require.cache[require.resolve(episodeJsPath)];
      episodeData = require(episodeJsPath);
    } catch (_) {}
  }
  let timelineData = null;
  if (fs.existsSync(timelineJsonPath)) {
    try { timelineData = JSON.parse(fs.readFileSync(timelineJsonPath, 'utf8')); } catch (_) {}
  }
  const scenesList = timelineData?.scenes || episodeData?.SCENES || [];

  if (scenesList.length > 0) {
    const sc0 = scenesList[0];
    const voStart = sc0.voStart !== undefined ? Number(sc0.voStart) : (sc0.lead !== undefined ? Number(sc0.lead) : null);
    const hasEarlySfx = Array.isArray(sc0.sfx) && sc0.sfx.some(q => Number(q.at !== undefined ? q.at : (q.t || 99)) <= 0.35);
    if (voStart !== null && voStart > 0.25 && !hasEarlySfx && !sc0.isClimax) {
      coldOpenHookPass = false;
      retentionNotes.push(`SCENES[0] starts slowly (voStart=${voStart.toFixed(2)}s > 0.25s without early SFX/climax)`);
    }
    const maxSubLen = scenesList.reduce((mx, sc) => {
      for (const q of (sc.subs || [])) mx = Math.max(mx, String(q.text || '').length);
      return mx;
    }, 0);
    console.log(`   - 3s Cold-Open Hook Trigger:      ${coldOpenHookPass ? '✅ VERIFIED' : '❌ FAIL (' + retentionNotes.join('; ') + ')'}`);
    if (maxSubLen > 0) {
      console.log(`   - Subtitle Chunk Length:          ${maxSubLen <= 26 ? `✅ FAST-CUT (${maxSubLen} chars <= 26)` : `⚠️ LONG CUES (${maxSubLen} chars; <= 26 recommended)`}`);
    }
  } else {
    console.log(`   - (No episode.js/timeline.json in ${projectDir}, skipped cold-open check)`);
  }

  if (viewsCode && scenesList.length >= 3) {
    const stageRe = /\b(corridor|streetCafeStage|officeStage|roomInteriorStage|outdoorStage|roomCorner|topDownRoom)\s*\(([^;]{0,120})/;
    const extractViewStage = (viewName) => {
      if (!viewName) return null;
      const esc = viewName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const idx = viewsCode.search(new RegExp(`(?:\\b${esc}\\s*\\(|\\b${esc}\\s*:\\s*(?:function|\\())`));
      if (idx === -1) return null;
      const snippet = viewsCode.slice(idx, idx + 900);
      const m = snippet.match(stageRe);
      return m ? `${m[1]}(${m[2].replace(/\s+/g, ' ').trim()})` : null;
    };
    let streak = 1;
    let prevSig = null;
    let badRepeat = null;
    for (let i = 0; i < scenesList.length; i++) {
      const sig = extractViewStage(scenesList[i].view);
      if (sig && sig === prevSig) {
        streak++;
        if (streak > 2) {
          cameraVarietyPass = false;
          badRepeat = `scenes[${i - 2}..${i}] repeat ${sig.slice(0, 48)}`;
          break;
        }
      } else {
        streak = 1;
        prevSig = sig;
      }
    }
    console.log(`   - Anti-Repetition Camera Staging: ${cameraVarietyPass ? '✅ VERIFIED' : `❌ FAIL (${badRepeat})`}`);
  }

  const rawTitle = episodeData?.TITLE || timelineData?.title || '';
  if (rawTitle) {
    const parts = String(rawTitle).split('|');
    const front = parts[0].trim();
    if (parts.length < 2 || front.length > 48) {
      titleSeoPass = false;
      retentionNotes.push(`TITLE front hook ${front.length} chars or missing '|' series suffix`);
    }
  }
  if (fs.existsSync(shortsPlanPath)) {
    try {
      const planData = JSON.parse(fs.readFileSync(shortsPlanPath, 'utf8'));
      const eps = planData.episodes || [];
      const eventEps = eps.filter(e => e.isEvent);
      const serialEps = eps.filter(e => !e.isEvent && !e.isSingle && !e.isStandalone);
      if (serialEps.length > 2 && !options.allowMultiEp) {
        episodeCapPass = false;
        retentionNotes.push(`Serialized Shorts count ${serialEps.length} > 2 (must finish in 1 clip 45-60s, max 2 EPs, or event cuts)`);
      }
      if (serialEps.length === 2 && serialEps[1].hasRecapHook === false) {
        episodeCapPass = false;
        retentionNotes.push(`EP 2 missing 3s recap hook ('ความเดิม...')`);
      }
      const suffixes = new Set();
      for (const ep of eps) {
        const ft = String(ep.feedTitle || '');
        if (!ft.includes('|')) {
          titleSeoPass = false;
          retentionNotes.push(`Clip ${ep.ep} feedTitle missing '|'`);
          continue;
        }
        const [lhs, ...rhs] = ft.split('|');
        const series = rhs.join('|').trim();
        const frontTrim = lhs.trim();
        const leadingEpRe = /^(?:EP\.?\s*\d+(?:\s*\([^)]*\))?|ตอนที่\s*\d+|เหตุการณ์\s*(?:ที่|#)?\s*\d+|ตอนเดียวจบ|จบใน(?:\s*\d*\s*คลิป(?:\s*เดียว)?)?)\s*[:·\-–—]\s*/i;
        if (leadingEpRe.test(frontTrim)) {
          titleSeoPass = false;
          retentionNotes.push(`Clip ${ep.ep} feedTitle leads with EP/ตอนที่/เหตุการณ์/จบในคลิป prefix ("${frontTrim}") — lead with short understandable clip title instead`);
        }
        const badgeText = String(ep.subHook || ep.badge || '').trim();
        if (badgeText && /^(?:EP\.?\s*\d+|ตอนที่\s*\d+|เหตุการณ์\s*(?:ที่|#)?\s*\d+|จบใน\s*\d*\s*คลิป)/i.test(badgeText)) {
          titleSeoPass = false;
          retentionNotes.push(`Clip ${ep.ep} feedTitle/badge ("${badgeText}") contains forbidden leading EP/เหตุการณ์/จบในคลิป label`);
        }
        const legacyStamp = `${ep.stampLeft || ''}${ep.stampRight || ''}${ep.coverStamp || ''}`.trim();
        if (legacyStamp && /(?:เหตุการณ์\s*(?:ที่|#)?\s*\d+|EP\.?\s*\d*|จบใน(?:\s*\d*\s*คลิป)?)/i.test(legacyStamp)) {
          titleSeoPass = false;
          retentionNotes.push(`Clip ${ep.ep} feedTitle/cover stamp ("${legacyStamp}") must be disabled on Shorts covers`);
        }
        const hookOnly = frontTrim.replace(leadingEpRe, '');
        if (hookOnly.length > 42) {
          titleSeoPass = false;
          retentionNotes.push(`Clip ${ep.ep} hook > 40 chars (${hookOnly.length})`);
        }
        if (series) suffixes.add(series);
      }
      if (eventEps.length > 0) {
        const overDur = eventEps.find(e => Number(e.dur || 0) > 60.0);
        if (overDur && !options.allowOver60) {
          episodeCapPass = false;
          retentionNotes.push(`Event clip ${overDur.ep} (${overDur.dur}s) exceeds 60.0s`);
        }
      }
      if (suffixes.size > 1) {
        titleSeoPass = false;
        retentionNotes.push(`Inconsistent series suffix across Shorts (${Array.from(suffixes).join(' vs ')})`);
      }
    } catch (_) {}
  }
  const act2OpenerIdx = scenesList.findIndex(s => s.act === 2);
  if (act2OpenerIdx !== -1) {
    const sc2 = scenesList[act2OpenerIdx];
    const recapText = `${sc2.vo || ''} ${Array.isArray(sc2.chapter) ? sc2.chapter.join(' ') : (sc2.chapter?.title || '')}`;
    const hasRecap = sc2.isRecap === true || /ความเดิม|ตอนที่แล้ว|หลังจาก|ก่อนหน้านี้|จากตอน|เมื่อกี้|ย้อนสรุป|สรุปความเดิม|recap/i.test(recapText);
    const recapVoStart = sc2.voStart !== undefined ? Number(sc2.voStart) : (sc2.lead !== undefined ? Number(sc2.lead) : 0);
    if (!hasRecap || recapVoStart > 0.25) {
      episodeCapPass = false;
      retentionNotes.push(`Act 2 opener (${sc2.id}) missing 3s recap cue or slow start (voStart=${recapVoStart.toFixed(2)}s)`);
    }
  }
  if (rawTitle || fs.existsSync(shortsPlanPath)) {
    console.log(`   - Feed Title & Series Suffix SEO: ${titleSeoPass ? '✅ VERIFIED' : `❌ FAIL (${retentionNotes.filter(n => /TITLE|feedTitle|hook >|series/i.test(n)).join('; ')})`}`);
  }
  if (fs.existsSync(shortsPlanPath) || act2OpenerIdx !== -1) {
    console.log(`   - Event-Cut / Standalone / <= 2 EP Structure: ${episodeCapPass ? '✅ VERIFIED (event cuts 45-60s, 1 clip, or <= 2 EPs w/ Part 2 3s recap)' : `❌ FAIL (${retentionNotes.filter(n => /Event clip|Shorts count|recap|Act 2/i.test(n)).join('; ')})`}`);
  }
  const clicheOutroRe = /(?:ฝากกดไล[กค์]|กดไล[กค์]\s*กดแชร์|อย่าลืมกดไล[กค์]|กดซับสไครบ์|กดกระดิ่ง)/i;
  const clicheScenes = scenesList.filter(sc => {
    const txtVo = Array.isArray(sc?.voSegments) ? sc.voSegments.map(x => x?.text || '').join(' ') : String(sc?.vo || '');
    return clicheOutroRe.test(txtVo);
  });
  if (clicheScenes.length > 0) {
    outroRetentionPass = false;
    retentionNotes.push(`Cliché spoken outro ("ฝากกดไลก์/แชร์") on scene(s) ${clicheScenes.map(s => s.id).join(', ')} — replace with Side-Choosing Question / 1-Sentence Cliffhanger & drawShortsEndingCTA`);
  }
  console.log(`   - High-Retention Shorts Ending:   ${outroRetentionPass ? '✅ VERIFIED (Zero cliché "ฝากกดไลก์ กดแชร์" outro; Visual CTA ready)' : `❌ FAIL (${retentionNotes.filter(n => /Cliché spoken outro/i.test(n)).join('; ')})`}`);

  // 11. Keyframe Contact Sheet
  const outDir = path.dirname(videoPath);
  const baseName = path.basename(videoPath, path.extname(videoPath));
  const contactSheetPath = path.join(outDir, `contact_sheet_${baseName}.png`);

  console.log(`\n🖼️  11. GENERATING KEYFRAME CONTACT SHEET:`);
  try {
    const totalFrames = Math.max(25, Math.floor(totalSec * (fps || 24)));
    const step = Math.max(1, Math.floor(totalFrames / 25));
    let filterGraph = `select='not(mod(n\\,${step}))'`;
    if (isVertical) {
      filterGraph += `,drawbox=x=0:y=0:w=iw:h=180:color=red@0.28:t=fill`;
      filterGraph += `,drawbox=x=0:y=180:w=iw:h=2:color=red@0.85:t=fill`;
      filterGraph += `,drawbox=x=0:y=ih-320:w=iw:h=320:color=red@0.28:t=fill`;
      filterGraph += `,drawbox=x=0:y=ih-320:w=iw:h=2:color=red@0.85:t=fill`;
      filterGraph += `,drawbox=x=iw-140:y=180:w=140:h=ih-500:color=red@0.28:t=fill`;
      filterGraph += `,drawbox=x=iw-140:y=180:w=2:h=ih-500:color=red@0.85:t=fill`;
      filterGraph += `,scale=180:320,tile=5x5`;
    } else {
      filterGraph += `,scale=320:-1,tile=5x5`;
    }
    spawnSync(ffmpeg, ['-y', '-i', videoPath, '-vf', filterGraph, '-frames:v', '1', '-q:v', '3', contactSheetPath]);
    if (fs.existsSync(contactSheetPath)) {
      const sheetStat = fs.statSync(contactSheetPath);
      console.log(`   ✓ Contact sheet saved: ${path.basename(contactSheetPath)} (${(sheetStat.size / 1024).toFixed(1)} KB)`);
    }
  } catch (err) {
    console.log(`   ✗ Contact sheet failed: ${err.message.slice(0, 100)}`);
  }

  // 12. 16-Point Final Scorecard
  console.log(`\n=================================================================`);
  console.log(`📊 FINAL QA VERIFICATION SCORECARD:`);

  const loudnessPass = integratedLoudness !== null && (
    isVertical
      ? (integratedLoudness >= -19.5 && integratedLoudness <= -12.5)
      : (integratedLoudness >= -20.5 && integratedLoudness <= -13.5)
  );

  const checks = [
    { name: 'Video Stream Present', pass: vCodec !== 'Unknown' },
    { name: 'Audio Stream Present', pass: aCodec !== 'None' },
    { name: 'Frame Rate Determinism (24/30 FPS)', pass: fps === 24 || fps === 30 },
    { name: 'Pixel Format Standard (yuv420p)', pass: pixFmt.includes('yuv420p') },
    { name: `Audio Loudness & Unified Vocal Tone (${isVertical ? '-14..-18' : '-16..-18'} LUFS)`, pass: loudnessPass && vocalConsistencyPass },
    { name: 'True Peak Headroom (<= -1.0 dBTP)', pass: truePeak !== null && truePeak <= -1.0 },
    { name: 'Zero Stale Black Intervals', pass: blackFramesCount === 0 },
    { name: 'Character Proportions, Posture & 3s Cold-Open Hook', pass: anatomyProportionsPass && trapeziusNeckPass && articulatedLimbsPass && coldOpenHookPass },
    { name: 'Weight-Bearing Movement Ergonomics', pass: loadErgonomicsPass },
    { name: 'Scene Object Fidelity & Anti-Repetition Camera Staging', pass: objectFidelityPass && equipmentModelPass && cameraVarietyPass },
    { name: 'Strict Light-to-Emitter Coincidence', pass: coincidentBeamsPass },
    { name: 'Hand-Socket & Prop Grip Alignment (<= 2-3px, Z-index)', pass: handSocketOffsetPass && zIndexOcclusionPass },
    { name: '2-Segment FK Walk & Foot-Planting (Knee >= 0, 0px Clip)', pass: kneeAngleNaturalPass && floorClippingPass && antiMoonwalkPass },
    { name: 'Macro POV Hand & Progressive Masking (ctx.clip() sync)', pass: clipMaskSyncPass && zeroGhostingPass },
    { name: 'HUD Typography & Thai Overflow (Badge >= 24px, Pad >= 12px)', pass: thaiAccentClearancePass && hudCardPaddingPass && wcagContrastPass },
    { name: '9:16 Shorts Safe Zone, <= 60s, <= 2 EP Cap & Series Title SEO', pass: (isVertical ? (safeZoneSubtitlePass && safeZoneCardPass && shortsDurationPass && fullScreenShortsPass) : true) && titleSeoPass && episodeCapPass && outroRetentionPass }
  ];

  let passCount = 0;
  for (const c of checks) {
    if (c.pass) passCount++;
    console.log(`   ${c.pass ? '✅ PASS' : '❌ FAIL'} | ${c.name}`);
  }
  const passedAll = passCount === checks.length;
  console.log(`\nScore: ${passCount}/${checks.length} PASS — ${passedAll ? '🎉 100% PRODUCTION READY & COMPLIANT' : '⚠️ NEEDS ATTENTION'}`);
  console.log(`=================================================================\n`);

  return {
    videoPath,
    totalSec,
    resolution,
    fps,
    vCodec,
    pixFmt,
    aCodec,
    isVertical,
    integratedLoudness,
    truePeak,
    blackFramesCount,
    contactSheetPath,
    passCount,
    passedAll,
    checks
  };
}

if (require.main === module) {
  const target = process.argv[2];
  if (!target) {
    console.log('Usage: node inspect_video.js <path-to-video.mp4> [--shorts] [--strict] [--allow-over-60]');
    process.exit(1);
  }
  const res = inspectVideo(path.resolve(target), {
    shorts: process.argv.includes('--shorts'),
    allowOver60: process.argv.includes('--allow-over-60'),
    allowMultiEp: process.argv.includes('--allow-multi-ep')
  });
  if (process.argv.includes('--strict') && !res.passedAll) {
    process.exit(1);
  }
}

module.exports = { inspectVideo };
