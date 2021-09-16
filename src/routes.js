import Vue from 'vue'
import VueRouter from 'vue-router';
import store from '@/store'

Vue.use(VueRouter);

var routes = new VueRouter({
    mode: 'history',
    // base  : 'aaaa'process.env.BASE_URL,
    routes: [
        {
            name: 'login',
            path: '/login',
            component: () => import('@/views/user/login'),
            meta: {requiresAuth: false}
        },
        {
            name: 'register',
            path: '/register',
            component: () => import('@/views/user/register'),
            meta: {requiresAuth: false}
        },
        {
            name: 'external',
            path: '/external/view',
            component: () => import('@/views/external/view'),
            meta: {requiresAuth: false}
        },

        {
            name: 'dashboard',
            path: '/',
            component: () => import('@/views/dashboard'),
            meta: {requiresAuth: true}
        },
        {
            name: 'schedule',
            path: '/schedule',
            component: () => import('@/views/schedule/list'),
            meta: {requiresAuth: true}
        },
        {
            name: 'embed',
            path: '/embed',
            component: () => import('@/views/embed/view'),
            meta: {requiresAuth: true}
        },
        {
            name: 'room',
            path: '/room',
            component: () => import('@/views/room/list'),
            meta: {requiresAuth: true}
        },
    ],
})

routes.beforeEach((to, from, next) => {
    let hasToken = !!store.getters.token;
    if (to.matched.some(record => record.meta.requiresAuth) && !hasToken)
        next('/login')

    if (to.path.toString() === "/login" && hasToken)
        next('/');
    else
        next();
});
export default routes;


