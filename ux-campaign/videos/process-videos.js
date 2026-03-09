/**
 * Video post-processing for UX campaign
 *
 * For each persona, this script:
 * 1. Maps raw Playwright .webm recordings to sessions
 * 2. Uses ffmpeg scene detection to find idle vs active segments
 * 3. Speeds up idle sections (4x), keeps interactions at normal speed
 * 4. Adds persona name + flow overlay text
 * 5. Outputs one highlight reel per persona as MP4
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FFMPEG = 'C:/Users/badmo/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe';
const FFPROBE = 'C:/Users/badmo/AppData/Local/Microsoft/WinGet/Links/ffprobe.exe';
const VID_DIR = 'D:/devel/mlflow/ux-campaign/videos';
const OUT_DIR = path.join(VID_DIR, 'edited');

// Video-to-session mapping (sorted by creation time, excluding empty files)
const VIDEO_MAP = [
  { file: '7977bd1f182d7c368f7bde8adb303872.webm', persona: 'Priya', flow: 'A', label: 'Experiment Discovery', dur: 103.8 },
  { file: '754066cb2761b312abddca32b0039550.webm', persona: 'Marcus', flow: 'A', label: 'Experiment Discovery', dur: 16.9 },
  { file: '4ebcea1c19b470da1277459caee2f3c3.webm', persona: 'David', flow: 'A', label: 'Experiment Discovery', dur: 126.4 },
  { file: 'f0c6cbbcb1301ba0b831465aa36e2457.webm', persona: 'Marcus', flow: 'B', label: 'Run Comparison', dur: 42.1 },
  { file: '347eaeab6df9a96f19c89b2ce280ceb1.webm', persona: 'Lena', flow: 'B', label: 'Run Comparison', dur: 99.6 },
  { file: '0b15ff7fdc96d74142d2497c170a0722.webm', persona: 'David', flow: 'B', label: 'Run Comparison', dur: 51.2 },
  { file: 'f1dda8393a0fda3fec894f78dcb98225.webm', persona: 'Priya', flow: 'C', label: 'Notebook Setup', dur: 42.2 },
  { file: 'db51ea74f9f97da195a1c03f624c2ada.webm', persona: 'Lena', flow: 'C', label: 'Notebook Setup', dur: 50.1 },
  { file: 'fadef5431620b590f50f20d2aec2c2de.webm', persona: 'David', flow: 'C-1', label: 'Notebook Setup pt1', dur: 19.1 },
  { file: '5fc11410591969ecda9f8894300a5c0d.webm', persona: 'David', flow: 'C-2', label: 'Notebook Setup pt2', dur: 31.5 },
  { file: '360ce4d6d1cbcee6e2209b929e269680.webm', persona: 'David', flow: 'C-3', label: 'Notebook Setup pt3', dur: 26.5 },
];

const PERSONAS = {
  Priya: { fullName: 'Priya Chandrasekaran', role: 'Junior Data Scientist' },
  Marcus: { fullName: 'Marcus Delgado', role: 'Senior MLOps Engineer' },
  Lena: { fullName: 'Lena Kowalski', role: 'Postdoc Researcher (Rage-clicker)' },
  David: { fullName: 'David Okonkwo', role: 'ML Engineer (Keyboard-only)' },
};

function run(cmd, opts = {}) {
  console.log(`  > ${cmd.substring(0, 140)}...`);
  try {
    return execSync(cmd, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024, ...opts });
  } catch (e) {
    console.error(`  ERROR: ${e.stderr ? e.stderr.substring(e.stderr.length - 300) : e.message.substring(0, 300)}`);
    return null;
  }
}

function getDuration(file) {
  const out = run(`"${FFPROBE}" -v error -show_entries format=duration -of csv=p=0 "${file}"`);
  return out ? parseFloat(out.trim()) : 0;
}

/**
 * Use ffmpeg scene change detection to find timestamps where content changes.
 * ffprobe -vf doesn't work, so we use ffmpeg -filter:v select + showinfo.
 */
