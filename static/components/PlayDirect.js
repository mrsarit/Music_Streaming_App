export default{
    template: `   <div>
      <div class="row">
        <div class="col-md-6">
          <h1>Song List</h1>
          <ul>
            <li v-for="song in songs" :key="song.id">
              {{ song.name }} <button @click="playSong(song.id)">Play</button>
            </li>
          </ul>
        </div>
        <div class="col-md-6">
          <div class="mb-3 p-5 bg-light">
          <div v-if="title"> Title: {{title}}</div>
          <div v-if="creator"> Creator: {{creator}}</div>
            <audio ref="audioPlayer" controls></audio>
            <div>
              <button @click="playNext">Next</button>
              <button @click="playPrevious">Previous</button>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
      <div class="col-md-6">
        <h2>Create Album</h2>
        <form @submit.prevent="createAlbum">
          <label for="albumName">Album Name:</label>
          <input type="text" id="albumName" v-model="albumName" required>
          <label for="songSelect">Select Songs:</label>
          <select id="songSelect" v-model="selectedSongs" multiple>
            <option v-for="song in songs" :key="song.id" :value="song.id">{{ song.name }}</option>
          </select>
          <button type="submit">Create Album</button>
        </form>
      </div>
    </div>
    </div>`,
  data() {
    return {
      songs: [],
      currentSongIndex: -1,
      audioPlayer: null,
      title: null,
      creator: null,
      albumName: '',
      selectedSongs: []
    };
  },
  methods: {
    async fetchSongs() {
      try {
        const response = await fetch('/api/get_song', {
          headers: {
            'Authentication-token': localStorage.getItem('auth-token')
          }
        });
        if (response.ok) {
          this.songs = await response.json();
        } else {
          throw new Error('Failed to fetch songs');
        }
      } catch (error) {
        console.error(error);
      }
    },
    async playSong(songId) {
      try {
        if (this.audioPlayer) {
          this.audioPlayer.pause();
        }
        const response = await fetch(`/api/play_song/${songId}`, {
          headers: {
            'Authentication-Token': localStorage.getItem('auth-token')
          }
        });
        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          this.audioPlayer = this.$refs.audioPlayer;
          this.audioPlayer.src = audioUrl;
          this.audioPlayer.play();
          const response1 = await fetch(`/api/get_song/${songId}`, {
            headers: {
              'Authentication-Token': localStorage.getItem('auth-token')
            }
          })
          const data1 = await response1.json()
          this.title = data1.name
          this.creator = data1.creator
          
          // Find the index of the current song
          this.currentSongIndex = this.songs.findIndex(song => song.id === songId);
        } else {
          throw new Error('Failed to play song');
        }
      } catch (error) {
        console.error(error);
      }
    },
    playNext() {
      if (this.currentSongIndex < this.songs.length - 1) {
        const nextSongId = this.songs[this.currentSongIndex + 1].id;
        this.playSong(nextSongId);
      }
    },
    playPrevious() {
      if (this.currentSongIndex > 0) {
        const previousSongId = this.songs[this.currentSongIndex - 1].id;
        this.playSong(previousSongId);
      }
    },
    async createAlbum() {
      try {
        const response = await fetch('/api/albums', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token')
          },
          body: JSON.stringify({
            name: this.albumName,
            songs: this.selectedSongs
          })
        });
        if (response.ok) {
          alert('Album created successfully');
          this.albumName = '';
          this.selectedSongs = [];
        } else {
          throw new Error('Failed to create album');
        }
      } catch (error) {
        console.error(error);
      }
    }
  },
  created() {
    this.fetchSongs();
  }
}