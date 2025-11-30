const esbuild = require('esbuild');
const path = require('path');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',
  setup(build) {
    build.onStart(() => {
      console.log('[extension] build started');
    });
    build.onEnd((result) => {
      if (result.errors.length > 0) {
        result.errors.forEach(({ text, location }) => {
          console.error(`✘ [ERROR] ${text}`);
          if (location) {
            console.error(`    ${location.file}:${location.line}:${location.column}:`);
          }
        });
      } else {
        console.log('[extension] build finished successfully');
      }
    });
  },
};

async function main() {
  console.log(`Building extension in ${production ? 'production' : 'development'} mode...`);
  
  const ctx = await esbuild.context({
    entryPoints: ['src/extension/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    outfile: 'dist/extension/extension.js',
    external: ['vscode'],
    logLevel: 'info',
    plugins: [
      esbuildProblemMatcherPlugin,
    ],
  });

  if (watch) {
    console.log('Watching for changes...');
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
    console.log('Extension built to dist/extension/extension.js');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
