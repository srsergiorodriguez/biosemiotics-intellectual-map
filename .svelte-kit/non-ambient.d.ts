
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>
		};
		Pathname(): "/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/data/ArticleTypesSummary.csv" | "/data/BiblioCouplingLinks.tsv" | "/data/BiblioCouplingNodes.tsv" | "/data/BiosemioticsDoc2VecClustersTagged.csv" | "/data/CocitationLinks.tsv" | "/data/CocitationNodes.tsv" | "/data/MostCitedPapers.csv" | "/data/TableAuthorCount.csv" | "/data/TableCitationGeneral.csv" | "/data/TableCitationWithin.csv" | "/data/TableKeywords.csv" | "/robots.txt" | string & {};
	}
}