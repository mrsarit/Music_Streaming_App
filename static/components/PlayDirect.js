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
          <div v-if="album"> Album: {{album}}</div>
          <div v-if="artist"> Singer: {{artist}}</div>
          <div v-if="lang"> Language: {{lang}}</div>
          <div v-if="genre"> Genre: {{genre}}</div>
          <div v-if="creator"> Creator: {{creator}}</div>
          <div v-if="average_rating"> Average Rating: {{ average_rating }}</div>
            <audio ref="audioPlayer" controls></audio>
            <div>
              <button @click="playNext">Next</button>
              <button @click="playPrevious">Previous</button>
            </div>
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
      </div>
    </div>`,
  data() {
    return {
      songs: [],
      currentSongIndex: -1,
      audioPlayer: null,
      title: null,
      creator: null,
      lyrics: null,
      album: null,
      albumName: '',
      selectedSongs: [],
      average_rating: null,
      song_id: null,
      selectedRating:null,
      artist: null,
      genre: null,
      lang: null

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
          this.lyrics = data1.lyrics
          this.creator = data1.creator
          this.average_rating = data1.average_rating
          this.song_id = data1.id
          this.selectedRating = data1.current_user_rating
          this.album - data1.album
          this.artist = data1.artist
          this.genre = data1.genre
          this.lang = data1.lang
          
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
  created() {
    this.fetchSongs();
  },
  
}