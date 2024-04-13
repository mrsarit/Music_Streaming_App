export default {
  template: `    
    <div>
      <div class="row">
        <div class="col-md-6">
          <h1>User Albums</h1>
          <ul>
            <li v-for="album in albums" :key="album.id">
              <h2>{{ album.name }}</h2>
              <button @click="deleteAlbum(album.id)">Delete Album</button>
              <ul>
                <li v-for="song in album.songs" :key="song.id">
                  {{ song.name }} 
                  <button @click="playSong(song.id)">Play</button>
                  <button @click="deleteSong(song.id, album.id)">Delete</button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <div class="col-md-6">
          <div class="mb-3 p-5 bg-light">
            <div v-if="title"> Title: {{title}}</div>
            <div v-if="creator"> Creator: {{creator}}</div>
            <div v-if="album_name"> Album: {{album_name}}</div>
            <audio ref="audioPlayer" controls></audio>
          </div>
        </div>
      </div>
    </div>`,
  data() {
    return {
      albums: [],
      title: null,
      creator: null,
      album_name: null
    };
  },
  mounted() {
    this.fetchAlbums();
  },
  methods: {
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
    async playSong(songId) {
      try {
        if (this.audioPlayer) {
          this.audioPlayer.pause();
        }

        // Find the album that contains the song
        let currentAlbum = null;
        this.albums.forEach(album => {
          if (album.songs.find(song => song.id === songId)) {
            currentAlbum = album;
            this.album_name = album.name
          }
        });

        if (currentAlbum) {
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
          } else {
            throw new Error('Failed to play song');
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    async deleteSong(songId, albumId) {
      try {
        const response = await fetch(`/api/delete_song_from_album/${songId}/${albumId}`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': localStorage.getItem('auth-token')
          }
        });

        if (response.ok) {
          // Update the album list after deletion
          this.fetchAlbums();
        } else {
          throw new Error('Failed to delete song');
        }
      } catch (error) {
        console.error(error);
      }
    },
    async deleteAlbum(albumId) {
      try {
        const response = await fetch(`/api/delete_album/${albumId}`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': localStorage.getItem('auth-token')
          }
        });

        if (response.ok) {
          // Update the album list after deletion
          this.fetchAlbums();
        } else {
          throw new Error('Failed to delete album');
        }
      } catch (error) {
        console.error(error);
      }
    },
  }
}