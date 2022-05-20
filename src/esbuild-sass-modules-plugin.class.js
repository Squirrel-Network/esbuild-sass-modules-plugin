import sass from 'sass';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import p from 'path';
import _ from 'lodash/fp';

import defaultConfig from '../config.js';

export { defaultConfig };

export default class ESBuildSASSModulesPlugin {
	static name = 'squirrelnetwork-esbuild-sass-modules-plugin';
	static namespace = 'squirrelnetwork:sass-modules-plugin';

	config;

	constructor(pluginConfig) {
		this.config = _(defaultConfig).merge(pluginConfig).valueOf();
	}

	mark({ path, kind, importer }) {
		const dir = p.parse(importer).dir;

		const markedFile =
			{ path: ''
			, namespace: ''
			};

		switch(kind) {
		case 'import-statement':
			markedFile.path = path;
			markedFile.namespace = ESBuildSASSModulesPlugin.namespace;

			break;

		default:
			throw `Unsupported kind of import '` + kind + '`';
		}

		return markedFile;
	}

	async compile(root, path) {
		const needsResolve = path.startsWith('.');
		const actualPath = needsResolve ? p.resolve(root, path) : path;

		return sass.renderSync(
			{ ...this.config.sass
			, file: actualPath
			}
		);
	}

	async load(root, path) {
		const sass = this.compile(root, path);

		if(this.config.postcss.use) {
			return sass.then(r => postcss()
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
			)
			.then(r => (
				{ contents: r.css
				, loader: 'css'
				}
			));
		}
		else return sass.then(r => (
			{ contents: r.css.toString('utf8')
			, loader: 'css'
			}
		));
	}

	setup(esbconfig) {
		const self = this;

		esbconfig.onResolve(
			{ filter: /\.s[ca]ss$/
			, namespace: 'file'
			},
			this.mark
		);

		esbconfig.onLoad(
			{ filter: /\.s[ca]ss$/
			, namespace: ESBuildSASSModulesPlugin.namespace
			},
			async ({ path }) =>
				self.load(esbconfig.initialOptions.sourceRoot, path)
		);
	}
}
