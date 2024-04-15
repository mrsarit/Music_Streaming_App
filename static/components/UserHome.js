export default {
    template: `
      <div>
        <div class="row">
          <div class="col-md-4">
            <h2>Recently Added Songs</h2>
            <ul>
              <li v-for="(song, index) in recentlyAdded" :key="song.id" v-if="index < 5">
                {{ song.name }} <button @click="playSong(song.id)">Play</button>
              </li>
            </ul>    
        <h2>Recently Added Albums</h2>
           <ul>      
              <li v-for="(album, index) in recentlyUpdatedAlbums" :key="album.id" v-if="index < 5">
              <router-link :to="{ name: 'AlbumSongs', params: { albumId: album.id } }">{{ album.name }}</router-link>
              </li>
            </ul>
            <h2>All Languages</h2>
            <span v-for="(language, index) in allLanguages" :key="language.id">
            <router-link :to="{ name: 'LanguageDetail', params: { langId: language.id }}">{{ language.name }}</router-link>
            {{ index < allLanguages.length - 1 ? ', ' : '' }}
        </span>
          </div>
          <div class="col-md-4">
          <h2>Top Rated Songs</h2>
        <ul>
          <li v-for="(song, index) in topRated" :key="song.id" v-if="index < 5">
            {{ song.name }} - Rating: {{ song.average_rating }} <button @click="playSong(song.id)">Play</button>
          </li>
        </ul>            
            <h2>All Genres</h2>
            <span v-for="(genre, index) in allGenres" :key="genre.id">
            <router-link :to="{ name: 'GenreDetail', params: { genreId: genre.id }}">{{ genre.name }}</router-link>
            {{ index < allGenres.length - 1 ? ', ' : '' }}
        </span>
          </div>
          <div class="col-md-4">
          <div class="mb-3 p-5 bg-light">
          <div v-if="title"> Title: {{title}}</div>
          <div v-if="album"> Album: {{album}}</div>
          <div v-if="artist"> Singer: {{artist}}</div>
          <div v-if="lang"> Language: {{lang}}</div>
          <div v-if="genre"> Genre: {{genre}}</div>
          <div v-if="creator"> Creator: {{creator}}</div>
          <div v-if="average_rating"> Average Rating: {{ average_rating }}</div>
            <audio ref="audioPlayer" controls></audio>
              <div v-if="lyrics"> Lyrics: {{ lyrics }}</div>

          </div>
        </div>
        </div>
      </div>
    `,
    data() {
      return {
        recentlyAdded: [],
        topRated: [],
        recentlyUpdatedAlbums: [],
        allLanguages: [],
        topArtists: [],
        allGenres: [],
        audioPlayer: null,
      title: null,
      creator: null,
      lyrics: null,
      album: null,
      albumName: '',
      selectedSongs: [],
      average_rating: null,
      song_id: null,
      artist: null,
      genre: null,
      lang: null
      };
    },
    mounted() {
      this.fetchRecentlyAdded();
      this.fetchTopRated();
      this.fetchRecentlyUpdatedAlbums();
      this.fetchAllLanguages();
      this.fetchTopArtists();
      this.fetchAllGenres();
    },
    methods: {
      async fetchRecentlyUpdatedAlbums() {
        try {
          const response = await fetch('/api/get_album', {
            headers: {
              'Authentication-Token': localStorage.getItem('auth-token')
            }
          });
          if (response.ok) {
            this.recentlyUpdatedAlbums = await response.json();
          } else {
            throw new Error('Failed to fetch recently updated albums');
          }
        } catch (error) {
          console.error(error);
        }
      },
      async fetchRecentlyAdded() {
        try {
          const response = await fetch('/api/get_song', {
            headers: {
              'Authentication-Token': localStorage.getItem('auth-token')
            }
          });
          if (response.ok) {
            this.recentlyAdded = await response.json();
          } else {
            throw new Error('Failed to fetch recently updated albums');
          }
        } catch (error) {
          console.error(error);
        }
      },
      async fetchAllLanguages() {
        try {
          const response = await fetch('/languages', {
            headers: {
              'Authentication-Token': localStorage.getItem('auth-token')
            }
          });
          if (response.ok) {
            this.allLanguages = await response.json();
            console.log(this.allLanguages)
          } else {
            throw new Error('Failed to fetch all languages');
          }
        } catch (error) {
          console.error(error);
        }
      },
      async fetchTopArtists() {
        try {
          const response = await fetch('/api/top_artists', {
            headers: {
              'Authentication-Token': localStorage.getItem('auth-token')
            }
          });
          if (response.ok) {
            this.topArtists = await response.json();
          } else {
            throw new Error('Failed to fetch top artists');
          }
        } catch (error) {
          console.error(error);
        }
      },
      async fetchAllGenres() {
        try {
          const response = await fetch('/genres', {
            headers: {
              'Authentication-Token': localStorage.getItem('auth-token')
            }
          });
          if (response.ok) {
            this.allGenres = await response.json();
          } else {
            throw new Error('Failed to fetch all genres');
          }
        } catch (error) {
          console.error(error);
        }
      },
      async fetchTopRated() {
        try {
          const response = await fetch('/api/top_rated_songs', {
            headers: {
              'Authentication-Token': localStorage.getItem('auth-token')
            }
          });
          if (response.ok) {
            this.topRated = await response.json();
          } else {
            throw new Error('Failed to fetch recently updated albums');
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
            this.lyrics = data1.lyrics
            this.creator = data1.creator
            this.average_rating = data1.average_rating
            this.song_id = data1.id
            this.album = data1.album
            this.artist = data1.artist
            this.genre = data1.genre
            this.lang = data1.lang

          } else {
            throw new Error('Failed to play song');
          }
        } catch (error) {
          console.error(error);
        }
      },      
    }
  };
  