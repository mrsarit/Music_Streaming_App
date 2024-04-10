export default {
    template: `<div>
    <h1> Add Song </h1>
    <input type="text" placeholder="Song title" v-model="resource.name" ></input> <br>
    <input type="text" placeholder="Lyrics" v-model="resource.lyrics"></input><br>
    <input type="text" placeholder="duration in mins" v-model="resource.duration"></input><br>
    <button @click="createResource"> Add Song</button></div>`,
    data() {
        return {
            resource: {
                name: null,
                lyrics: null,
                duration: null,

            },
            token: localStorage.getItem('auth-token')
        }
    },
    methods: {
        async createResource(){
            const res = await fetch('/api/get_song', {
                method: 'POST',
                headers: {
                    'Authentication-token': this.token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.resource),
            })
            const data= await res.json()
            if (res.ok){
                alert(data.message)
            }
        },
    }
}
