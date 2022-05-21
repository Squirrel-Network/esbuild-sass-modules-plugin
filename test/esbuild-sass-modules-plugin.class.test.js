import p from 'path';
import fsp from 'fs/promises';

import ESBuildSASSModulesPlugin, {
	defaultConfig,
	ImportResolver
} from '../src/esbuild-sass-modules-plugin.class.js';
import
{
	PATH_SAMPLE_SIMPLE_SCSS,
	PATH_SAMPLE_SIMPLE_JS,
	PATH_SAMPLES,
	PATH_SAMPLE_POSTCSS,
	PATH_SAMPLE_POSTCSS_COMPILED,
	PATH_SAMPLE_POSTCSS_SOURCEMAP_COMPILED,
	PATH_SAMPLE_INLINE_JS,
	PATH_SAMPLE_SIMPLE_JS_IMPORT_SCSS,
	PATH_SAMPLE_SIMPLE_SASS,
	PATH_SAMPLE_SIMPLE_SCSS_COMPILED,
	PATH_SAMPLE_SIMPLE_SASS_COMPILED
} from './constants.js';

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
				{ onResolve(filter, fn) {
					const checkOkScss = filter.filter.test('file.scss');
					const checkOkSass = filter.filter.test('file.sass');

					if(!checkOkScss) fail('.scss file not resolved');
					if(!checkOkSass) fail('.sass file not resolved');

					const checkFail = filter.filter.test('file.txt');

					if(checkFail) fail('Resolves non-SASS file');
				}
				, onLoad(filter, fn) {
					const checkOkScss = filter.filter.test('file.scss');
					const checkOkSass = filter.filter.test('file.sass');

					if(!checkOkScss) fail('.scss file not loaded');
					if(!checkOkSass) fail('.sass file not loaded');

					const checkFail = filter.filter.test('file.txt');

					if(checkFail) fail('Loaded non-SASS file');
				}
				};

			const plugin = new ESBuildSASSModulesPlugin();

			expect(() => {
				plugin.setup(fakeEsb);

				ok();
			}).not.toThrow();
		})).resolves.toEqual(undefined);
	}
);

test(
	'Fails on unsupported import kind',
	async function testUnsupportedImportKind() {
		await expect(new Promise((ok, fail) => {
			const plugin = new ESBuildSASSModulesPlugin();

			const fakeEsb =
				{ onResolve(filter, fn) {
					const { path: pathSCSS, namespace: namespaceSCSS } = fn(
						{ path: p.resolve(PATH_SAMPLE_SIMPLE_SCSS)
						, kind: 'unsupported'
						, importer: p.resolve(PATH_SAMPLE_SIMPLE_JS)
						}
					);

					expect(namespaceSCSS)
						.toBe(ESBuildSASSModulesPlugin.namespace);
				}
				, onLoad(filter, fn) {
					ok([fn, plugin]);
				}
				};

			plugin.setup(fakeEsb);
		})).rejects.toBe('Unsupported kind of import \'unsupported`');
	}
);

async function checkImportResolverType(type, scssPath, importer) {
	return new Promise((ok, fail) => {
		const plugin = new ESBuildSASSModulesPlugin();

		const fakeEsb =
			{ onResolve(filter, fn) {
				const
					{ path: pathSCSS
					, namespace: namespaceSCSS
					, pluginData
					} =
					fn(
						{ path: scssPath
						, kind: 'import-statement'
						, importer
						}
					);

				expect(pluginData)
					.toMatchObject(
						{ importResolver: type }
					);
			}
			, onLoad(filter, fn) {
				ok();
			}
			};

		plugin.setup(fakeEsb);
	});
}

