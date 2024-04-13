export default {
    template: `<div>
    <h1>Add Song</h1>
    <form @submit.prevent="uploadSong">
      <label for="name">Title:</label>
      <input type="text" id="name" v-model="formData.name" required><br><br>

      <label for="lyrics">Lyrics:</label>
      <textarea id="lyrics" v-model="formData.lyrics" required></textarea><br><br>

      <label for="duration">Duration:</label>
      <input type="text" id="duration" v-model="formData.duration" required><br><br>
      <div>
      <h2>Choose an Album to Add:</h2>
      <select v-model="selectedAlbumId">
        <option v-for="album in albums" :key="album.id" :value="album.id">{{ album.name }}</option>
      </select>
    </div>
      <label for="file">Select File:</label>
      <input type="file" id="file" @change="handleFileUpload" required><br><br>

      <button type="submit">Upload</button>
    </form>
    <div v-if="message">{{ message }}</div>
  </div>`,
  data() {
    return {
      formData: {
        name: '',
        lyrics: '',
        duration: '',
        file: null,
        selectedAlbumId: null
      },
      token: localStorage.getItem('auth-token'),
      message: '',
      albums: [],
      selectedAlbumId: null,
    };
  },
  methods: {
    handleFileUpload(event) {
      this.formData.file = event.target.files[0];
    },
    async uploadSong() {
      let formData = new FormData();
      formData.append('name', this.formData.name);
      formData.append('lyrics', this.formData.lyrics);
      formData.append('duration', this.formData.duration);
      formData.append('file', this.formData.file);
      formData.append('selectedAlbumId', this.formData.selectedAlbumId);

      try {
        const response = await fetch('/upload', {
          headers: {'Authentication-token': this.token,},
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        this.message = data.message;
      } catch (error) {
        console.error('Error:', error);
        this.message = 'An error occurred. Please try again.';
      }
    },
    async fetchAlbums() {
      try {
        const response = await fetch('/api/get_user_albums', {
          headers: {
            'Authentication-Token': localStorage.getItem('auth-token')
          }
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
  created() {
    this.fetchAlbums();
  }
}
