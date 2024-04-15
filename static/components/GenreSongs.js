export default{
    template: `<div>
    <div class="row">
          <div class="col-md-6">
    <h1>{{ albumName }}</h1>
    <ul>
      <li v-for="song in songs" :key="song.id">
        {{ song.name }} - {{ song.artist }} <button @click="playSong(song.id)">Play</button>
      </li>
    </ul>
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
  </div>`,
  data() {
    return {
      albumName: '',
      songs: [],
      audioPlayer: null,
      title: null,
      creator: null,
      lyrics: null,
      album: null,
      average_rating: null,
      song_id: null,
      artist: null,
      genre: null,
      lang: null
    };
  },
  created() {
    this.fetchAlbumSongs();
  },
  methods: {
    async fetchAlbumSongs() {
      try {
        const response = await fetch(`/api/genre_songs/${this.$route.params.genreId}`, {
          headers: {
            'Authentication-Token': localStorage.getItem('auth-token')
          }
        });
        if (response.ok) {
          const data = await response.json();
          this.albumName = data.albumName;
          this.songs = data.songs;
        } else {
          throw new Error('Failed to fetch album songs');
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
}