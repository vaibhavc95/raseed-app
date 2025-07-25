const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue')},
      // { path: '', component: () => import('pages/IndexPage.vue'), meta: { requiresAuth: true } },
      { path: '/login', component: () => import('pages/LoginPage.vue') },
      { path: 'create-raseed', component: () => import('pages/CreateRaseedPage.vue') }

    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
