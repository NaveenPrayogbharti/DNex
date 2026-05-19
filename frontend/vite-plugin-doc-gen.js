// Vite Plugin: Auto-regenerate PROJECT_DOCUMENT.md on every file save
// Imported in vite.config.ts

import { generateDocs } from './scripts/generate-docs.mjs';

let debounceTimer = null;
const DEBOUNCE_MS = 1500; // wait 1.5s after last change before regenerating

export function docGenPlugin() {
  return {
    name: 'vite-plugin-doc-gen',
    buildStart() {
      // Regenerate on every build start
      generateDocs();
    },
    handleHotUpdate({ file }) {
      // Only react to src/ changes (ignore node_modules, dist, etc.)
      if (!file.includes('/src/') && !file.includes('\\src\\')) return;
      // Ignore the generated doc itself to prevent infinite loop
      if (file.includes('PROJECT_DOCUMENT')) return;

      // Debounce: don't regenerate for every keystroke
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        generateDocs();
      }, DEBOUNCE_MS);
    },
  };
}
