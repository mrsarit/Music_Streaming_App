export default {
    template : `<nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Music Streaming</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul class="navbar-nav">
        <li class="nav-item" v-if="is_login" style="float: right">
          <router-link class="nav-link" to="/">Home</router-link>
          </li>
          <li class="nav-item" v-if="is_login" style="float: right">
          <router-link class="nav-link" to="/my-albums">My Playlist</router-link>
          </li>
          <li class="nav-item" v-if="is_login" style="float: right">
          <router-link class="nav-link" to="/all-songs">All Songs</router-link>
          </li>
          <li class="nav-item" v-if="is_login" style="float: right">
          <router-link class="nav-link" to="/search">Search</router-link>
          </li>
          <li class="nav-item" v-if="role=='creator'">
          <router-link class="nav-link" to="/song-add">Add New Song</router-link>
          </li>
          <li class="nav-item" v-if="role=='admin'">
          <router-link class="nav-link" to="/users">All Users</router-link>
          </li>
          <li class="nav-item" v-if="role=='admin'">
          <router-link class="nav-link" to="/crud">Add Meta data</router-link>
          </li>
          <li class="nav-item" v-if="role === 'admin' || role === 'creator'">
          <router-link class="nav-link" to="/song_management">Music Management</router-link>
          </li>
          <li class="nav-item" v-if="is_login" style="float: right">
          <button class="nav-link" @click='logout' > Logout </button>
        </li>
        </ul>
      </div>
    </div>
  </nav>`,
  data() {
    return {
      role: localStorage.getItem('role'),
      is_login: localStorage.getItem('auth-token')
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('auth-token')
      localStorage.removeItem('role')
      this.$router.push('/login')
    }
  }
}