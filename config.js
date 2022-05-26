import sass from 'sass';

const config =
	{ useLegacySass: false
	, sass:
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
	, sassCompile:
		{ alertAscii: false
		, alertColor: true
		, functions: {}
		, importers: []
		, loadPaths: []
		, logger: sass.Logger.silent
		, quietDeps: true
		, sourceMap: false
		, sourceMapIncludeSources: false
		, style: 'compressed'
		, verbose: false
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
