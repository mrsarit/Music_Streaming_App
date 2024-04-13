export default {
    template: `
      <div>
      <div class="row">
        <div class="col-md-6">
        <h2>Recently Added Songs</h2>
        <ul>
          <li v-for="song in recentlyAdded" :key="song.id">
          {{ song.name }} <button @click="playSong(song.id)">Play</button>
          </li>
        </ul>
        
        <h2>Top Rated Songs</h2>
        <ul>
          <li v-for="song in topRated" :key="song.id">
            {{ song.name }} - Rating: {{ song.average_rating }} <button @click="playSong(song.id)">Play</button>
          </li>
        </ul>
        </div>
        <div class="col-md-6">
          <div class="mb-3 p-5 bg-light">
          <div v-if="title"> Title: {{title}}</div>
          <div v-if="creator"> Creator: {{creator}}</div>
          <div v-if="lyrics"> Lyrics: {{lyrics}}</div>
          <div v-if="average_rating"> Average Rating: {{ average_rating }}</div>
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

          </div>
        </div>
      </div></div>
    `,
    data() {
      return {
      recentlyAdded: [],
      topRated: [],
      audioPlayer: null,
      title: null,
      creator: null,
      lyrics: null,
      albumName: '',
      selectedSongs: [],
      average_rating: null,
      song_id: null,
      selectedRating:null,
      };
    },
    mounted() {
      this.fetchRecentlyAdded();
      this.fetchTopRated();
    },
    methods: {
      async fetchRecentlyAdded() {
        try {
          const response = await fetch('/api/recently_added_songs', {
            headers: {
                'Authentication-Token': localStorage.getItem('auth-token')
            }
        });
          if (response.ok) {
            this.recentlyAdded = await response.json();
          } else {
            throw new Error('Failed to fetch recently added songs');
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
            throw new Error('Failed to fetch top rated songs');
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
            this.selectedRating = data1.current_user_rating
            
            // Find the index of the current song
          } else {
            throw new Error('Failed to play song');
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
            this.playSong(songId);
          } else {
            throw new Error('Failed to rate song');
          }
        } catch (error) {
          console.error(error);
        }
      },
    },
  };
  