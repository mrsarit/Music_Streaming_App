export default{
    template: `  <div>
    <div class="row">
    <div class="col-md-6">
    <h1>Search Songs</h1>
    <input type="text" v-model="searchQuery" @input="searchSongs" placeholder="Search...">
    <ul v-if="searchResults.length > 0">
      <li v-for="song in searchResults" :key="song.id">
        {{ song.name }} by {{ song.creator }}
        <button @click="playSong(song.id)">Play</button>
        <button @click="addToAlbum(song.id)">Add to Album</button>
      </li>
    </ul>
    <p v-else>No results found</p>
    </div>
    <div>
      <h2>Choose an Playlist to Add:</h2>
      <select v-model="selectedAlbumId">
        <option v-for="album in albums" :key="album.id" :value="album.id">{{ album.name }}</option>
      </select>
    </div>
    <div class="col-md-6">
          <div class="mb-3 p-5 bg-light">
          <div v-if="title"> Title: {{title}}</div>
          <div v-if="creator"> Creator: {{creator}}</div>
            <audio ref="audioPlayer" controls></audio>
            <div>
            </div>
            </div>
        </div>
        </div>
    
  </div>`,
  data() {
    return {
      searchQuery: '',
      searchResults: [],
      title: null,
      creator: null,
      songs: [],
      albums: [],
      selectedAlbumId: null,
      currentSongIndex: -1,
      audioPlayer: null
    };
  },
  methods: {
    async searchSongs() {
      try {
        const response = await fetch(`/api/search_songs?q=${this.searchQuery}`, {
          headers: {
            'Authentication-token': localStorage.getItem('auth-token')
          }
        });
        if (response.ok) {
          this.searchResults = await response.json();
        } else {
          throw new Error('Failed to fetch search results');
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
              //this.currentSongIndex = this.songs.findIndex(song => song.id === songId);
            } else {
              throw new Error('Failed to play song');
            }
          } catch (error) {
            console.error(error);
          }
        
    },
    async fetchAlbums() {
        try {
          const response = await fetch('/api/user_albums', {
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
      async addToAlbum(songId) {
        try {
          const response = await fetch(`/api/add_to_album/${songId}/${this.selectedAlbumId}`, {
            method: 'POST',
            headers: {
              'Authentication-Token': localStorage.getItem('auth-token')
            }
          });
          if (!response.ok) {
            throw new Error('Failed to add song to album');
          }
          else {
            const data = await response.json()
            alert(data.message)
            this.$router.go(0)

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