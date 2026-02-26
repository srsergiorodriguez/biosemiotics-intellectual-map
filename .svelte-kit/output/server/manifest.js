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
		client: {start:"_app/immutable/entry/start.CiYXc4hZ.js",app:"_app/immutable/entry/app.D9j3T_WZ.js",imports:["_app/immutable/entry/start.CiYXc4hZ.js","_app/immutable/chunks/Bpkf-jfr.js","_app/immutable/chunks/NprAa986.js","_app/immutable/chunks/BYf1SMTE.js","_app/immutable/chunks/BMe3hRgx.js","_app/immutable/entry/app.D9j3T_WZ.js","_app/immutable/chunks/BYf1SMTE.js","_app/immutable/chunks/NprAa986.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/eHoPEZ4D.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set(["/"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
