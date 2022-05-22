import plugin from '../src/index.js';
import esb from 'esbuild';
import _ from 'lodash';
import fsp from 'fs/promises';

import {
	PATH_SAMPLE_DYNAMIC_SIMPLE_JS,
	PATH_SAMPLE_FILE_JS,
	PATH_SAMPLE_INLINE_JS,
	PATH_SAMPLE_OUTFILE,
	PATH_SAMPLE_SIMPLE_JS,
	PATH_SAMPLE_SIMPLE_JS_IMPORT_SASS,
	PATH_SAMPLE_SIMPLE_JS_IMPORT_SCSS,
	PATH_SAMPLES
} from './constants.js';
import ESBuildSASSModulesPlugin, { ImportResolver } from '../src/esbuild-sass-modules-plugin.class.js';
import p from 'path';

const COMMON_ESBUILD_OPTIONS =
	{ bundle: true
	, sourceRoot: PATH_SAMPLES
	, outfile: PATH_SAMPLE_OUTFILE
	, minify: true
	, plugins: [ plugin() ]
	}

async function commonESBuildTest(entryPoint) {
	return esb.build(_(COMMON_ESBUILD_OPTIONS).merge(
		{ entryPoints: [ entryPoint ] }
	).valueOf());
}

async function silentESBuildTest(entryPoint) {
	return esb.build(_(COMMON_ESBUILD_OPTIONS).merge(
		{ entryPoints: [ entryPoint ]
		, logLevel: 'silent'
		}
	).valueOf())
}

async function buildSimple() {
	return commonESBuildTest(PATH_SAMPLE_SIMPLE_JS);
}

async function buildSimpleImportSCSS() {
	return commonESBuildTest(PATH_SAMPLE_SIMPLE_JS_IMPORT_SCSS);
}

async function buildSimpleImportSASS() {
	return commonESBuildTest(PATH_SAMPLE_SIMPLE_JS_IMPORT_SASS);
}

async function buildInlineImport() {
	return commonESBuildTest(PATH_SAMPLE_INLINE_JS);
}

async function buildFileImport() {
	return commonESBuildTest(PATH_SAMPLE_FILE_JS);
}

async function buildDynamicImportSCSS() {
	return commonESBuildTest(PATH_SAMPLE_DYNAMIC_SIMPLE_JS);
}

async function expectToBuild(esbResult) {
	await expect(esbResult).resolves.toEqual(expect.anything());
}

async function expectNotToBuild(esbResult) {
	await expect(esbResult).rejects.toThrow();
}

async function expectOutfileToMatch(expectedPath) {
	const outfile = await fsp.readFile(PATH_SAMPLE_OUTFILE);
	const compiled = await fsp.readFile(expectedPath);

	expect(outfile.equals(compiled)).toBe(true);
}

async function testBuild(esbResult, compiledPath) {
	await expectToBuild(esbResult);

	await expectOutfileToMatch(compiledPath);
}

async function testSASSbuild(loadFn, sourcePath, compiledPath) {
	const scssTestCompiled =
		await fsp.readFile(compiledPath)
			.then(b => b.toString('utf8'));

	await expect(
		loadFn(
			{ path: sourcePath
			, pluginData:
				{ importResolver: ImportResolver.BUNDLE
				, loader: 'css'
				}
			}
		)
	).resolves.toMatchObject(
		{ contents: scssTestCompiled
		, loader: 'css'
		}
	);
}

function chainTestSASSbuild(sourcePath, compiledPath) {
	return async loadFn => testSASSbuild(loadFn, sourcePath, compiledPath)
		.then(() => loadFn);
}

async function expectImportResolverToMatch(type, scssPath, importer) {
	await expect(new Promise((ok, fail) => {
		const plugin = new ESBuildSASSModulesPlugin();

		const fakeEsb =
			{ async onResolve(filter, fn) {
				const
					{ path: pathSCSS
					, namespace: namespaceSCSS
					, pluginData
					} = await fn(
					{ path: scssPath
					, kind: 'import-statement'
					, importer
					, resolveDir:
						p.dirname(scssPath)
					}
				);

				expect(pluginData)
					.toMatchObject(
						{ importResolver: type }
					);
			}
			, async onLoad(filter, fn) {
				ok();
			}
			, async resolve() {
				return { path: scssPath };
			}
			};

		expect(() => plugin.setup(fakeEsb)).not.toThrow();
	})).resolves.toBeUndefined();
}

export
	{ COMMON_ESBUILD_OPTIONS
	, commonESBuildTest
	, silentESBuildTest
	, buildSimple
	, buildSimpleImportSCSS
	, buildSimpleImportSASS
	, buildInlineImport
	, buildFileImport
	, buildDynamicImportSCSS
	, expectToBuild
	, expectNotToBuild
	, expectOutfileToMatch
	, testBuild
	, testSASSbuild
	, chainTestSASSbuild
	, expectImportResolverToMatch
	};
