import * as sass from 'sass';

const config =
	{ sass:
		{ importer: null
		, indentType: 'tab'
		, indentWidth: 4
		, linefeed: 'lf'
		, omitSourceMapUrl: false
		, outFile: undefined
		, outputStyle: 'compressed'
		, sourceMap: false
		, sourceMapEmbed: false
		, sourceMapRoot: undefined
		, functions: {}
		, charset: true
		, quietDeps: true
		, verbose: false
		, logger: sass.Logger.silent
		}
	, postcss:
		{ use: false
		, plugins: []
		, custom:
			{ parser: undefined
			, stringifier: undefined
			, syntax: undefined
			}
		}
	};

export default config;
