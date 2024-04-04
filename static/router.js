import home from "./components/home.js"
import Login from "./components/Login.js"
const routes = [
    {path:'/', component: home},
    {path:'/login', component: Login},
]
export default new VueRouter({
    routes,
})