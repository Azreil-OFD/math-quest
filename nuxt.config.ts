
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@primevue/nuxt-module"],
  css: ["@/assets/css/main.css"],
  primevue: {
    importTheme: { from: "@/themes/mytheme.js" },
  },
});
