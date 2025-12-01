/**
 * esbuild configuration for bundling the server
 * Bundles all server dependencies into a single file
 */

const esbuild = require('esbuild');
const path = require('path');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ['src/server/index.ts'],
    bundle: true,
    outfile: 'dist/server/index.js',
    external: [
      // Native modules that can't be bundled
      'sqlite3',
      'better-sqlite3',
    ],
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    sourcemap: !production,
    minify: production,
    logLevel: 'info',
    define: {
      'process.env.NODE_ENV': production ? '"production"' : '"development"',
    },
  });

  if (watch) {
    await ctx.watch();
    console.log('Watching server...');
  } else {
    await ctx.rebuild();
    await ctx.dispose();
    console.log('Server bundled successfully!');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
