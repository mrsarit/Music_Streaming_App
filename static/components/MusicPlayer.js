export default{
    template: `   <div>
    <h1>Play Song</h1>
    <button @click="playSong">Play</button>
    <audio ref="audioPlayer" controls @error="handleError">
      <source :src="songUrl" type="audio/mpeg">
      Your browser does not support the audio element.
    </audio>
    <div v-if="error">{{ error }}</div>
  </div>
    `,
    data() {
        return {
          songId: this.$route.params.id,
          songUrl: '',
          error: null
        };
      },
      methods: {
        async fetchSongUrl() {
          try {
            const response = await fetch(`/api/play_song/${this.songId}`, {
              headers: {
                'Authentication-token': localStorage.getItem('auth-token')
              }
            });
            if (response.ok) {
            //   const blob = await response.blob();
            //   this.songUrl = URL.createObjectURL(blob);
            this.songUrl = response.url
            } else {
              throw new Error('Failed to fetch audio');
            }
          } catch (error) {
            this.error = error.message;
          }
        },
        playSong() {
          const audio = this.$refs.audioPlayer;
          console.log(this.songId)
          console.log(this.songUrl)
          console.log(this.audio)
          audio.play().catch((error) => {
            this.error = 'Failed to play audio';
          });
        },
        handleError(event) {
          this.error = 'Failed to load audio';
        }
      },
      async created() {
        await this.fetchSongUrl();
      }
}