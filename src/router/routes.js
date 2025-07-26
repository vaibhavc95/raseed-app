const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // Root path - HomePage with conditional rendering based on auth
      { path: '', component: () => import('pages/HomePage.vue') },
      
      // Protected routes
      { path: '/create-raseed', component: () => import('pages/CreateRaseedPage.vue'), meta: { requiresAuth: true }},
      { path: '/assistant', component: () => import('pages/AssistantPage.vue'), meta: { requiresAuth: true }},
      // { path: '/assistant', component: () => import('pages/AssistantPage.vue')},
      
      // Remove these unused routes
      // { path: '/home', component: () => import('pages/IndexPage.vue')},
      // { path: '/login', component: () => import('pages/HomePage.vue')},
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
