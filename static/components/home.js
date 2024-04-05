import UserHome from './UserHome.js'
import AdminHome from './AdminHome.js'
import CreatorHome from './CreatorHome.js'

export default{
    template: `<div> 
    <UserHome v-if="userRole=='user'"/>
    <AdminHome v-if="userRole=='admin'"/>
    <CreatorHome v-if="userRole=='creator'"/>
    </div>`,
    data() {
    return {
        userRole: localStorage.getItem('role'),
        }
    },
    components: {
        UserHome,
        AdminHome,
        CreatorHome,
    },
}
