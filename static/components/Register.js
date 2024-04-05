export default{
    template: `
    <div class='d-flex justify-content-center' style="margin-top: 20vh" >
    <div class="mb-3 p-5 bg-light">
    <div class='text-danger'> {{error}}</div>
    <label for="username" class="form-label">User Name</label>
    <input type="text" class="form-control" id="username"
    v-model='cred.username'>
    <label for="user_email" class="form-label">Email address</label>
    <input type="email" class="form-control" id="user_email" placeholder="name@example.com"
    v-model='cred.email'>
    <label for="select_role">Select Role</label>
    <select v-model="selected">
      <option v-for="option in options" :value="option.id">{{ option.name }}</option>
    </select><br><br>
    <label for="user_password" class="form-label">Password</label>
    <input type="password" class="form-control" id="user_password" 
    v-model='cred.password'>
    <button class="btn btn-primary mt-2" @click='register' > Register </button>
  </div>
  </div>`,
  data(){
    return {
        cred: {
            email: null,
            password: null,
            username: null
        },
        error: null,
        selected: 'user', // Default selected option (you can set this based on your initial data)
      options: [
        { name: 'User', id: 'user' },
        { name: 'Creator', id: 'creator' },
        { name: 'Admin', id: 'admin' },
        // Add more options as needed
      ],
    }
  },
  methods: {
    async register(){
        const res = await fetch('api/registration',{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: this.cred.email, password: this.cred.password, roles: this.selected, username: this.cred.username }),
        } )
        const data = await res.json()
        if(res.ok){
          this.$router.push({ path: '/login' })
        } else {
          this.error = "User registration failed. Please try again."
        }
    },
  },
}