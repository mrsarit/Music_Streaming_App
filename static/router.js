import home from "./components/home.js"
import Login from "./components/Login.js"
import Register from "./components/Register.js"
import Users from "./components/Users.js"
import Songadd from "./components/Songadd.js"
const routes = [
    {path:'/', component: home},
    {path:'/login', component: Login, name: 'Login'},
    {path:'/register', component: Register, name: 'Register'},
    {path: '/users', component: Users},
    {path: '/song-add', component: Songadd},
]
export default new VueRouter({
    routes,
})