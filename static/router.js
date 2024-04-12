import home from "./components/home.js"
import Login from "./components/Login.js"
import Register from "./components/Register.js"
import Users from "./components/Users.js"
import AddSong from "./components/AddSong.js"
import MusicPlayer from "./components/MusicPlayer.js"
import PlayDirect from "./components/PlayDirect.js"
const routes = [
    // {path:'/', component: home},
    {path:'/login', component: Login, name: 'Login'},
    {path:'/register', component: Register, name: 'Register'},
    {path: '/users', component: Users},
    // {path: '/song-add', component: Songadd},
    {path: '/song-add', component: AddSong},
    {path: '/api/play_song/:id', component: MusicPlayer},
    {path: '/', component: PlayDirect,}

]
export default new VueRouter({
    routes,
})