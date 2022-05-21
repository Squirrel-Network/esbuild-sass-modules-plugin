import fsp from 'fs/promises';
import esb from 'esbuild';

import plugin from '../src/index.js';
import ESBuildSASSModulesPlugin
	from '../src/esbuild-sass-modules-plugin.class.js';
import {
	PATH_SAMPLE_INLINE_JS,
	PATH_SAMPLE_INLINE_JS_COMPILED,
	PATH_SAMPLE_OUTFILE,
	PATH_SAMPLE_SIMPLE_JS,
	PATH_SAMPLE_SIMPLE_JS_COMPILED,
	PATH_SAMPLE_SIMPLE_JS_IMPORT_SASS,
	PATH_SAMPLE_SIMPLE_JS_IMPORT_SASS_COMPILED,
	PATH_SAMPLE_SIMPLE_JS_IMPORT_SCSS,
	PATH_SAMPLE_SIMPLE_JS_IMPORT_SCSS_COMPILED,
	PATH_SAMPLES
} from './constants.js';

async function buildSimple() {
	return esb.build(
		{ bundle: true
		, sourceRoot: PATH_SAMPLES
		, entryPoints: [ PATH_SAMPLE_SIMPLE_JS ]
		, outfile: PATH_SAMPLE_OUTFILE
		, plugins: [ plugin() ]
		}
	);
}

async function buildSimpleImportSCSS() {
	return esb.build(
		{ bundle: true
		, sourceRoot: PATH_SAMPLES
		, entryPoints: [ PATH_SAMPLE_SIMPLE_JS_IMPORT_SCSS ]
		, outfile: PATH_SAMPLE_OUTFILE
		, plugins: [ plugin() ]
		}
	);
}

async function buildSimpleImportSASS() {
	return esb.build(
		{ bundle: true
		, sourceRoot: PATH_SAMPLES
		, entryPoints: [ PATH_SAMPLE_SIMPLE_JS_IMPORT_SASS ]
		, outfile: PATH_SAMPLE_OUTFILE
		, plugins: [ plugin() ]
		}
	);
}

async function buildInlineImport() {
	return esb.build(
		{ bundle: true
		, sourceRoot: PATH_SAMPLES
		, entryPoints: [ PATH_SAMPLE_INLINE_JS ]
		, outfile: PATH_SAMPLE_OUTFILE
		, plugins: [ plugin() ]
		}
	);
}

test(
	'Creates the plugin instance',
	async function testPluginInstanceCreation() {
		const p = plugin();

		expect(p.name).toBe(ESBuildSASSModulesPlugin.name);

		await expect(buildSimple()).resolves.toEqual(expect.anything());
	}
);

test(
	'Builds a simple program',
	async function testSimpleBuild() {
		await expect(buildSimple()).resolves.toEqual(expect.anything());

		await expect(fsp.access(PATH_SAMPLE_SIMPLE_JS))
			.resolves.toEqual(undefined);

		const compiledSimple =
			await fsp.readFile(PATH_SAMPLE_SIMPLE_JS_COMPILED);

		await expect(
			fsp.readFile(PATH_SAMPLE_OUTFILE)
				.then(b => b.equals(compiledSimple))
		).resolves.toBe(true);
	}
);

async function testSimpleImportBuild() {
	await expect(buildSimpleImportSCSS())
		.resolves
		.toEqual(expect.anything());

	const compiled =
		await fsp.readFile(PATH_SAMPLE_SIMPLE_JS_IMPORT_SCSS_COMPILED);

	await expect(
		fsp.readFile(PATH_SAMPLE_OUTFILE)
			.then(b => b.equals(compiled))
	).resolves.toBe(true);

	await expect(buildSimpleImportSASS())
		.resolves
		.toEqual(expect.anything());

	const compiledSimpleImportSASS =
		await fsp.readFile(PATH_SAMPLE_SIMPLE_JS_IMPORT_SASS_COMPILED);

	await expect(
		fsp.readFile(PATH_SAMPLE_OUTFILE)
			.then(b => b.equals(compiledSimpleImportSASS))
	).resolves.toBe(true);
}

async function testInlineImportBuild() {
	await expect(buildInlineImport())
		.resolves
		.toEqual(expect.anything());

	const compiled = await fsp.readFile(PATH_SAMPLE_INLINE_JS_COMPILED);

	await expect(
		fsp.readFile(PATH_SAMPLE_OUTFILE)
			.then(b => b.equals(compiled))
	).resolves.toBe(true);
}

test(
	'Builds and resolves sass imports',
	async function testImportResolverTypes() {
		await testSimpleImportBuild();
		await testInlineImportBuild();
	}
);
