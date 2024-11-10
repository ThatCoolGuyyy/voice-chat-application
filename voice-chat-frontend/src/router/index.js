import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../components/LoginView.vue";
import DashboardView from "../components/DashboardView.vue";
import CallView from "../components/CallView.vue";
import store from "../store"; 

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: LoginView },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: "/call/:userId/:username",
    name: "call",
    component: CallView,
    props: true,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.state.user || localStorage.getItem("user");

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else {
    next();
  }
});

export default router;