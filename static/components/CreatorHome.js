import MusicPlayerNew from "./MusicPlayerNew.js";
export default {
    template: `<div>
    <div class="row">
    <div class="col-md-6">
    <h2>Recently Added Songs</h2>
    <ul>
      <li v-for="song in recentlyAdded" :key="song.id">
        {{ song.name }}
        <button @click="playSong(song.id)">Play</button>
      </li>
    </ul>
    
    <h2>Top Rated Songs</h2>
    <ul>
      <li v-for="song in topRated" :key="song.id">
        {{ song.name }} - Rating: {{ song.average_rating }}
        <button @click="playSong(song.id)">Play</button>
        <button @click="rateSong(song.id)">Rate</button>
      </li>
    </ul>
    </div>
    <!-- Include the MusicPlayer component -->
    <MusicPlayerNew
      :title="currentSong.name"
      :creator="currentSong.creator"
      :lyrics="currentSong.lyrics"
      :average_rating="currentSong.average_rating"
      :song_id="currentSong.id"
      @play-next="playNext"
      @play-previous="playPrevious"
      @rating-updated="fetchTopRated"
    ></MusicPlayerNew>
  </div>
  </div>`,
  components: {
    MusicPlayerNew
  },
  data() {
    return {
      recentlyAdded: [],
      topRated: [],
      currentSongIndex: 0,
      currentSong: {}
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
    playSong(songId) {
      // Logic to play the song
      this.currentSong = this.recentlyAdded.find(song => song.id === songId) || this.topRated.find(song => song.id === songId);
      console.log(this.currentSong)
    },
    playNext() {
      this.currentSongIndex = (this.currentSongIndex + 1) % (this.recentlyAdded.length + this.topRated.length);
      this.currentSong = this.currentSongIndex < this.recentlyAdded.length ? this.recentlyAdded[this.currentSongIndex] : this.topRated[this.currentSongIndex - this.recentlyAdded.length];
    },
    playPrevious() {
      this.currentSongIndex = (this.currentSongIndex - 1 + (this.recentlyAdded.length + this.topRated.length)) % (this.recentlyAdded.length + this.topRated.length);
      this.currentSong = this.currentSongIndex < this.recentlyAdded.length ? this.recentlyAdded[this.currentSongIndex] : this.topRated[this.currentSongIndex - this.recentlyAdded.length];
    },
    rateSong(songId) {
      // Logic to rate the song
      // You can implement a rating popup or dialog here
    }
  }
}