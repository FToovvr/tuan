// third party libraries

// register vue composition api globally
import { ViteSSG } from 'vite-ssg'
import { setupLayouts } from 'virtual:generated-layouts'
import App from './App.vue'

// windicss layers
import 'virtual:windi-base.css'
import 'virtual:windi-components.css'
// your custom styles here
import './styles/main.css'
// windicss utilities should be the last style import
import 'virtual:windi-utilities.css'
// windicss devtools support (dev only)
import 'virtual:windi-devtools'

import routes from './routes'
const routesWithLayout = setupLayouts(routes)

import { useStuffStore } from './stores/stuff'

// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(
  App,
  {
    routes: routesWithLayout,
    scrollBehavior: (to, from, savedPosition) => {
      if (to.hash) {
        const g = /^#id\-(\d+)$/.exec(to.hash)
        if (g) {
          const store = useStuffStore()
          store.postToScrollTo = Number(g[1])
        }
      }
    }
  },
  (ctx) => {
    // install all modules under `modules/`
    Object.values(import.meta.globEager('./modules/*.ts')).map(i => i.install?.(ctx))
  },
)
