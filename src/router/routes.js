const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue')},
      { path: '/home', component: () => import('pages/HomePage.vue')},
      { path: '/login', component: () => import('pages/LoginPage.vue') },
      { path: '/create-raseed', component: () => import('pages/CreateRaseedPage.vue'), meta: { requiresAuth: true }},
      { path: '/assistant', component: () => import('pages/AssistantPage.vue'), meta: { requiresAuth: true }}
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
