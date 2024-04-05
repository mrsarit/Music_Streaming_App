import home from "./components/home.js"
import Login from "./components/Login.js"
import Register from "./components/Register.js"
const routes = [
    {path:'/', component: home},
    {path:'/login', component: Login, name: 'Login'},
    {path:'/register', component: Register},
]
export default new VueRouter({
    routes,
})