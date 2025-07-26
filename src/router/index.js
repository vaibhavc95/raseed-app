import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes.js'
import { userStore } from 'src/stores/userStore.js'

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // Load user from localStorage BEFORE navigation guards
  userStore.loadUser()

  Router.beforeEach((to, from, next) => {
    console.log('Navigation guard - checking route:', to.path)
    console.log('User logged in:', !!userStore.user)
    
    // If route requires auth and user is not logged in
    if (to.meta.requiresAuth && !userStore.user) {
      console.log('Redirecting to homepage - authentication required')
      next('/')
      return
    }
    
    // If user is logged in and trying to access homepage, redirect to dashboard
    if (to.path === '/' && userStore.user) {
      console.log('User already logged in, redirecting to dashboard')
      next('/create-raseed')
      return
    }
    
    // Allow navigation
    next()
  })

  return Router
})