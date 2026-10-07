import fs from 'node:fs';
import path from 'node:path';

const roots = [
  'src/features/editor/modules/document',
  'src/features/editor/modules/links',
  'src/features/editor/modules/writing',
  'src/features/editor/modules/appendices',
];

// mapping base -> {targetBase, targetOpacity} where targetOpacity like "/10" or null
const map = {
  'slate-50': { base: 'muted', op: null },
  'slate-100': { base: 'muted', op: null },
  'slate-200': { base: 'secondary', op: null }, // text exception handled separately
  // slate-300 handled specially
  'slate-400': { base: 'muted-foreground', op: null },
  'slate-500': { base: 'muted-foreground', op: null },
  'slate-600': { base: 'secondary-foreground', op: null },
  'slate-700': { base: 'secondary-foreground', op: null },
  // slate-800/900 handled specially for dark:
  'slate-950': { base: 'foreground', op: null },
  'blue-50': { base: 'primary', op: '/10' },
  'blue-100': { base: 'primary', op: '/15' },
  'blue-200': { base: 'primary', op: '/30' },
  'blue-400': { base: 'primary', op: null },
  'blue-500': { base: 'primary', op: null },
  'blue-600': { base: 'primary', op: null },
  'blue-700': { base: 'primary', op: '/90' },
  'blue-800': { base: 'primary', op: null },
  'indigo-50': { base: 'primary', op: '/10' },
  'indigo-100': { base: 'primary', op: '/15' },
  'indigo-500': { base: 'primary', op: null },
  'indigo-600': { base: 'primary', op: null },
  'indigo-700': { base: 'primary', op: '/90' },
  'red-50': { base: 'destructive', op: '/10' },
  'red-100': { base: 'destructive', op: '/10' },
  'red-200': { base: 'destructive', op: '/20' },
  'red-500': { base: 'destructive', op: null },
  'red-600': { base: 'destructive', op: null },
  'rose-50': { base: 'destructive', op: '/10' },
  'rose-500': { base: 'destructive', op: null },
  'rose-600': { base: 'destructive', op: null },
  'rose-700': { base: 'destructive', op: null },
};

function getSlateTarget(color, shade, utilityBase, variants) {
  const key = `${color}-${shade}`;
  if (color !== 'slate') return null;
  const isDark = variants.includes('dark:');
  const isText = utilityBase === 'text' || utilityBase === 'placeholder-text' || utilityBase.endsWith('text');
  // Actually utilityBase for placeholder:text case: we parse utility as "text" with variant "placeholder:".
  // So check utilityBase === 'text'
  if (shade === '50' || shade === '100') return map[key];
  if (shade === '200') {
    if (utilityBase === 'text') return { base: 'muted-foreground', op: null };
    return { base: 'secondary', op: null };
  }
  if (shade === '300') {
    if (utilityBase === 'text') return { base: 'muted-foreground', op: null };
    if (utilityBase === 'border' || utilityBase.startsWith('border-')) return { base: 'border', op: null };
    // scrollbar-thumb, bg, divide, ring etc -> secondary
    return { base: 'secondary', op: null };
  }
  if (shade === '400' || shade === '500') return map[key];
  if (shade === '600' || shade === '700') return map[key];
  if (shade === '800') {
    if (isDark) return { base: 'muted', op: null };
    return { base: 'foreground', op: null };
  }
  if (shade === '900') {
    if (isDark) return { base: 'secondary', op: null };
    return { base: 'foreground', op: null };
  }
  if (shade === '950') return map[key];
  return null;
}

function walk(dir, out=[]) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile() && (p.endsWith('.tsx') || p.endsWith('.ts'))) out.push(p);
  }
  return out;
}

let files = [];
for (const r of roots) {
  if (fs.existsSync(r)) files.push(...walk(r));
}
// Only process .tsx to avoid service template literals (.ts). But also process .tsx only.
// Per analysis, eslint only flags .tsx className, and .ts service strings are template literals to skip.
files = files.filter(f => f.endsWith('.tsx'));

console.log(`Found ${files.length} .tsx files`);

