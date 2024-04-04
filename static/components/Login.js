export default{
    template: `
    <div class='d-flex justify-content-center' style="margin-top: 20vh" >
    <div class="mb-3 p-5 bg-light">
    <label for="user_email" class="form-label">Email address</label>
    <input type="email" class="form-control" id="user_email" placeholder="name@example.com"
    v-model='cred.email'>
    <label for="user_password" class="form-label">Password</label>
    <input type="password" class="form-control" id="user_password" 
    v-model='cred.password'>
    <button class="btn btn-primary mt-2" @click='login' > Login </button>
  </div>
  </div>`,
  data(){
    return {
        cred: {
            email: null,
            password: null
        },
    }
  },
  methods: {
    async login(){
        console.log(this.cred)
    },
  },
}