import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: { adapter: adapter({
		pages: "docs",
		precompress: false,
		strict: true,
		hydrate: true,
	}) },
	paths: {
		base: process.argv.includes('dev') ? '' : '/biosemiotics-intellectual-map'
	},
	preprocess: [mdsvex()],
	extensions: ['.svelte', '.svx'],
	alias: {
		$components: "src/lib/components",
		$stores: "src/lib/stores"
	}
};

export default config;
