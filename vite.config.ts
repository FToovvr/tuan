import path from "path";
import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import Pages from "vite-plugin-pages";
import Layouts from "vite-plugin-vue-layouts";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import Markdown from "vite-plugin-md";
import WindiCSS from "vite-plugin-windicss";
import VueI18n from "@intlify/vite-plugin-vue-i18n";
import Inspect from "vite-plugin-inspect";
import Prism from "markdown-it-prism";
import LinkAttributes from "markdown-it-link-attributes";
// import Copy from "rollup-plugin-copy";

const markdownWrapperClasses = "prose prose-sm m-auto text-left";

const isProduction = process.env["NODE_ENV"] === "production";

export default defineConfig({
  base: isProduction ? "/tuan" : "/",
  resolve: {
    alias: {
      "~/": `${path.resolve(__dirname, "src")}/`,
      "vue": "vue/dist/vue.esm-bundler.js",
    },
  },
  plugins: [
    // // https://github.com/vladshcherbin/rollup-plugin-copy
    // // 将生成的 build-tuan-data 文件夹放到 dist 对应位置
    // // TODO: 也许可以换成这个：https://github.com/sapphi-red/vite-plugin-static-copy
    // Copy({
    //   targets: [
    //     { src: "tuan-data-dist", dest: "dist/assets/", rename: "tuan-data" },
    //   ],
    //   // 也不知道为什么，只有这样才能复制成功
    //   // https://github.com/vitejs/vite/issues/1231#issuecomment-753549857
    //   hook: "writeBundle",
    // }),

    Vue({
      include: [/\.vue$/, /\.md$/],
      refTransform: true,
    }),

    // https://github.com/hannoeru/vite-plugin-pages
    Pages({
      extensions: ["vue", "md"],
    }),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts(),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        "vue",
        "vue-router",
        "vue-i18n",
        "@vueuse/head",
        "@vueuse/core",
      ],
      dts: "src/auto-imports.d.ts",
    }),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      // allow auto load markdown components under `./src/components/`
      extensions: ["vue", "md"],

      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],

      // custom resolvers
      resolvers: [
        // auto import icons
        // https://github.com/antfu/unplugin-icons
        IconsResolver({
          componentPrefix: "",
          // enabledCollections: ['carbon']
        }),
      ],

      dts: "src/components.d.ts",
    }),

    // https://github.com/antfu/unplugin-icons
    Icons(),

    // https://github.com/antfu/vite-plugin-windicss
    WindiCSS({
      safelist: markdownWrapperClasses,
    }),

    // https://github.com/antfu/vite-plugin-md
    // Don't need this? Try vitesse-lite: https://github.com/antfu/vitesse-lite
    Markdown({
      wrapperClasses: markdownWrapperClasses,
      headEnabled: true,
      markdownItSetup(md) {
        // https://prismjs.com/
        md.use(Prism);
        md.use(LinkAttributes, {
          pattern: /^https?:\/\//,
          attrs: {
            target: "_blank",
            rel: "noopener",
          },
        });
      },
    }),

    // https://github.com/intlify/bundle-tools/tree/main/packages/vite-plugin-vue-i18n
    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      include: [path.resolve(__dirname, "locales/**")],
    }),

    // https://github.com/antfu/vite-plugin-inspect
    Inspect({
      // change this to enable inspect for debugging
      enabled: false,
    }),
  ],

  server: {
    fs: {
      strict: true,
    },
  },

  // https://github.com/antfu/vite-ssg
  ssgOptions: {
    script: "async",
    formatting: "minify",
  },

  optimizeDeps: {
    include: [
      "vue",
      "vue-router",
      "@vueuse/core",
      "@vueuse/head",
    ],
    exclude: [
      "vue-demi",
    ],
  },
});
