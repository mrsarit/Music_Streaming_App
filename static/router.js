import home from "./components/home.js"
import Login from "./components/Login.js"
import Register from "./components/Register.js"
import Users from "./components/Users.js"
import AddSong from "./components/AddSong.js"
import MusicPlayer from "./components/MusicPlayer.js"
import PlayDirect from "./components/PlayDirect.js"
import UserAlbums from "./components/UserAlbums.js"
import Search from "./components/Search.js"
import SongManagement from "./components/SongManagement.js"
import CRUD from "./components/CRUD.js"
import AlbumSongs from "./components/AlbumSongs.js"
import AllAlbums from "./components/AllAlbums.js"
import LangSongs from "./components/LangSongs.js"
import GenreSongs from "./components/GenreSongs.js"
const routes = [
     {path:'/', component: home},
    {path:'/login', component: Login, name: 'Login'},
    {path:'/register', component: Register, name: 'Register'},
    {path: '/users', component: Users},
    {path: '/song-add', component: AddSong},
    {path: '/api/play_song/:id', component: MusicPlayer},
    {path: '/all-songs', component: PlayDirect,},
    {path: '/my-albums', component: UserAlbums,},
    {path: '/search', component: Search,},
    {path: '/song_management', component: SongManagement,},
    {path: '/crud', component: CRUD,},
    {path:'/album/:albumId', component: AlbumSongs, name: 'AlbumSongs'},
    {path: '/all-albums', component: AllAlbums,},
    {path:'/lang/:langId', component: LangSongs, name: 'LanguageDetail'},
    {path:'/genre/:genreId', component: GenreSongs, name: 'GenreDetail'},

]
export default new VueRouter({
    routes,
})