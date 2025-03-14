// TODA LA CONFIGURACION FUNCIONAL DEL PROYECTO
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  // CSS GLOBAL
  css: ["~/assets/css/main.css"],
  // MODULOS (FUNCIONES AGREGADAS PARA LA APLICACION)
  modules: ["@nuxt/ui"],
});
