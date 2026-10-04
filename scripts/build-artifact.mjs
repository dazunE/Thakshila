// Builds the single-page hosted version into dist-artifact/doodle-tutor.html.
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

execSync('npx vite build --config vite.artifact.config.ts', { stdio: 'inherit' });

const assets = join('dist-artifact', 'build', 'assets');
const files = readdirSync(assets);
const css = files.filter((f) => f.endsWith('.css')).map((f) => readFileSync(join(assets, f), 'utf8')).join('\n');
const js = files.filter((f) => f.endsWith('.js')).map((f) => readFileSync(join(assets, f), 'utf8')).join('\n');
const fonts = readFileSync('index.html', 'utf8').match(/https:\/\/fonts\.googleapis\.com\/css2[^"]+/)[0];

// The host wraps this in <html><head><body>, so we only write the page content.
const page = `<title>Doodle Tutor</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fonts}">
<style>
${css}
</style>
<div id="root"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script type="module">
${js.replace(/<\/script/gi, '<\\/script')}
</script>
`;
writeFileSync(join('dist-artifact', 'doodle-tutor.html'), page);
console.log(`dist-artifact/doodle-tutor.html  ${(page.length / 1024).toFixed(1)} kB`);
