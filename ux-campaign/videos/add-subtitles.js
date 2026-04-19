/**
 * Burn think-aloud observations as subtitles into the per-persona highlight videos.
 *
 * For each persona×flow clip:
 *   1. Define observations extracted from session transcripts
 *   2. Generate an SRT subtitle file with evenly-distributed timestamps
 *   3. Use ffmpeg subtitles filter to burn them in
 *   4. Re-concatenate per-persona clips into highlight reels
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FFMPEG = 'C:/Users/badmo/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe';
const FFPROBE = 'C:/Users/badmo/AppData/Local/Microsoft/WinGet/Links/ffprobe.exe';
const EDITED_DIR = 'D:/devel/mlflow/ux-campaign/videos/edited';
const OUT_DIR = path.join(EDITED_DIR, 'subtitled');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function run(cmd, opts = {}) {
  console.log(`  > ${cmd.substring(0, 160)}...`);
  try {
    return execSync(cmd, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024, ...opts });
  } catch (e) {
    console.error(`  ERROR: ${e.stderr ? e.stderr.substring(e.stderr.length - 400) : e.message.substring(0, 400)}`);
    return null;
  }
}

function getDuration(file) {
  const out = run(`"${FFPROBE}" -v error -show_entries format=duration -of csv=p=0 "${file}"`);
  return out ? parseFloat(out.trim()) : 0;
}

// ========== OBSERVATIONS PER PERSONA x FLOW ==========
// Each entry: { icon, text } where icon is an emoji tag for the observation type

const OBSERVATIONS = {
  priya_flowA: [
    { icon: 'THINK', text: 'Priya: "Let me see what MLflow looks like..."' },
    { icon: 'RESULT', text: 'Landing page: GenAI-focused layout, experiments buried at bottom' },
    { icon: 'EMOTION', text: 'Slightly overwhelmed - then relieved finding experiment' },
    { icon: 'THINK', text: '"Everything says No data available? Where are my runs?"' },
    { icon: 'FRICTION', text: 'Experiment overview defaults to empty observability charts' },
    { icon: 'THINK', text: '"6 matching runs? But I only see one row"' },
    { icon: 'FRICTION', text: 'Child runs hidden - no visual expand indicator' },
    { icon: 'THINK', text: '"accuracy 0.946, roc_auc 0.991 - those are the CV averages!"' },
    { icon: 'POSITIVE', text: 'Run detail shows rich metrics (12) and parameters (23)' },
    { icon: 'THINK', text: '"I wish I could see per-fold values in a line chart"' },
    { icon: 'THINK', text: '"metrics.confusion_matrix.png - let me click it"' },
    { icon: 'POSITIVE', text: 'Confusion matrix renders inline - delighted!' },
    { icon: 'THINK', text: '"skore_version 0.0.0+unknown is odd... what is artifact URI?"' },
    { icon: 'FRICTION', text: 'Confused by MLflow jargon (artifact URI, Run ID)' },
  ],

  marcus_flowA: [
    { icon: 'THINK', text: 'Marcus: "MLflow 3.10 - went all-in on GenAI huh"' },
    { icon: 'EMOTION', text: 'Impatient - mildly annoyed at LLM-first landing' },
    { icon: 'FRICTION', text: 'Overview shows traces/latency - useless for sklearn' },
    { icon: 'THINK', text: '"No metric columns in runs table? In W&B I would see them"' },
    { icon: 'THINK', text: '"accuracy 0.946 std 0.065 - variance is high for iris"' },
    { icon: 'THINK', text: '"One dot per chart? These are useless for single-run CV"' },
    { icon: 'POSITIVE', text: 'Rich artifact set: HTML report, PNGs, CSV from skore' },
    { icon: 'THINK', text: '"report.pkl only useful if you have skore installed"' },
  ],

  david_flowA: [
    { icon: 'THINK', text: 'David: "I will navigate entirely with keyboard"' },
    { icon: 'A11Y', text: '37 Tab presses to reach experiment - no skip-nav link' },
    { icon: 'EMOTION', text: 'Patient but noting issues' },
    { icon: 'A11Y', text: '20 more Tabs to reach Training runs link' },
    { icon: 'THINK', text: '"Tabbing 40 presses - cannot reach run link in ag-grid"' },
    { icon: 'A11Y', text: 'BLOCKER: ag-grid table not keyboard-navigable' },
    { icon: 'EMOTION', text: 'Frustrated - must use URL bar workaround' },
    { icon: 'THINK', text: '"Tabs have ARIA role=tab but ArrowRight does nothing"' },
    { icon: 'A11Y', text: 'Arrow key navigation between tabs broken' },
    { icon: 'THINK', text: '"165 total Tab presses across session - no skip-nav anywhere"' },
  ],

  marcus_flowB: [
    { icon: 'THINK', text: 'Marcus: "I need to compare runs for pre-MLOps review"' },
    { icon: 'FRICTION', text: 'Cannot expand parent run to see child folds' },
    { icon: 'THINK', text: '"Compare button appeared - but only 1 run to select"' },
    { icon: 'EMOTION', text: 'Hopeful then disappointed - only 1 selectable run' },
    { icon: 'THINK', text: '"No Register Model button? In MLflow 1.x/2.x there was one"' },
    { icon: 'FRICTION', text: 'No Register Model button on run detail page' },
    { icon: 'POSITIVE', text: 'Rich artifacts: HTML report, PNGs, CSV for review' },
    { icon: 'THINK', text: '"No Download/Export buttons? Must use REST API"' },
    { icon: 'FRICTION', text: 'No download button for artifacts, no export for run data' },
    { icon: 'VERDICT', text: 'Verdict: "Enough for preliminary assessment but comparison/export severely lacking"' },
  ],

  lena_flowB: [
    { icon: 'THINK', text: 'Lena: "Where are my runs?"' },
    { icon: 'EMOTION', text: 'Impatient - "I dont care about getting started!"' },
    { icon: 'FRICTION', text: 'Empty experiment overview - "No data available? What??"' },
    { icon: 'THINK', text: '*rage-clicking* Traces? No data. Sessions? No data.' },
    { icon: 'EMOTION', text: 'Very frustrated - none of these are relevant to sklearn' },
    { icon: 'THINK', text: '"Training runs? FINALLY something that sounds right"' },
    { icon: 'THINK', text: '"accuracy 1.0 on this fold? But I want ALL folds side by side!"' },
    { icon: 'FRICTION', text: 'Each fold must be visited individually - no comparison table' },
    { icon: 'THINK', text: '"metrics.csv! But where is the download button?"' },
    { icon: 'FRICTION', text: 'No download button for artifact files' },
    { icon: 'EMOTION', text: 'Resigned - would abandon UI for Python client' },
  ],

  david_flowB: [
    { icon: 'THINK', text: 'David: "Trying to select runs with keyboard..."' },
    { icon: 'A11Y', text: '30 Tab presses - cannot reach ag-grid rows' },
    { icon: 'A11Y', text: 'BLOCKER: Cannot select runs for comparison via keyboard' },
    { icon: 'THINK', text: '"ArrowRight does NOT move focus between tabs - same as Flow A"' },
    { icon: 'A11Y', text: 'Arrow key navigation still broken on run detail tabs' },
    { icon: 'THINK', text: '"Comparison workflow completely blocked for keyboard users"' },
    { icon: 'VERDICT', text: 'Dealbreaker: Cannot use Compare feature at all via keyboard' },
  ],

  priya_flowC: [
    { icon: 'THINK', text: 'Priya: "I hope there is a template notebook for skore+mlflow"' },
    { icon: 'FRICTION', text: 'No skore/mlflow template or getting-started wizard' },
    { icon: 'THINK', text: '"Kernel says No Kernel at first - that is confusing"' },
    { icon: 'FRICTION', text: 'No autocomplete for skore imports' },
    { icon: 'POSITIVE', text: 'Imports executed successfully!' },
    { icon: 'THINK', text: '"It worked! But where do I see this in MLflow? No link anywhere"' },
    { icon: 'FRICTION', text: 'No link/button to navigate from notebook to MLflow UI' },
  ],

  lena_flowC: [
    { icon: 'THINK', text: 'Lena: "Let me just get a notebook going quick"' },
    { icon: 'EMOTION', text: '"Some popup... No. Close it." *clicks without reading*' },
    { icon: 'POSITIVE', text: 'Rage-clicking Launcher handled gracefully - no duplicates' },
    { icon: 'THINK', text: '"from skore import Project... that should work right?"' },
    { icon: 'POSITIVE', text: 'Imports succeeded without errors' },
    { icon: 'FRICTION', text: 'Kernel shows "Unknown" status during execution' },
    { icon: 'THINK', text: '"Done. But how do I see this in MLflow? No link anywhere"' },
    { icon: 'VERDICT', text: 'Lena rates the experience: 3/10' },
  ],

  'david_flowC-1': [
    { icon: 'THINK', text: 'David: "Can I navigate JupyterLab entirely with keyboard?"' },
    { icon: 'A11Y', text: 'JP-BUTTON has NO visible focus ring - bad start' },
    { icon: 'A11Y', text: '20 Tabs - Launcher cards NEVER in Tab order' },
    { icon: 'A11Y', text: 'BLOCKER: Cannot create new notebook via keyboard' },
  ],

  'david_flowC-2': [
    { icon: 'THINK', text: 'David: "I will have to use the existing notebook"' },
    { icon: 'FRICTION', text: 'IndentationError - pre-existing cell content caused issues' },
    { icon: 'THINK', text: '"What are these ipywidgets warnings? Confusing"' },
    { icon: 'POSITIVE', text: 'Command mode shortcuts (Escape, B, Ctrl+S) all work!' },
    { icon: 'POSITIVE', text: '"Skip to main panel" link found - good a11y pattern' },
  ],

  'david_flowC-3': [
    { icon: 'A11Y', text: 'Focus ring audit: 1/10 elements missing focus indicator' },
    { icon: 'THINK', text: '"Cell editing works great. BUT Launcher is inaccessible"' },
    { icon: 'A11Y', text: 'WCAG failures: 2.1.1 (Keyboard), 2.4.7 (Focus Visible)' },
    { icon: 'VERDICT', text: 'David: "Satisfied with reservations - Launcher is the blocker"' },
  ],
};

// ========== SRT GENERATION ==========

function formatSrtTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

function generateSrt(observations, duration) {
  const lines = [];
  const n = observations.length;
  // Each observation gets an equal time slice, with 0.3s gap between
  const gap = 0.3;
  const sliceDuration = (duration - gap * (n - 1)) / n;
  const minSlice = 2.0; // minimum display time per subtitle

  let t = 0;
  for (let i = 0; i < n; i++) {
    const obs = observations[i];
    const displayTime = Math.max(minSlice, sliceDuration);
    const end = Math.min(t + displayTime, duration - 0.1);

    // Format icon prefix
    let prefix = '';
    switch (obs.icon) {
      case 'THINK': prefix = '[Think-Aloud] '; break;
      case 'EMOTION': prefix = '[Emotion] '; break;
      case 'FRICTION': prefix = '[UX Friction] '; break;
      case 'POSITIVE': prefix = '[UX Positive] '; break;
      case 'A11Y': prefix = '[Accessibility] '; break;
      case 'RESULT': prefix = '[Result] '; break;
      case 'VERDICT': prefix = '[Verdict] '; break;
      default: prefix = ''; break;
    }

    lines.push(`${i + 1}`);
    lines.push(`${formatSrtTime(t)} --> ${formatSrtTime(end)}`);
    lines.push(`${prefix}${obs.text}`);
    lines.push('');

    t = end + gap;
    if (t >= duration) break;
  }

  return lines.join('\n');
}

// ========== BURN SUBTITLES ==========

function burnSubtitles(inputFile, srtFile, outputFile) {
  // ffmpeg subtitles filter needs forward slashes and escaped colons for Windows paths
  const srtPath = srtFile.replace(/\\/g, '/').replace(/:/g, '\\:');

  const cmd = `"${FFMPEG}" -y -i "${inputFile}" ` +
    `-vf "subtitles='${srtPath}':force_style='FontSize=11,FontName=Arial,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,MarginV=30,WrapStyle=2'" ` +
    `-c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -r 30 "${outputFile}"`;

  run(cmd, { timeout: 180000 });

  if (fs.existsSync(outputFile) && fs.statSync(outputFile).size > 1000) {
    const dur = getDuration(outputFile);
    console.log(`  => ${path.basename(outputFile)} (${dur.toFixed(1)}s)`);
    return true;
  }
  return false;
}

// ========== CONCATENATE HIGHLIGHT REELS ==========

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

console.log('=== Burning Observations into Highlight Videos ===\n');

// Map of clip filename (without .mp4) -> observation key
const CLIP_MAP = [
  { clip: 'priya_flowA', obs: 'priya_flowA' },
  { clip: 'priya_flowC', obs: 'priya_flowC' },
  { clip: 'marcus_flowA', obs: 'marcus_flowA' },
  { clip: 'marcus_flowB', obs: 'marcus_flowB' },
  { clip: 'lena_flowB', obs: 'lena_flowB' },
  { clip: 'lena_flowC', obs: 'lena_flowC' },
  { clip: 'david_flowA', obs: 'david_flowA' },
  { clip: 'david_flowB', obs: 'david_flowB' },
  { clip: 'david_flowC-1', obs: 'david_flowC-1' },
  { clip: 'david_flowC-2', obs: 'david_flowC-2' },
  { clip: 'david_flowC-3', obs: 'david_flowC-3' },
];

const personaClips = {};

for (const { clip, obs } of CLIP_MAP) {
  const inputFile = path.join(EDITED_DIR, `${clip}.mp4`);
  if (!fs.existsSync(inputFile)) {
    console.log(`SKIP: ${clip}.mp4 not found`);
    continue;
  }

  const observations = OBSERVATIONS[obs];
  if (!observations || observations.length === 0) {
    console.log(`SKIP: no observations for ${obs}`);
    continue;
  }

  const duration = getDuration(inputFile);
  if (duration < 1) {
    console.log(`SKIP: ${clip}.mp4 too short`);
    continue;
  }

  console.log(`\n--- ${clip} (${duration.toFixed(1)}s, ${observations.length} observations) ---`);

  // Generate SRT
  const srtFile = path.join(OUT_DIR, `${clip}.srt`);
  const srtContent = generateSrt(observations, duration);
  fs.writeFileSync(srtFile, srtContent);
  console.log(`  SRT: ${path.basename(srtFile)}`);

  // Burn subtitles
  const outputFile = path.join(OUT_DIR, `${clip}.mp4`);
  const ok = burnSubtitles(inputFile, srtFile, outputFile);

  if (ok) {
    const persona = clip.split('_')[0];
    if (!personaClips[persona]) personaClips[persona] = [];
    personaClips[persona].push(outputFile);
  }
}

// Create highlight reels
console.log('\n\n=== Creating Subtitled Highlight Reels ===\n');

for (const persona of ['priya', 'marcus', 'lena', 'david']) {
  const clips = personaClips[persona] || [];
  if (clips.length === 0) {
    console.log(`${persona}: no clips`);
    continue;
  }

  const outputFile = path.join(OUT_DIR, `${persona}_highlight.mp4`);
  console.log(`${persona}: ${clips.length} clips`);
  concatenatePersona(persona, clips, outputFile);
}

// Summary
console.log('\n=== Summary ===');
const allMp4 = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.mp4')).sort();
for (const f of allMp4) {
  const fp = path.join(OUT_DIR, f);
  const dur = getDuration(fp);
  const sizeMB = (fs.statSync(fp).size / 1048576).toFixed(1);
  console.log(`  ${f}: ${dur.toFixed(1)}s, ${sizeMB} MB`);
}
