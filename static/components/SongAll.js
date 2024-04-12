export default{
    template: `  <div>
    <h1>Song List</h1>
    <ul>
      <li v-for="song in songs" :key="song.id">
        <router-link :to="'/api/play_song/' + song.id">{{ song.name }}</router-link>
      </li>
    </ul>
  </div>`,
  data() {
    return {
      songs: [],
      isLoaded: false
    };
  },
  created() {
    if (!this.loaded) {
        this.fetchSongs();
        this.loaded = true;
    }
},
  methods: {
    async fetchSongs() {
      const response = await fetch('/api/get_song', {
        headers: {
          'Authentication-Token': localStorage.getItem('auth-token')
        }
      });
      const data = await response.json();
      this.songs = data;
    }
  }
}