// utility pattern: keep prefix, change token
// variants: (?:[a-z0-9-]+:)*  e.g. dark:, hover:, focus-within:, dark:hover:, placeholder:, sm:, etc.
// utility: bg|text|border(-[tblrxyse]+)?|divide|ring(-offset)?|scrollbar-thumb|scrollbar-track|outline|decoration|from|via|to|accent|caret
// For placeholder:text-*, variants include placeholder:, utility text. Good.
// For border-t-blue-600, utility border-t. Good.
// For divide-slate-100, utility divide. Good.
const utilPat = '(bg|text|border(?:-[tblrxyse]+)?|divide|ring(?:-offset)?|scrollbar-thumb|scrollbar-track|outline|decoration|from|via|to|accent|caret)';
const variantPat = '((?:[a-z0-9-]+:)*)';
// color-shade with optional opacity /digits
// NOTE: longest shades first + (?![0-9]) to avoid 50 matching prefix of 500
const colorPat = '(slate|blue|indigo|red|rose)-(950|900|800|700|600|500|400|300|200|100|50)(?![0-9])(/[0-9]+)?';
const fullRe = new RegExp(variantPat + utilPat + '-' + colorPat, 'g');

// white/black without shade
const wbRe = new RegExp(variantPat + utilPat + '-(white|black)(/[0-9]+)?', 'g');

let changedFiles = {};
let totalReplacements = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  let fileCount = 0;
  let newLines = lines.map((line, idx) => {
    // NEVER touch forbidden lines
    if (line.includes('backgroundColor') || line.includes('.hex') || line.includes('style={{') || line.includes('mark.style') || line.includes('element.style') || line.includes('targetEl.style') || line.includes('originalBg') || line.includes('fill=') || line.includes('stroke=') || line.includes('<style')) {
      return line;
    }
    // Also skip lines with querySelector containing class? They don't have Tailwind colors anyway.
    let newLine = line;

    // white/black handling first
    newLine = newLine.replace(wbRe, (m, variants, util, color, op) => {
      const hasOp = !!op;
      const srcOp = op || '';
      if (color === 'white') {
        if (util === 'bg') {
          // bg-white -> bg-card
          const targetOp = '';
          const finalOp = hasOp ? srcOp : targetOp;
          fileCount++;
          totalReplacements++;
          return `${variants}${util}-card${finalOp}`;
        } else if (util === 'text') {
          const finalOp = hasOp ? srcOp : '';
          fileCount++;
          totalReplacements++;
          return `${variants}${util}-primary-foreground${finalOp}`;
        } else {
          // SKIP border-white etc (not in mapping)
          return m;
        }
      } else if (color === 'black') {
        // black -> foreground, keep utility, preserve opacity
        fileCount++;
        totalReplacements++;
        return `${variants}${util}-foreground${srcOp}`;
      }
      return m;
    });

    // mapped color-shade handling
    newLine = newLine.replace(fullRe, (m, variants, util, color, shade, op) => {
      const key = `${color}-${shade}`;
      // Only mapped keys (slate all, plus listed blue/indigo/red/rose). Unmapped shades will not match? Actually regex matches any of those shades, but map may not contain (e.g., blue-300, red-700, etc). Need to check if in allowed mapping.
      // Allowed: slate all 50-950, blue 50,100,200,400,500,600,700,800, indigo 50,100,500,600,700, red 50,100,200,500,600, rose 50,500,600,700
      const allowed = new Set([
        'slate-50','slate-100','slate-200','slate-300','slate-400','slate-500','slate-600','slate-700','slate-800','slate-900','slate-950',
        'blue-50','blue-100','blue-200','blue-400','blue-500','blue-600','blue-700','blue-800',
        'indigo-50','indigo-100','indigo-500','indigo-600','indigo-700',
        'red-50','red-100','red-200','red-500','red-600',
        'rose-50','rose-500','rose-600','rose-700',
      ]);
      if (!allowed.has(key)) return m; // SKIP unmapped shade

      let target;
      if (color === 'slate') {
        target = getSlateTarget(color, shade, util, variants);
      } else {
        target = map[key];
      }
      if (!target) return m;
      const srcOp = op || '';
      const hasSrcOp = !!op;
      // Preserve opacity exactly: if source has /xx, keep it; else use target's /yy if any
      let finalOp = '';
      if (hasSrcOp) finalOp = srcOp;
      else if (target.op) finalOp = target.op;
      fileCount++;
      totalReplacements++;
      return `${variants}${util}-${target.base}${finalOp}`;
    });

    return newLine;
  });

  const newContent = newLines.join('\n');
  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles[file] = fileCount;
    console.log(`EDIT ${file}: ${fileCount} replacements`);
  }
}

console.log(`\nTotal files changed: ${Object.keys(changedFiles).length}`);
console.log(`Total replacements: ${totalReplacements}`);
for (const [f,c] of Object.entries(changedFiles)) console.log(`${c}\t${f}`);
