import UserHome from './UserHome.js'
import AdminHome from './AdminHome.js'
import CreatorHome from './CreatorHome.js'
import SongAll from './SongAll.js'
export default{
    template: `<div> 
    <UserHome v-if="userRole=='user'"/>
    <AdminHome v-if="userRole=='admin'"/>
    <CreatorHome v-if="userRole=='creator'"/>
    <SongAll v-for="(song, index) in song" :key="index" :song="song"/>
    </div>`,
    data() {
    return {
        userRole: localStorage.getItem('role'),
        song: [],
        token: localStorage.getItem('auth-token'),
        }
    },
    components: {
        UserHome,
        AdminHome,
        CreatorHome,
        SongAll,
    },
    async mounted() {
        const res = await fetch('/api/get_song', {
            headers: {
                'Authentication-Token': this.token
            }
        })
        const data = await res.json()
        if (res.ok){
            this.song= data
        } else {
            alert(data.message)
        }
    },
}
