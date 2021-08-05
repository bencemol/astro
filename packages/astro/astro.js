#!/usr/bin/env node
/* eslint-disable no-console */
'use strict';

// ISOMORPHIC FILE: NO TOP-LEVEL IMPORT/REQUIRE() ALLOWED
// This file has to run as both ESM and CJS on older Node.js versions
// Assume ESM to start, and then call `require()` below once CJS is confirmed.
// Needed for Stackblitz: https://github.com/stackblitz/webcontainer-core/issues/281

const CI_INTRUCTIONS = {
  NETLIFY: 'https://docs.netlify.com/configure-builds/manage-dependencies/#node-js-and-javascript',
  GITHUB_ACTIONS: 'https://docs.github.com/en/actions/guides/building-and-testing-nodejs#specifying-the-nodejs-version',
  VERCEL: 'https://vercel.com/docs/runtimes#official-runtimes/node-js/node-js-version',
};

async function main() {
  // Check for ESM support by loading the "supports-esm" in an way that works in both ESM & CJS.
  const supportsESM = typeof require !== 'undefined' ? require('supports-esm') : (await import('supports-esm')).default;

  // Supported: load Astro and run. Enjoy!
  if (supportsESM) {
    return import('./dist/cli.js')
      .then(({ cli }) => cli(process.argv))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  }

  // Not supported: Report the most helpful error message possible.
  const pkg = require('./package.json');
  const ci = require('ci-info');
  const semver = require('semver');
  const engines = pkg.engines.node;
  const version = process.versions.node;

  // TODO: Remove "semver" in Astro v1.0: This is mainly just to check our work. Once run in
  // the wild for a bit without error, we can assume our engine range is correct and won't
  // change over time.
  const isSupported = semver.satisfies(version, engines);
  if (isSupported) {
    console.error(`\nNode.js v${version} is not supported by Astro!
Supported versions: ${engines}\n
Issue Detected! This Node.js version was expected to work, but failed a system check.
Please file an issue so that we can take a look: https://github.com/snowpackjs/astro/issues/new\n`);
  } else {
    console.error(`\nNode.js v${version} is not supported by Astro!
Please upgrade Node.js to a supported version: "${engines}"\n`);
  }

  // Special instructions for CI environments, which may have special steps needed.
  // This is a common issue that we can help users with proactively.
  if (ci.isCI) {
    let platform;
    for (const [key, value] of Object.entries(ci)) {
      if (value === true) {
        platform = key;
        break;
      }
    }
    console.log(`${ci.name} CI Environment Detected!\nAdditional steps may be needed to set your Node.js version:`);
    console.log(`Documentation: https://docs.astro.build/guides/deploy`);
    if (CI_INTRUCTIONS[platform]) {
      console.log(`${ci.name} Documentation: ${CI_INTRUCTIONS[platform]}`);
    }
    console.log(``);
  }

  process.exit(1);
}

main();