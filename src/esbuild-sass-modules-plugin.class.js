import esb from 'esbuild';
import sass from 'sass';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import p from 'path';

import defaultConfig from '../config.js';

export { defaultConfig };

export default class ESBuildSASSModulesPlugin {
	static name = 'squirrelnetwork-esbuild-sass-modules-plugin';
	static namespace = 'squirrelnetwork:sass-modules-plugin';

	config;

	constructor(pluginConfig) {
		this.config =
			{ ...defaultConfig
			, ...pluginConfig
			};
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
		return this.compile(root, path)
			.then(r => r.css.toString('utf8'))
			.then(css => (
				{ contents: css
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
