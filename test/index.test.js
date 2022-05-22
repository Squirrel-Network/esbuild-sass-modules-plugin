import fsp from 'fs/promises';
import esb from 'esbuild';

import plugin from '../src/index.js';
import ESBuildSASSModulesPlugin
	from '../src/esbuild-sass-modules-plugin.class.js';
import {
	PATH_SAMPLE_DYNAMIC_SIMPLE_JS, PATH_SAMPLE_DYNAMIC_SIMPLE_JS_COMPILED,
	PATH_SAMPLE_FILE_JS,
	PATH_SAMPLE_FILE_JS_COMPILED,
	PATH_SAMPLE_FILE_UNRESOLVING,
	PATH_SAMPLE_INLINE_JS,
	PATH_SAMPLE_INLINE_JS_COMPILED,
	PATH_SAMPLE_INLINE_UNRESOLVING,
	PATH_SAMPLE_OUTFILE,
	PATH_SAMPLE_SIMPLE_JS,
	PATH_SAMPLE_SIMPLE_JS_COMPILED,
	PATH_SAMPLE_SIMPLE_JS_IMPORT_SASS,
	PATH_SAMPLE_SIMPLE_JS_IMPORT_SASS_COMPILED,
	PATH_SAMPLE_SIMPLE_JS_IMPORT_SCSS,
	PATH_SAMPLE_SIMPLE_JS_IMPORT_SCSS_COMPILED,
	PATH_SAMPLE_SIMPLE_UNRESOLVING,
	PATH_SAMPLES
} from './constants.js';

async function buildSimple() {
	return esb.build(
		{ bundle: true
		, sourceRoot: PATH_SAMPLES
		, entryPoints: [ PATH_SAMPLE_SIMPLE_JS ]
		, outfile: PATH_SAMPLE_OUTFILE
		, minify: true
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
		, minify: true
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
		, minify: true
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
		, minify: true
		, plugins: [ plugin() ]
		}
	);
}

async function buildFileImport() {
	return esb.build(
		{ bundle: true
		, sourceRoot: PATH_SAMPLES
		, entryPoints: [ PATH_SAMPLE_FILE_JS ]
		, outfile: PATH_SAMPLE_OUTFILE
		, minify: true
		, plugins: [ plugin() ]
		}
	);
}

async function buildDynamicImportSCSS() {
	return esb.build(
		{ bundle: true
		, sourceRoot: PATH_SAMPLES
		, entryPoints: [ PATH_SAMPLE_DYNAMIC_SIMPLE_JS ]
		, outfile: PATH_SAMPLE_OUTFILE
		, minify: true
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

async function testBuild(esbResult, compiledPath) {
	await expect(esbResult)
		.resolves
		.toEqual(expect.anything());

	const outfile = await fsp.readFile(PATH_SAMPLE_OUTFILE);
	const compiled = await fsp.readFile(compiledPath);

	expect(outfile.equals(compiled)).toBe(true);
}

async function testSimpleImportBuild() {
	await testBuild(
		buildSimpleImportSCSS(),
		PATH_SAMPLE_SIMPLE_JS_IMPORT_SCSS_COMPILED
	);

	await testBuild(
		buildSimpleImportSASS(),
		PATH_SAMPLE_SIMPLE_JS_IMPORT_SASS_COMPILED
	);
}

async function testInlineImportBuild() {
	await testBuild(
		buildInlineImport(),
		PATH_SAMPLE_INLINE_JS_COMPILED
	);
}

async function testFileImportBuild() {
	await testBuild(
		buildFileImport(),
		PATH_SAMPLE_FILE_JS_COMPILED
	);
}

async function testDynamicImportBuild() {
	await testBuild(
		buildDynamicImportSCSS(),
		PATH_SAMPLE_DYNAMIC_SIMPLE_JS_COMPILED
	);
}

test(
	'Builds and resolves sass imports',
	async function testImportResolverTypes() {
		await testSimpleImportBuild();
		await testInlineImportBuild();
		await testFileImportBuild();
	}
);

test(
	'Builds and resolves dynamic sass imports',
	async function testImportResolverTypes() {
		await testDynamicImportBuild();
	}
);

test(
	'Errors on unresolved files',
	async function testUnresolved() {
		await expect(esb.build(
			{ bundle: true
			, sourceRoot: PATH_SAMPLES
			, entryPoints: [ PATH_SAMPLE_SIMPLE_UNRESOLVING ]
			, outfile: PATH_SAMPLE_OUTFILE
			, plugins: [ plugin() ]
			, logLevel: 'silent'
			}
		)).rejects.toThrow();

		await expect(esb.build(
			{ bundle: true
			, sourceRoot: PATH_SAMPLES
			, entryPoints: [ PATH_SAMPLE_INLINE_UNRESOLVING ]
			, outfile: PATH_SAMPLE_OUTFILE
			, plugins: [ plugin() ]
			, logLevel: 'silent'
			}
		)).rejects.toThrow();

		await expect(esb.build(
			{ bundle: true
			, sourceRoot: PATH_SAMPLES
			, entryPoints: [ PATH_SAMPLE_FILE_UNRESOLVING ]
			, outfile: PATH_SAMPLE_OUTFILE
			, plugins: [ plugin() ]
			, logLevel: 'silent'
			}
		)).rejects.toThrow();
	}
);
