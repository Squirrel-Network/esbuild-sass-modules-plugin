import sass from 'sass';
import postcss from 'postcss';
import p from 'path';
import _ from 'lodash/fp';

import defaultConfig from '../config.js';

export { defaultConfig };

const ImportResolver =
	{ BUNDLE: 0
	, INLINE: 1
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
		else return ImportResolver.BUNDLE;
	}

	resolve({ path, kind, importer }) {
		const dir = p.parse(importer).dir;

		const resolver = this.getImportResolverFor(path);

		const markedFile =
			{ path: ''
			, namespace: ''
			, pluginData:
				{ importResolver: resolver
				, loader: ''
				}
			};

		switch(resolver) {
		case ImportResolver.BUNDLE:
			markedFile.path = this.resolveSystemPath(dir, path);
			markedFile.pluginData.loader = 'css';

			break;

		case ImportResolver.INLINE:
			const actualPath = path.substring('inline:'.length);

			markedFile.path = this.resolveSystemPath(dir, actualPath);
			markedFile.pluginData.loader = 'text';

			break;
		}

		switch(kind) {
		case 'import-statement':
			markedFile.namespace = ESBuildSASSModulesPlugin.namespace;

			break;

		default:
			throw `Unsupported kind of import '` + kind + '`';
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

	resolveSystemPath(root, path) {
		return path.startsWith('.')
			? p.resolve(root, path)
			: path;
	}

	async load(path, { loader }) {
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
			args => this.resolve(args)
		);

		esbconfig.onLoad(
			{ filter: /\.s[ca]ss$/
			, namespace: ESBuildSASSModulesPlugin.namespace
			},
			async ({ path, pluginData }) =>
				self.load(path, pluginData)
		);
	}
}
