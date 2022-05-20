import sass from 'sass';

const config =
	{ sass:
		{ importer: null
		, indentType: 'tab'
		, indentWidth: 4
		, linefeed: 'lf'
		, omitSourceMapUrl: false
		, outFile: undefined
		, outputStyle: 'compressed'
		, sourceMap: true
		, sourceMapContents: false
		, sourceMapEmbed: true
		, sourceMapRoot: undefined
		, functions: {}
		, charset: true
		, quietDeps: true
		, verbose: false
		, logger: sass.Logger.silent
		}
	, postcss:
		{ use: true
		, autoprefixer:
			{ use: true
			}
		}
	};

export default config;
