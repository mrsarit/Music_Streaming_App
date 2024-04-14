export default {
    template: `<div>
    <div class="row">
    <div class="col-md-4">
    <h1>Genres</h1>
    <ul>
        <li v-for="genre in genres" :key="genre.id">
            {{ genre.name }}
            <button @click="deleteGenre(genre.id)">Delete</button>
        </li>
    </ul>
    <input type="text" v-model="newGenreName" placeholder="Enter genre name">
    <button @click="addGenre">Add Genre</button>
    </div>
    <div class="col-md-4">
    <h1>Artist</h1>
    <ul>
        <li v-for="artist in artists" :key="artist.id">
            {{ artist.name }}
            <button @click="deleteArtist(artist.id)">Delete</button>
        </li>
    </ul>
    <input type="text" v-model="newArtistName" placeholder="Enter Artist name">
    <button @click="addArtist">Add Artist</button>
    </div>
    <div class="col-md-4">
    <h1>Language</h1>
    <ul>
        <li v-for="language in languages" :key="language.id">
            {{ language.name }}
            <button @click="deleteLanguage(language.id)">Delete</button>
        </li>
    </ul>
    <input type="text" v-model="newLanguageName" placeholder="Enter Language">
    <button @click="addLanguage">Add Language</button>
    </div>
    </div>
    </div>`,
    data() {
        return {
        genres: [],
        newGenreName: null,
        artists: [],
        newArtistName: null,
        languages: [],
        newLanguageName: null
    }},
    mounted() {
        this.fetchGenres();
        this.fetchArtists();
        this.fetchLanguages();
    },
    methods: {
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
                throw new Error('Failed to fetch songs');
              }
            } catch (error) {
              console.error(error);
            }
          },
        async addGenre() {
            try {
                const res = await fetch('/create-genre',{
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authentication-Token': localStorage.getItem('auth-token')
                    },
                    body: JSON.stringify(this.newGenreName),
                  } )
              if (res.ok) {
                this.$router.go(0)
                alert('Genre created successfully');
              } else {
                throw new Error('Failed to fetch songs');
              }
            } catch (error) {
              console.error(error);
            }
          },
          async deleteGenre(genreId) {
            try {
                const res = await fetch(`/genre/${genreId}`,{
                    method: 'DELETE',
                    headers: {
                      'Authentication-Token': localStorage.getItem('auth-token')
                    },
                  } )
              if (res.ok) {
                this.$router.go(0)
                alert('Genre deleted successfully');
              } else {
                throw new Error('Failed to fetch songs');
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
                throw new Error('Failed to fetch artists');
              }
            } catch (error) {
              console.error(error);
            }
          },
        async addArtist() {
            try {
                const res = await fetch('/add-artist',{
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authentication-Token': localStorage.getItem('auth-token')
                    },
                    body: JSON.stringify(this.newArtistName),
                  } )
              if (res.ok) {
                this.$router.go(0)
                alert('New Artist added successfully');
              } else {
                throw new Error('Failed to fetch Artist');
              }
            } catch (error) {
              console.error(error);
            }
          },
          async deleteArtist(artistId) {
            try {
                const res = await fetch(`/artist/${artistId}`,{
                    method: 'DELETE',
                    headers: {
                      'Authentication-Token': localStorage.getItem('auth-token')
                    },
                  } )
              if (res.ok) {
                this.$router.go(0)
                alert('Artist deleted successfully');
              } else {
                throw new Error('Failed to fetch songs');
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
                throw new Error('Failed to fetch languages');
              }
            } catch (error) {
              console.error(error);
            }
          },
        async addLanguage() {
            try {
                const res = await fetch('/add-language',{
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authentication-Token': localStorage.getItem('auth-token')
                    },
                    body: JSON.stringify(this.newLanguageName),
                  } )
              if (res.ok) {
                this.$router.go(0)
                alert('Language added successfully');
              } else {
                throw new Error('Failed to fetch Languages');
              }
            } catch (error) {
              console.error(error);
            }
          },
          async deleteLanguage(languageId) {
            try {
                const res = await fetch(`/language/${languageId}`,{
                    method: 'DELETE',
                    headers: {
                      'Authentication-Token': localStorage.getItem('auth-token')
                    },
                  } )
              if (res.ok) {
                this.$router.go(0)
                alert('Language deleted successfully');
              } else {
                throw new Error('Failed to fetch songs');
              }
            } catch (error) {
              console.error(error);
            }
          },
    }
}