export default {
    template: `
    <div>
    <div class="row">
      <div class="col-md-6">
        <h1>Your Songs</h1>
        <ul>
          <li v-for="song in songs" :key="song.id">
            {{ song.name }} 
            <button @click="playSong(song.id)">Play</button>
            <button @click="editSong(song)">Edit</button>
            <button @click="deleteSong(song.id)">Delete</button>
          </li>
        </ul>
      </div>
      <div class="col-md-6">
      <div class="mb-3 p-5 bg-light">
        <div v-if="title"> Title: {{title}}</div>
        <audio ref="audioPlayer" controls></audio>
        <form v-if="song_id" @submit.prevent="rateSong(song_id)">
                <label for="rating">Rating:</label>
                <select v-model="selectedRating" id="rating">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
                <button type="submit">Rate</button>
              </form>
        <div v-if="lyrics"> Lyrics: {{ lyrics }}</div>
        <div v-if="averageRating"> Average Rating: {{ averageRating }}</div>
        <div v-if="selectedSongId">
              <label for="editedSongName">Name:</label>
              <input type="text" id="editedSongName" v-model="editedSongName"> <br>
              <label for="editedSongLyrics">Lyrics:</label>
              <textarea id="editedSongLyrics" v-model="editedSongLyrics"></textarea><br>
              <label for="editedSongDuration">Duration:</label>
              <input type="text" id="editedSongDuration" v-model="editedSongDuration"><br>
              <label for="name">Album:</label>
              <select v-model="selectedAlbumId">
                <option v-for="album in albums" :key="album.id" :value="album.id">{{ album.name }}</option>
              </select>
              <label for="name">Artist:</label>
            <select v-model="selectedArtistId">
              <option v-for="artist in artists" :key="artist.id" :value="artist.id">{{ artist.name }}</option>
            </select>
            <label for="name">Language:</label>
          <select v-model="selectedLanguageId">
            <option v-for="language in languages" :key="language.id" :value="language.id">{{ language.name }}</option>
          </select>
          <label for="name">Genre:</label>
          <select v-model="selectedGenreId">
            <option v-for="genre in genres" :key="genre.id" :value="genre.id">{{ genre.name }}</option>
          </select>
              <button @click="saveEditedSong">Save</button>
            </div>
      </div>
      <div class="row">
      <div class="col-md-6">
        <h2>Create Album</h2>
        <form @submit.prevent="createAlbum">
          <label for="albumName">Album:</label>
          <input type="text" id="albumName" v-model="albumName" required>
          <button type="submit">Create Album</button>
        </form>
      </div>
    </div>
    </div>
    </div>
  </div>`,
  data() {
    return {
      songs: [],
      selectedSongId: null,
      title: null,
      song_id: null,
      editedSongName: '',
      editedSongLyrics: '',
      editedSongDuration: '',
      averageRating: null,
      selectedRating: null,
      lyrics: null,
      albumName: null,
      albums: [],
      selectedAlbumId: null,
      genres: [],
      selectedGenreId: null,
      artists: [],
      selectedArtistId: null,
      languages: [],
      selectedLanguageId: null,
    };
  },
  mounted() {
    this.fetchSongs();
    this.fetchAlbums();
    this.fetchArtists();
    this.fetchGenres();
    this.fetchLanguages();

  },
  methods: {
    async fetchSongs() {
      try {
        const response = await fetch('/api/creator_songs', {
          headers: {
            'Authentication-Token': localStorage.getItem('auth-token')
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
              this.lyrics = data1.lyrics,
              this.song_id = data1.id
            } else {
              throw new Error('Failed to play song');
            }
          
        } catch (error) {
          console.error(error);
        }
      },
      async createAlbum() {
        try {
          const response = await fetch('/api/song-albums', {
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
            this.$router.go(0)
            alert('Album created successfully');
            this.albumName = '';
            this.selectedSongs = [];
            
          } else {
            throw new Error('Failed to create album');
          }
        } catch (error) {
          console.error(error);
        }
      },
    async deleteSong(songId) {
      try {
        const response = await fetch(`/api/delete_song/${songId}`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': localStorage.getItem('auth-token')
          }
        });

        if (response.ok) {
          this.fetchSongs();
          this.selectedSongId = null;
        } else {
          throw new Error('Failed to delete song');
        }
      } catch (error) {
        console.error(error);
      }
    },
    editSong(song) {
        this.editedSongName = song.name;
        this.editedSongLyrics = song.lyrics;
        this.editedSongDuration = song.duration;
        this.selectedSongId = song.id;
        this.selectedAlbumId = song.album;
        this.selectedArtistId = song.artist;
        this.selectedLanguageId = song.lang;
        this.selectedGenreId = song.genre;
      },
      async saveEditedSong() {
        try {
          console.log(this.selectedAlbumId)
          const response = await fetch(`/api/edit_song/${this.selectedSongId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': localStorage.getItem('auth-token')
            },
            body: JSON.stringify({
              name: this.editedSongName,
              lyrics: this.editedSongLyrics,
              duration: this.editedSongDuration,
              album: this.selectedAlbumId,
              artist: this.selectedArtistId,
              lang: this.selectedLanguageId,
              genre: this.selectedGenreId,

            })
          });
  
          if (response.ok) {
            this.fetchSongs();
            this.selectedSongId = null;
            this.editedSongName = '';
            this.editedSongLyrics = '';
            this.editedSongDuration = '';
          } else {
            throw new Error('Failed to edit song');
          }
        } catch (error) {
          console.error(error);
        }
      },
      async rateSong(songId) {
        try {
          const response = await fetch(`/api/rate_song/${songId}/${this.selectedRating}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': localStorage.getItem('auth-token')
            }
          });
  
          if (response.ok) {
            // Update the average rating after successful rating submission
            this.fetchSongs();
          } else {
            throw new Error('Failed to rate song');
          }
        } catch (error) {
          console.error(error);
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
    async fetchLanguages() {
      try {
        const response = await fetch('/languages', {
          headers: {
            'Authentication-Token': localStorage.getItem('auth-token')
          }
        });
        if (response.ok) {
          this.languages = await response.json();
        } else {
          throw new Error('Failed to fetch albums');
        }
      } catch (error) {
        console.error(error);
      }
    },
    async fetchGenres() {
      try {
        const response = await fetch('/genres', {
          headers: {
            'Authentication-Token': localStorage.getItem('auth-token')
          }
        });
        if (response.ok) {
          this.genres = await response.json();
        } else {
          throw new Error('Failed to fetch albums');
        }
      } catch (error) {
        console.error(error);
      }
    },
    async fetchArtists() {
      try {
        const response = await fetch('/artists', {
          headers: {
            'Authentication-Token': localStorage.getItem('auth-token')
          }
        });
        if (response.ok) {
          this.artists = await response.json();
        } else {
          throw new Error('Failed to fetch albums');
        }
      } catch (error) {
        console.error(error);
      }
    },
    }
  }
  