test(
	'Bundles sass sources from import statements',
	async function testSASSImport() {
		await expect(new Promise((ok, fail) => {
			const plugin = new ESBuildSASSModulesPlugin();

			const fakeEsb =
				{ onResolve(filter, fn) {
					const { path: pathSCSS, namespace: namespaceSCSS } = fn(
						{ path: p.resolve(PATH_SAMPLE_SIMPLE_SCSS)
						, kind: 'import-statement'
						, importer: p.resolve(PATH_SAMPLE_SIMPLE_JS)
						}
					);

					expect(pathSCSS).toBe(p.resolve(PATH_SAMPLE_SIMPLE_SCSS));
					expect(namespaceSCSS)
						.toBe(ESBuildSASSModulesPlugin.namespace);

					const { path: pathSASS, namespace: namespaceSASS } = fn(
						{ path: p.resolve(PATH_SAMPLE_SIMPLE_SASS)
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
				, initialOptions:
					{ sourceRoot: PATH_SAMPLES
					}
				};

			expect(() => plugin.setup(fakeEsb)).not.toThrow();
		})
		.then(async loadFn => {
			const scssTestCompiled =
				await fsp.readFile(PATH_SAMPLE_SIMPLE_SCSS_COMPILED)
					.then(b => b.toString('utf8'));

			await expect(
				loadFn(
					{ path: PATH_SAMPLE_SIMPLE_SCSS
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

			const sassTestCompiled =
				await fsp.readFile(PATH_SAMPLE_SIMPLE_SASS_COMPILED)
					.then(b => b.toString('utf8'));

			await expect(
				loadFn(
					{ path: PATH_SAMPLE_SIMPLE_SASS
					, pluginData:
						{ importResolver: ImportResolver.BUNDLE
						, loader: 'css'
						}
					}
				)
			).resolves.toMatchObject(
				{ contents: sassTestCompiled
				, loader: 'css'
				}
			);
		})).resolves.toEqual(undefined);
	}
);

test(
	'Detects the correct import resolver',
	async function testImportResolverType() {
		await expect(checkImportResolverType(
			ImportResolver.BUNDLE,
			PATH_SAMPLE_SIMPLE_SCSS,
			PATH_SAMPLE_SIMPLE_JS_IMPORT_SCSS
		)).resolves.toEqual(undefined);

		await expect(checkImportResolverType(
			ImportResolver.INLINE,
			'inline:' + PATH_SAMPLE_SIMPLE_SCSS,
			PATH_SAMPLE_INLINE_JS
		)).resolves.toEqual(undefined);
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
				{ onResolve(filter, fn) {
					fn(
						{ path: p.resolve(PATH_SAMPLE_POSTCSS)
						, kind: 'import-statement'
						, importer: p.resolve(PATH_SAMPLE_SIMPLE_JS)
						}
					);
				}
				, onLoad(filter, fn) {
					ok(fn);
				}
				, initialOptions:
					{ sourceRoot: PATH_SAMPLES
					}
				};

			const plugin =
				new ESBuildSASSModulesPlugin(sourceMapDisabled);

			plugin.setup(fakeEsb);
		})
		.then(async loadFn => {
			const compiled = await fsp.readFile(PATH_SAMPLE_POSTCSS_COMPILED)
				.then(b => b.toString('utf8'));

			await expect(
				loadFn(
					{ path: PATH_SAMPLE_POSTCSS
					, pluginData:
						{ importResolver: ImportResolver.BUNDLE
						, loader: 'css'
						}
					}
				)
			).resolves.toMatchObject(
				{ contents: compiled
				, loader: 'css'
				}
			);
		})).resolves.toEqual(undefined);

		await expect(new Promise((ok, fail) => {
			const fakeEsb =
				{ onResolve(filter, fn) {
					fn(
						{ path: p.resolve(PATH_SAMPLE_POSTCSS)
						, kind: 'import-statement'
						, importer: p.resolve(PATH_SAMPLE_SIMPLE_JS)
						}
					);
				}
				, onLoad(filter, fn) {
					ok(fn);
				}
				, initialOptions:
					{ sourceRoot: PATH_SAMPLES
					}
				};

			const plugin =
				new ESBuildSASSModulesPlugin(sourceMapEnabled);

			plugin.setup(fakeEsb);
		})
		.then(async loadFn => {
			const compiled = await fsp.readFile(
				PATH_SAMPLE_POSTCSS_SOURCEMAP_COMPILED
			)
			.then(b => b.toString('utf8'));

			await expect(
				loadFn(
					{ path: PATH_SAMPLE_POSTCSS
					, pluginData:
						{ importResolver: ImportResolver.BUNDLE
						, loader: 'css'
						}
					}
				)
			).resolves.toMatchObject(
				{ contents: compiled
				, loader: 'css'
				}
			);
		})).resolves.toEqual(undefined);
	}
);
