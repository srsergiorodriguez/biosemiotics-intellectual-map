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
	preprocess: [mdsvex()],
	extensions: ['.svelte', '.svx'],
	alias: {
		$components: "src/lib/components",
		$stores: "src/lib/stores"
	}
};

export default config;
