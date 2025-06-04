import {createRouter, createWebHistory} from 'vue-router';
import RegisterForm from '@/components/RegisterForm.vue';
import LoginForm from '@/components/LoginForm.vue';
import WelcomePage from "@/components/WelcomePage.vue";
import AdminPage from "@/components/AdminPage.vue";
import AddProduct from "@/components/AddProduct.vue";
import NotFound from "@/components/NotFound.vue";
import axios from "axios";
import ActiveOrders from "@/components/ActiveOrders.vue";
import HistoryOrders from "@/components/HistoryOrders.vue";
import AdminOrders from "@/components/AdminOrders.vue";
import UserOrderHistory from "@/components/UserOrderHistory.vue";

const routes = [
    {path: '/register', component: RegisterForm},
    {path: '/log', component: LoginForm},
    {path: '/', redirect: '/welcome'},
    {path: '/welcome', component: WelcomePage},
    {
        path: '/admin',
        component: AdminPage,
        meta: {requiresAdmin: true},
    },
    {path: '/admin/add-product', component: AddProduct, meta: {requiresAdmin: true}},
    {
        path: '/not-found',
        component: NotFound,
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/not-found'
    },
    {
        path: '/order-history',
        component: HistoryOrders,
    },
    {
        path: '/order-active',
        component: ActiveOrders,
    },
    {
        path: '/admin/orders',
        component: AdminOrders,
        meta: {requiresAdmin: true},
    },
    {
        path: '/user/:userId/orders-history',
        component: UserOrderHistory,
        meta: {requiresAdmin: true}
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to, from, next) => {
    const isAuthenticated = localStorage.getItem('auth') === 'true';
    const publicPages = ['/login', '/log', '/register', '/welcome'];
    const authPages = ['/login', '/log', '/register'];

    if (isAuthenticated && authPages.includes(to.path)) {
        return next('/welcome');
    }

    if (!isAuthenticated && !publicPages.includes(to.path)) {
        return next('/register');
    }

    if (to.meta.requiresAdmin) {
        try {
            const res = await axios.get('/api/user/profile', {withCredentials: true});
            console.log(res.data);
            if (res.data.role === 'ROLE_ADMIN') {
                return next();
            } else {
                return next('/not-found');
            }
        } catch (err) {
            return next('/log');
        }
    }

    next();
});


export default router;
