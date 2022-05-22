import p from 'path';

import ESBuildSASSModulesPlugin, {
	defaultConfig,
	ImportResolver
} from '../src/esbuild-sass-modules-plugin.class.js';
import
{
	PATH_SAMPLE_SIMPLE_SCSS,
	PATH_SAMPLE_SIMPLE_JS,
	PATH_SAMPLE_POSTCSS,
	PATH_SAMPLE_POSTCSS_COMPILED,
	PATH_SAMPLE_POSTCSS_SOURCEMAP_COMPILED,
	PATH_SAMPLE_INLINE_JS,
	PATH_SAMPLE_SIMPLE_JS_IMPORT_SCSS,
	PATH_SAMPLE_SIMPLE_SASS,
	PATH_SAMPLE_SIMPLE_SCSS_COMPILED,
	PATH_SAMPLE_SIMPLE_SASS_COMPILED,
	PATH_SAMPLE_FILE_JS,
	PATH_SAMPLE_DYNAMIC_SIMPLE_JS
} from './constants.js';
import {
	chainTestSASSbuild,
	expectImportResolverToMatch
} from './utils.js';

test(
	'Loads default config',
	function testDefaultConfig() {
		const plugin = new ESBuildSASSModulesPlugin();

		expect(plugin.config).toMatchObject(defaultConfig);
	}
);

test(
	'Processes sass sources, and sass sources only',
	async function testSourcesFilter() {
		await expect(new Promise((ok, fail) => {
			const fakeEsb =
				{ async onResolve({ filter }, fn) {
					const checkOkScss = filter.test('file.scss');
					const checkOkSass = filter.test('file.sass');

					if(!checkOkScss) fail('.scss file not resolved');
					if(!checkOkSass) fail('.sass file not resolved');

					const checkFail = filter.test('file.txt');

					if(checkFail) fail('Resolves non-SASS file');
				}
				, async onLoad({ filter }, fn) {
					const checkOkScss = filter.test('file.scss');
					const checkOkSass = filter.test('file.sass');

					if(!checkOkScss) fail('.scss file not loaded');
					if(!checkOkSass) fail('.sass file not loaded');

					const checkFail = filter.test('file.txt');

					if(checkFail) fail('Loads non-SASS file');
				}
				};

			const plugin = new ESBuildSASSModulesPlugin();

			expect(() => {
				plugin.setup(fakeEsb);

				ok();
			}).not.toThrow();
		})).resolves.toBeUndefined();
	}
);

test(
	'Fails on unsupported import kind',
	async function testUnsupportedImportKind() {
		await expect(new Promise((ok, fail) => {
			const plugin = new ESBuildSASSModulesPlugin();

			const fakeEsb =
				{ async onResolve(filter, fn) {
					const dir =
						p.dirname(p.resolve(PATH_SAMPLE_SIMPLE_SCSS, '../../'));

					fn(
						{ path: PATH_SAMPLE_SIMPLE_SCSS
						, kind: 'unsupported'
						, importer: p.resolve(PATH_SAMPLE_SIMPLE_JS)
						, resolveDir: dir
						}
					).catch(fail).then(ok);
				}
				, async onLoad(filter, fn) {
				}
				, async resolve() {
					return { path: p.resolve(PATH_SAMPLE_SIMPLE_SCSS) };
				}
				};

			expect(() => plugin.setup(fakeEsb)).not.toThrow();
		})).rejects.toBe('Unsupported kind of import `unsupported\'');
	}
);

test(
	'Bundles sass sources from import statements',
	async function testSASSImport() {
		await expect(new Promise((ok, fail) => {
			const plugin = new ESBuildSASSModulesPlugin();

			const dir = p.dirname(p.resolve(PATH_SAMPLE_SIMPLE_SCSS, '../../'));

			const fakeEsb =
				{ async onResolve(filter, fn) {
					const
						{ path: pathSCSS
						, namespace: namespaceSCSS
						} = await fn(
						{ path: PATH_SAMPLE_SIMPLE_SCSS
						, kind: 'import-statement'
						, importer: p.resolve(PATH_SAMPLE_SIMPLE_JS)
						, resolveDir: dir
						}
					);

					expect(pathSCSS).toBe(p.resolve(PATH_SAMPLE_SIMPLE_SCSS));
					expect(namespaceSCSS)
						.toBe(ESBuildSASSModulesPlugin.namespace);

					const
						{ path: pathSASS
						, namespace: namespaceSASS
						} = await fn(
						{ path: PATH_SAMPLE_SIMPLE_SASS
						, kind: 'import-statement'
						, importer: p.resolve(PATH_SAMPLE_SIMPLE_JS)
						}
					);

					expect(pathSASS).toBe(p.resolve(PATH_SAMPLE_SIMPLE_SASS));
					expect(namespaceSASS)
						.toBe(ESBuildSASSModulesPlugin.namespace);
				}
				, onLoad(filter, fn) {
					ok(fn);
				}
				, async resolve(path) {
					if(path === PATH_SAMPLE_SIMPLE_SCSS) {
						return { path: p.resolve(PATH_SAMPLE_SIMPLE_SCSS) };
					}

					if(path === PATH_SAMPLE_SIMPLE_SASS) {
						return { path: p.resolve(PATH_SAMPLE_SIMPLE_SASS) };
					}
				}
				};

			expect(() => plugin.setup(fakeEsb)).not.toThrow();
		})
		.then(chainTestSASSbuild(
			PATH_SAMPLE_SIMPLE_SCSS,
			PATH_SAMPLE_SIMPLE_SCSS_COMPILED
		))
		.then(chainTestSASSbuild(
			PATH_SAMPLE_SIMPLE_SASS,
			PATH_SAMPLE_SIMPLE_SASS_COMPILED
		))).resolves.toBeTruthy();
	}
);

