export default{
    template: `  <div>
    <h2>All Albums</h2>
    <ul>
      <li v-for="album in albums" :key="album.id">
        <router-link :to="{ name: 'AlbumSongs', params: { albumId: album.id }}">
          {{ album.name }}
        </router-link>
        <p>Creator: {{ album.creator }}</p>
      </li>
    </ul>
  </div>`,
  data() {
    return {
      albums: [],
    };
  },
  mounted() {
    this.fetchAlbums();
  },
  methods: {
    async fetchAlbums() {
      try {
        const response = await fetch('/api/get_album', {
          headers: {
            'Authentication-Token': localStorage.getItem('auth-token'),
          },
        });
        if (response.ok) {
          this.albums = await response.json();
        } else {
          throw new Error('Failed to fetch albums');
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
}