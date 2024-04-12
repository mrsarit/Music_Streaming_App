export default{
    template: `  <div>
    <h1>Song List</h1>
    <ul>
      <li v-for="song in songs" :key="song.id">
        {{ song.name }} <button @click="playSong(song.id)">Load</button>
      </li>
    </ul>
    <audio ref="audioPlayer" controls></audio>
  </div>`,
  data() {
    return {
      songs: [],
      audioPlayer: null
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
            'Authentication-token': localStorage.getItem('auth-token')
          }
        });
        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          this.audioPlayer = this.$refs.audioPlayer;
          this.audioPlayer.src = audioUrl;
          this.audioPlayer.play();
        } else {
          throw new Error('Failed to play song');
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