import sass from 'sass';
import postcss from 'postcss';
import _ from 'lodash';

import defaultConfig from '../config.js';

export { defaultConfig };

const ImportResolver =
	{ BUNDLE: 0
	, INLINE: 1
	, FILE: 2
	};

export { ImportResolver };

export default class ESBuildSASSModulesPlugin {
	static name = 'squirrelnetwork-esbuild-sass-modules-plugin';
	static namespace = 'squirrelnetwork:sass-modules-plugin';

	config;

	constructor(pluginConfig) {
		this.config = _(defaultConfig).merge(pluginConfig).valueOf();
	}

	getImportResolverFor(path) {
		if(path.startsWith('inline:')) return ImportResolver.INLINE;
		else if(path.startsWith('file:')) return ImportResolver.FILE;
		else return ImportResolver.BUNDLE;
	}

	async resolve(esbconfig, { path, kind, importer, resolveDir }) {
		const resolver = this.getImportResolverFor(path);

		const markedFile =
			{ path: ''
			, namespace: ''
			, pluginData:
				{ importResolver: resolver
				, loader: undefined
				}
			};

		switch(resolver) {
		case ImportResolver.BUNDLE: {
			const resolved =
				await esbconfig.resolve(path, { resolveDir, kind });

			if(!resolved.path) {
				return { errors: resolved.errors, warnings: resolved.warnings };
			}

			markedFile.path = resolved.path;
			markedFile.pluginData.loader = 'css';

			break;
		}
		case ImportResolver.INLINE: {
			const actualPath = path.substring('inline:'.length);

			const resolved =
				await esbconfig.resolve(actualPath, { resolveDir, kind });

			if(!resolved.path) {
				return { errors: resolved.errors, warnings: resolved.warnings };
			}

			markedFile.path = resolved.path;
			markedFile.pluginData.loader = 'text';

			break;
		}
		case ImportResolver.FILE: {
			const actualPath = path.substring('file:'.length);

			const resolved =
				await esbconfig.resolve(actualPath, { resolveDir, kind });

			if(!resolved.path) {
				return { errors: resolved.errors, warnings: resolved.warnings };
			}

			markedFile.path = resolved.path;
			markedFile.pluginData.loader = 'file';

			break;
		}
		}

		switch(kind) {
		case 'dynamic-import':
		case 'import-statement': {
			markedFile.namespace = ESBuildSASSModulesPlugin.namespace;

			break;
		}
		default: {
			throw `Unsupported kind of import \`${ kind }'`;
		}
		}

		return markedFile;
	}

	async compile(path) {
		return sass.renderSync(
			{ ...this.config.sass
			, file: path
			}
		);
	}

	async processPostCSS(sassChain) {
		return sassChain.then(r => postcss(this.config.postcss.plugins)
			.process(
				r.css.toString('utf8'),
				{ ...this.config.postcss.custom
				, from: undefined
				, to: undefined
				, map: (r.map
					&& (
						{ inline: true
						, sourcesContent: true
						, prev: r.map.toString('utf8')
						}
						// this config will not generate source files
					) || false)
				}
			)
		);
	}

	async load(esbconfig, path, { loader }) {
		const sass = this.compile(path);

		return this.config.postcss.use
			? this.processPostCSS(sass)
				.then(r => (
					{ contents: r.css
					, loader
					}
				))
			: sass.then(r => (
				{ contents: r.css.toString('utf8')
				, loader
				}
			));
	}

	setup(esbconfig) {
		const self = this;

		esbconfig.onResolve(
			{ filter: /\.s[ca]ss$/
			, namespace: 'file'
			},
			async args => this.resolve(esbconfig, args)
		);

		esbconfig.onLoad(
			{ filter: /\.s[ca]ss$/
			, namespace: ESBuildSASSModulesPlugin.namespace
			},
			async ({ path, pluginData }) =>
				self.load(esbconfig, path, pluginData)
		);
	}
}
