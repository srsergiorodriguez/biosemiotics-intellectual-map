

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "prerender": true,
  "ssr": false
};
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.CF2FWSi3.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/BYf1SMTE.js","_app/immutable/chunks/VMYJZVFd.js"];
export const stylesheets = ["_app/immutable/assets/0.C93xg0HH.css"];
export const fonts = [];
