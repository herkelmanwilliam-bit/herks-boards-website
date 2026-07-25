import fs from 'fs';
import path from 'path';

const dir = './';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      if (!['node_modules', '.next', '.git', '.vercel', 'public'].includes(f)) {
        walk(dirPath, callback);
      }
    } else {
      if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts') || dirPath.endsWith('.css')) {
        callback(dirPath);
      }
    }
  });
}

walk(dir, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Base Hex Colors from GG Farms -> Herk's Boards (Silver / Dark Blue / White)
  content = content.replace(/#1C1C1C/g, '#0f172a'); // Very dark blue/slate (near black)
  content = content.replace(/#F5F0E1/g, '#f8fafc'); // Crisp white/silver tint
  content = content.replace(/#C9A84C/g, '#94a3b8'); // Elegant silver
  
  // Tailwind Amber (warm/farm) -> Slate (cool/metal/woodshop)
  content = content.replace(/amber-900/g, 'slate-800');
  content = content.replace(/amber-800/g, 'slate-700');
  content = content.replace(/amber-700/g, 'slate-600');
  content = content.replace(/amber-600/g, 'slate-500');
  content = content.replace(/amber-500/g, 'slate-400');
  content = content.replace(/amber-400/g, 'slate-300');
  content = content.replace(/amber-300/g, 'slate-200');
  content = content.replace(/amber-200/g, 'slate-100');
  content = content.replace(/amber-100/g, 'slate-50');
  content = content.replace(/amber-50/g, 'white');

  // De-bubbly the UI (replace large rounded corners with sharp/elegant small corners)
  content = content.replace(/rounded-3xl/g, 'rounded-sm');
  content = content.replace(/rounded-2xl/g, 'rounded-sm');
  content = content.replace(/rounded-xl/g, 'rounded-sm');
  content = content.replace(/rounded-lg/g, 'rounded-sm');

  fs.writeFileSync(filePath, content);
});
