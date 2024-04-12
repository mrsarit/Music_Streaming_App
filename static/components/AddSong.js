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
        file: null
      },
      token: localStorage.getItem('auth-token'),
      message: ''
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
    }
  }
}
