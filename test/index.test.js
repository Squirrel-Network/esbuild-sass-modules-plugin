import plugin from '../src/index.js';
import ESBuildSASSModulesPlugin
	from '../src/esbuild-sass-modules-plugin.class.js';
import {
	PATH_SAMPLE_DYNAMIC_SIMPLE_JS_COMPILED,
	PATH_SAMPLE_FILE_JS_COMPILED,
	PATH_SAMPLE_FILE_UNRESOLVING,
	PATH_SAMPLE_INLINE_JS_COMPILED,
	PATH_SAMPLE_INLINE_UNRESOLVING,
	PATH_SAMPLE_SIMPLE_JS_COMPILED,
	PATH_SAMPLE_SIMPLE_JS_IMPORT_SASS_COMPILED,
	PATH_SAMPLE_SIMPLE_JS_IMPORT_SCSS_COMPILED,
	PATH_SAMPLE_SIMPLE_UNRESOLVING
} from './constants.js';
import {
	buildDynamicImportSCSS,
	buildFileImport,
	buildInlineImport,
	buildSimple,
	buildSimpleImportSASS,
	buildSimpleImportSCSS,
	expectNotToBuild,
	expectToBuild,
	silentESBuildTest,
	testBuild
} from './utils.js';

test(
	'Creates the plugin instance',
	async function testPluginInstanceCreation() {
		const p = plugin();

		expect(p.name).toBe(ESBuildSASSModulesPlugin.name);

		await expectToBuild(buildSimple());
	}
);

test(
	'Builds a simple program',
	async function testSimpleBuild() {
		await testBuild(
			buildSimple(),
			PATH_SAMPLE_SIMPLE_JS_COMPILED
		);
	}
);

test(
	'Builds and resolves sass imports',
	async function testImportResolverTypes() {
		await testBuild(
			buildSimpleImportSCSS(),
			PATH_SAMPLE_SIMPLE_JS_IMPORT_SCSS_COMPILED
		);
		await testBuild(
			buildSimpleImportSASS(),
			PATH_SAMPLE_SIMPLE_JS_IMPORT_SASS_COMPILED
		);

		await testBuild(
			buildInlineImport(),
			PATH_SAMPLE_INLINE_JS_COMPILED
		);

		await testBuild(
			buildFileImport(),
			PATH_SAMPLE_FILE_JS_COMPILED
		);
	}
);

test(
	'Builds and resolves dynamic sass imports',
	async function testImportResolverTypes() {
		await testBuild(
			buildDynamicImportSCSS(),
			PATH_SAMPLE_DYNAMIC_SIMPLE_JS_COMPILED
		);
	}
);

test(
	'Errors on unresolved files',
	async function testUnresolved() {
		await expectNotToBuild(
			silentESBuildTest(PATH_SAMPLE_SIMPLE_UNRESOLVING)
		);

		await expectNotToBuild(
			silentESBuildTest(PATH_SAMPLE_INLINE_UNRESOLVING)
		);

		await expectNotToBuild(
			silentESBuildTest(PATH_SAMPLE_FILE_UNRESOLVING)
		);
	}
);
