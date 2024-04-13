export default{
    template: `<div class="col-md-6">
    <div class="mb-3 p-5 bg-light">
      <div v-if="title">Title: {{ title }}</div>
      <div v-if="creator">Creator: {{ creator }}</div>
      <div v-if="lyrics">Lyrics: {{ lyrics }}</div>
      <div v-if="average_rating">Average Rating: {{ average_rating }}</div>
      <audio ref="audioPlayer" controls></audio>
      <div>
        <button @click="playPrevious">Previous</button>
        <button @click="playNext">Next</button>
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
    </div>
  </div>`,
  props: {
    title: String,
    creator: String,
    lyrics: String,
    average_rating: Number,
    song_id: Number
  },
  data() {
    return {
      selectedRating: null
    };
  },
  methods: {
    playNext() {
      // Emit an event to play the next song
      this.$emit('play-next');
    },
    playPrevious() {
      // Emit an event to play the previous song
      this.$emit('play-previous');
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
          this.$emit('rating-updated');
        } else {
          throw new Error('Failed to rate song');
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
}