function detectScenes(inputFile, duration) {
  const sceneThreshold = 0.015;

  // Use ffmpeg with select filter + showinfo, parse pts_time from stderr
  const out = run(
    `"${FFMPEG}" -i "${inputFile}" -filter:v "select='gt(scene,${sceneThreshold})',showinfo" ` +
    `-f null - 2>&1`,
    { timeout: 60000 }
  );

  if (!out) {
    return fallbackSegments(duration);
  }

  // Parse scene change timestamps from showinfo output
  // Lines look like: [Parsed_showinfo...] n:  42 pts: 123456 pts_time:12.345
  const sceneTimes = [];
  const regex = /pts_time:\s*([\d.]+)/g;
  let match;
  while ((match = regex.exec(out)) !== null) {
    const t = parseFloat(match[1]);
    if (!isNaN(t) && t > 0) sceneTimes.push(t);
  }

  if (sceneTimes.length === 0) {
    return fallbackSegments(duration);
  }

  console.log(`  Found ${sceneTimes.length} scene changes`);

  // Build segments: 2s window around each scene change = active, gaps > 3s = idle
  const segments = [];
  let lastEnd = 0;
  const ACTIVE_WINDOW = 1.5;   // keep 0.75s before + 0.75s after each real transition
  const IDLE_THRESHOLD = 2.0;  // gaps > 2s between transitions = idle (speed up 4x)

  for (const t of sceneTimes) {
    const activeStart = Math.max(lastEnd, t - ACTIVE_WINDOW / 2);
    const activeEnd = Math.min(t + ACTIVE_WINDOW / 2, duration);

    if (activeStart - lastEnd > IDLE_THRESHOLD) {
      segments.push({ start: lastEnd, end: activeStart, type: 'idle' });
    } else if (activeStart > lastEnd + 0.1) {
      segments.push({ start: lastEnd, end: activeStart, type: 'active' });
    }

    segments.push({ start: activeStart, end: activeEnd, type: 'active' });
    lastEnd = activeEnd;
  }

  if (lastEnd < duration - 0.5) {
    segments.push({ start: lastEnd, end: duration, type: 'idle' });
  }

  // Merge consecutive same-type segments
  const merged = [segments[0]];
  for (let i = 1; i < segments.length; i++) {
    const last = merged[merged.length - 1];
    if (segments[i].type === last.type) {
      last.end = segments[i].end;
    } else {
      merged.push(segments[i]);
    }
  }

  return merged;
}

function fallbackSegments(duration) {
  // No scene changes found — keep first 3s and last 2s at normal speed, speed up middle
  return [
    { start: 0, end: Math.min(3, duration), type: 'active' },
    { start: Math.min(3, duration), end: Math.max(3, duration - 2), type: 'idle' },
    { start: Math.max(3, duration - 2), end: duration, type: 'active' },
  ];
}

/**
 * Escape text for ffmpeg drawtext filter.
 * Colons, backslashes, and single quotes need special handling.
 */
