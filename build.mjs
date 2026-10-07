// esbuild арқылы құрастыру: npm run build  (dist/ папкасына)  |  npm run dev  (http://localhost:5173)
import * as esbuild from 'esbuild';
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import http from 'node:http';
import { join, extname } from 'node:path';

const serve = process.argv.includes('--serve');
const out = process.env.LITE ? 'dist-lite' : 'dist';
rmSync(out, { recursive: true, force: true });
mkdirSync(out + '/assets', { recursive: true });

const opts = {
  entryPoints: ['src/main.tsx'], bundle: true, outfile: out + '/assets/app.js',
  jsx: 'automatic', minify: !serve, sourcemap: serve, target: 'es2020', format: 'iife',
  define: { __LITE__: process.env.LITE ? 'true' : 'false', __SLIM__: process.env.SLIM ? 'true' : 'false' }, logLevel: 'info',
};
const copyStatic = () => {
  cpSync('public', out, { recursive: true, filter: (s) => !(process.env.LITE || process.env.SLIM) || !/public\/images\/(family|memories|gallery)/.test(s) });
  cpSync('src/styles.css', out + '/assets/styles.css');
  cpSync('index.html', out + '/index.html');
};
if (serve) {
  const ctx = await esbuild.context(opts);
  await ctx.watch(); copyStatic();
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff': 'font/woff', '.svg': 'image/svg+xml' };
  http.createServer((req, res) => {
    let p = decodeURIComponent((req.url || '/').split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    if (p === '/assets/styles.css') copyStatic();
    const f = join(out, p);
    if (!existsSync(f)) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': types[extname(f).toLowerCase()] || 'application/octet-stream' }); res.end(readFileSync(f));
  }).listen(5173, () => console.log('http://localhost:5173'));
} else {
  await esbuild.build(opts); copyStatic();
  console.log('Дайын: dist/ папкасын кез келген хостингке жүктеңіз.');
}
