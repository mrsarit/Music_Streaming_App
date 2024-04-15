import UserHome from './UserHome.js'
import AdminHome from './AdminHome.js'
import CreatorHome from './CreatorHome.js'
export default{
    template: `<div> 
    <UserHome />
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
        const resp = await fetch('/api/last_visit', {
            headers: {
                'Authentication-Token': this.token
            }
        })
    },
}
