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
	};
