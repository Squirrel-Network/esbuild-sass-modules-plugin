import ESBuildSASSModulesPlugin, { defaultConfig }
	from './esbuild-sass-modules-plugin.class.js';

export default pluginConfig => (
	{ name: ESBuildSASSModulesPlugin.name
	, setup(esbconfig) {
		const plugin = new ESBuildSASSModulesPlugin(
			pluginConfig || defaultConfig
		);

		plugin.setup(esbconfig);
	}
	}
);
