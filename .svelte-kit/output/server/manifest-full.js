export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([".nojekyll","data/ArticleTypesSummary.csv","data/BiblioCouplingLinks.tsv","data/BiblioCouplingNodes.tsv","data/BiosemioticsDoc2VecClustersTagged.csv","data/CocitationLinks.tsv","data/CocitationNodes.tsv","data/MostCitedPapers.csv","data/TableAuthorCount.csv","data/TableCitationGeneral.csv","data/TableCitationWithin.csv","data/TableKeywords.csv","robots.txt"]),
	mimeTypes: {".csv":"text/csv",".tsv":"text/tab-separated-values",".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.COnuCHhz.js",app:"_app/immutable/entry/app.DnXOXHVm.js",imports:["_app/immutable/entry/start.COnuCHhz.js","_app/immutable/chunks/BCzRb2Ev.js","_app/immutable/chunks/NprAa986.js","_app/immutable/chunks/BYf1SMTE.js","_app/immutable/chunks/DYhnG8yo.js","_app/immutable/entry/app.DnXOXHVm.js","_app/immutable/chunks/BYf1SMTE.js","_app/immutable/chunks/NprAa986.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/eHoPEZ4D.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
