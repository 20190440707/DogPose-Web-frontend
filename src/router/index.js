import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/index.js'

const router = createRouter({
  history: createWebHistory('management'),
  routes: [
    {
      path: '/',
      name: 'HomePage',
      redirect: '/labels',
      component: () => import('@/layouts/BasicLayout.vue'),
      children: [
        {
          path: '/labels',
          name: 'LabelPage',
          component: () => import('@/views/label/LabelView.vue'),
        },
        {
          path: '/profile',
          name: 'ProfilePage',
          component: () => import('@/views/profile/ProfileView.vue'),
        },
        {
          path: '/inference-old',
          name: 'InferenceOldPage',
          component: () => import('@/views/inference-old/InferenceOldView.vue'),
        },
        {
          path: '/inference',
          name: 'BehaviorLayout',
          component: () => import('@/views/behavior/BehaviorLayout.vue'),
          redirect: '/inference/olfaction',
          children: [
            {
              path: 'olfaction',
              name: 'OlfactionPage',
              component: () => import('@/views/inference/InferencePageView.vue'),
              props: { port: 10011 },
            },
            {
              path: 'courage',
              name: 'CouragePage',
              component: () => import('@/views/inference/InferencePageView.vue'),
              props: { port: 10021 },
            },
            {
              path: 'aggressiveness',
              name: 'AggressivenessPage',
              component: () => import('@/views/inference/InferencePageView.vue'),
              props: { port: 10031 },
            },
            {
              path: 'retrieving',
              name: 'RetrievingPage',
              component: () => import('@/views/inference/InferencePageView.vue'),
              props: { port: 10004 },
            },
            {
              path: 'endurance',
              name: 'EndurancePage',
              component: () => import('@/views/inference/InferencePageView.vue'),
              props: { port: 10051 },
            },
          ],
        },
        {
          path: '/admin',
          name: 'AdminLayout',
          component: () => import('@/views/admin/AdminLayout.vue'),
          redirect: '/admin/users',
          children: [
            {
              path: 'users',
              name: 'UserManagement',
              component: () => import('@/views/admin/UserManagementView.vue'),
            },
            {
              path: 'invite-code',
              name: 'InviteCodeSetting',
              component: () => import('@/views/admin/InviteCodeView.vue'),
            },
            {
              path: 'data-directory',
              name: 'DataDirectorySetting',
              component: () => import('@/views/admin/DataDirectoryView.vue'),
            },
          ],
        },
      ],
    },
    {
      path: '/login',
      name: 'LoginPage',
      component: () => import('@/views/login/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'RegisterPage',
      component: () => import('@/views/register/RegisterView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  if (userStore.user && to.path === '/login') return '/'

  return true
})

export default router
