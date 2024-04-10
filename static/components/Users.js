export default{
    template: `<div> 
    <div v-if="error"> {{error}}</div>
    <div v-for="(creator, index) in allcreators"> {{creator.email}} <button v-if='!creator.active' @click="approve(creator.id)"> Approve </button></div>
    </div>`,
    data() {
        return {
            allcreators: [],
            token: localStorage.getItem('auth-token'),
            error: null
        }
    },
    methods: {
        async approve(user_id) {
            const res = await fetch(`/admin/activate/${user_id}`, {
              headers: {
                'Authentication-Token': this.token,
              },
            })
            const data = await res.json()
            if (res.ok) {
              alert(data.message)
              this.$router.go(0)
            }
        }

    },
    async mounted() {
        const res = await fetch('/users', {
            headers: {
                "Authentication-Token": this.token,
            },
        })
        const data = await res.json().catch((e)=>{})
        console.log(res.status)
        if (res.ok){
            this.allcreators = data
        } else {
            console.log("error")
            this.error = "You are not Authorized"
        }
    }

}