test(
	'Bundles sass sources from dynamic imports',
	async function testSASSDynamicImport() {
		await expect(new Promise((ok, fail) => {
			const plugin = new ESBuildSASSModulesPlugin();

			const dir =
				p.dirname(p.resolve(PATH_SAMPLE_DYNAMIC_SIMPLE_JS, '../../'));

			const fakeEsb =
				{ async onResolve(filter, fn) {
					const
						{ path: pathSCSS
						, namespace: namespaceSCSS
						} = await fn(
						{ path: PATH_SAMPLE_SIMPLE_SCSS
						, kind: 'dynamic-import'
						, importer: p.resolve(PATH_SAMPLE_DYNAMIC_SIMPLE_JS)
						, resolveDir: dir
						}
					);

					expect(pathSCSS).toBe(p.resolve(PATH_SAMPLE_SIMPLE_SCSS));
					expect(namespaceSCSS)
						.toBe(ESBuildSASSModulesPlugin.namespace);
				}
				, onLoad(filter, fn) {
					ok(fn);
				}
				, async resolve(path) {
					return { path: p.resolve(PATH_SAMPLE_SIMPLE_SCSS) };
				}
				};

			expect(() => plugin.setup(fakeEsb)).not.toThrow();
		})
		.then(chainTestSASSbuild(
			PATH_SAMPLE_SIMPLE_SCSS,
			PATH_SAMPLE_SIMPLE_SCSS_COMPILED
		))).resolves.toBeTruthy();
	}
);

test(
	'Detects the correct import resolver',
	async function testImportResolverType() {
		await expectImportResolverToMatch(
			ImportResolver.BUNDLE,
			p.basename(PATH_SAMPLE_SIMPLE_SCSS),
			PATH_SAMPLE_SIMPLE_JS_IMPORT_SCSS
		);

		await expectImportResolverToMatch(
			ImportResolver.INLINE,
			'inline:' + PATH_SAMPLE_SIMPLE_SCSS,
			PATH_SAMPLE_INLINE_JS
		);

		await expectImportResolverToMatch(
			ImportResolver.FILE,
			'file:' + PATH_SAMPLE_SIMPLE_SCSS,
			PATH_SAMPLE_FILE_JS
		);
	}
);

test(
	'Chains PostCSS',
	async function testPostCSS() {
		const sourceMapDisabled =
			{ postcss:
				{ use: true
				}
			};

		const sourceMapEnabled =
			{ sass:
				{ sourceMap: 'sass.map'
				, sourceMapEmbed: true
				}
			, postcss:
				{ use: true
				}
			};

		await expect(new Promise((ok, fail) => {
			const fakeEsb =
				{ async onResolve(filter, fn) {
					await fn(
						{ path: PATH_SAMPLE_POSTCSS
						, kind: 'import-statement'
						, importer: p.resolve(PATH_SAMPLE_SIMPLE_JS)
						, resolveDir:
							p.dirname(p.resolve(PATH_SAMPLE_POSTCSS))
						}
					);
				}
				, onLoad(filter, fn) {
					ok(fn);
				}
				, async resolve() {
					return { path: p.resolve(PATH_SAMPLE_POSTCSS) };
				}
				};

			const plugin =
				new ESBuildSASSModulesPlugin(sourceMapDisabled);

			expect(() => plugin.setup(fakeEsb)).not.toThrow();
		})
		.then(chainTestSASSbuild(
			PATH_SAMPLE_POSTCSS,
			PATH_SAMPLE_POSTCSS_COMPILED
		))).resolves.toBeTruthy();

		await expect(new Promise((ok, fail) => {
			const fakeEsb =
				{ async onResolve(filter, fn) {
					await fn(
						{ path: PATH_SAMPLE_POSTCSS
						, kind: 'import-statement'
						, importer: p.resolve(PATH_SAMPLE_SIMPLE_JS)
						, resolveDir:
							p.dirname(p.resolve(PATH_SAMPLE_POSTCSS))
						}
					);
				}
				, onLoad(filter, fn) {
					ok(fn);
				}
				, async resolve() {
					return { path: p.resolve(PATH_SAMPLE_POSTCSS) };
				}
				};

			const plugin =
				new ESBuildSASSModulesPlugin(sourceMapEnabled);

			expect(() => plugin.setup(fakeEsb)).not.toThrow();
		})
		.then(chainTestSASSbuild(
			PATH_SAMPLE_POSTCSS,
			PATH_SAMPLE_POSTCSS_SOURCEMAP_COMPILED
		))).resolves.toBeTruthy();
	}
);