function escapeDrawtext(text) {
  return text
    .replace(/\\/g, '\\\\\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\u2019");  // replace apostrophe with unicode right single quote
}

/**
 * Process a single video: speed up idle parts, add text overlay
 */
function processVideo(entry, outputFile) {
  const inputFile = path.join(VID_DIR, entry.file);
  if (!fs.existsSync(inputFile)) {
    console.log(`  SKIP: ${entry.file} not found`);
    return false;
  }

  const duration = getDuration(inputFile);
  if (duration < 1) {
    console.log(`  SKIP: ${entry.file} too short (${duration}s)`);
    return false;
  }

  console.log(`  Analyzing ${entry.file} (${duration.toFixed(1)}s)...`);
  const segments = detectScenes(inputFile, duration);

  const activeTotal = segments.filter(s => s.type === 'active').reduce((a, s) => a + (s.end - s.start), 0);
  const idleTotal = segments.filter(s => s.type === 'idle').reduce((a, s) => a + (s.end - s.start), 0);
  console.log(`  Active: ${activeTotal.toFixed(1)}s, Idle: ${idleTotal.toFixed(1)}s (${segments.length} segments)`);

  const persona = PERSONAS[entry.persona];
  const nameText = escapeDrawtext(`${persona.fullName} - ${persona.role}`);
  const flowText = escapeDrawtext(`Flow ${entry.flow} - ${entry.label}`);

  // Build filter_complex: trim each segment, apply speed, concat, then overlay text
  const filterParts = [];
  const streamLabels = [];

  segments.forEach((seg, i) => {
    const speed = seg.type === 'idle' ? 4.0 : 1.0;
    const vLabel = `[v${i}]`;
    filterParts.push(
      `[0:v]trim=start=${seg.start.toFixed(3)}:end=${seg.end.toFixed(3)},setpts=(PTS-STARTPTS)/${speed}${vLabel}`
    );
    streamLabels.push(vLabel);
  });

  // Concat
  const concatInput = streamLabels.join('');
  filterParts.push(
    `${concatInput}concat=n=${streamLabels.length}:v=1:a=0[trimmed]`
  );

  // Text overlay — use escaped text
  filterParts.push(
    `[trimmed]drawtext=text='${nameText}':fontsize=20:fontcolor=white:borderw=2:bordercolor=black:x=20:y=20,` +
    `drawtext=text='${flowText}':fontsize=16:fontcolor=white:borderw=2:bordercolor=black:x=20:y=48[out]`
  );

  const filterComplex = filterParts.join(';\n');

  // Write filter to file (complex filters too long for CLI)
  const filterFile = path.join(OUT_DIR, `filter_${entry.persona}_${entry.flow}.txt`);
  fs.writeFileSync(filterFile, filterComplex);

  const cmd = `"${FFMPEG}" -y -i "${inputFile}" -/filter_complex "${filterFile}" ` +
    `-map "[out]" -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -r 30 "${outputFile}"`;

  const result = run(cmd, { timeout: 180000 });

  try { fs.unlinkSync(filterFile); } catch {}

  if (fs.existsSync(outputFile) && fs.statSync(outputFile).size > 1000) {
    const outDur = getDuration(outputFile);
    console.log(`  => ${path.basename(outputFile)} (${outDur.toFixed(1)}s, was ${duration.toFixed(1)}s)`);
    return true;
  }
  return false;
}

/**
 * Concatenate multiple clips into one per-persona highlight reel
 */
function concatenatePersona(personaName, clipFiles, outputFile) {
  if (clipFiles.length === 0) return false;
  if (clipFiles.length === 1) {
    fs.copyFileSync(clipFiles[0], outputFile);
    console.log(`  Single clip => ${path.basename(outputFile)}`);
    return true;
  }

  const listFile = path.join(OUT_DIR, `concat_${personaName}.txt`);
  const listContent = clipFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n');
  fs.writeFileSync(listFile, listContent);

  const cmd = `"${FFMPEG}" -y -f concat -safe 0 -i "${listFile}" ` +
    `-c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p "${outputFile}"`;

  run(cmd, { timeout: 180000 });

  try { fs.unlinkSync(listFile); } catch {}

  if (fs.existsSync(outputFile) && fs.statSync(outputFile).size > 1000) {
    const dur = getDuration(outputFile);
    console.log(`  => ${path.basename(outputFile)} (${dur.toFixed(1)}s)`);
    return true;
  }
  return false;
}

// ========== MAIN ==========
console.log('=== UX Campaign Video Post-Processing ===\n');

const processedClips = {};

for (const entry of VIDEO_MAP) {
  const outputFile = path.join(OUT_DIR, `${entry.persona.toLowerCase()}_flow${entry.flow}.mp4`);
  console.log(`\n--- ${entry.persona} Flow ${entry.flow} (${entry.label}) ---`);

  const ok = processVideo(entry, outputFile);
  if (ok) {
    if (!processedClips[entry.persona]) processedClips[entry.persona] = [];
    processedClips[entry.persona].push(outputFile);
  }
}

console.log('\n\n=== Creating Per-Persona Highlight Reels ===\n');

for (const [personaName, info] of Object.entries(PERSONAS)) {
  const clips = processedClips[personaName] || [];
  if (clips.length === 0) {
    console.log(`${personaName}: no clips`);
    continue;
  }

  const outputFile = path.join(OUT_DIR, `${personaName.toLowerCase()}_highlight.mp4`);
  console.log(`${info.fullName}: ${clips.length} clips`);
  concatenatePersona(personaName, clips, outputFile);
}

console.log('\n=== Summary ===');
const allMp4 = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.mp4')).sort();
for (const f of allMp4) {
  const fp = path.join(OUT_DIR, f);
  const dur = getDuration(fp);
  const sizeMB = (fs.statSync(fp).size / 1048576).toFixed(1);
  console.log(`  ${f}: ${dur.toFixed(1)}s, ${sizeMB} MB`);
}
