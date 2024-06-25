const apiKey = "a30b7a37a0066a2632d9b0684c0605b7";
const apiEndpoints = "https://api.themoviedb.org/3";
const imgPath = "https://image.tmdb.org/t/p/original";
const ytKey = "AIzaSyAT7LhhnPL9bpvKJ0oVPt6Pg3ChUjpZpeg";
const ytPath = "https://www.youtube.com/watch?v=";

const apiPaths = {
    fetchAllCategories: `${apiEndpoints}/genre/movie/list?api_key=${apiKey}`,
    fetchMoviesList: (id) => `${apiEndpoints}/discover/movie?api_key=${apiKey}&with_genres=${id}`,
    fetchTrending: `${apiEndpoints}/trending/all/day?api_key=${apiKey}&language=en-US`,
    searchOnYoutube: (query) => `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${ytKey}`
}

function init() {
    fetchTrendingMovies();
    fetchAndBuildAllSections();
}

function fetchTrendingMovies() {
    fetchAndBuildMovieSection(apiPaths.fetchTrending, 'Trending Now')
    .then(list => {
        const randomIndex = parseInt(Math.random() * list.length);
        buildBannerSection(list[randomIndex]);
    })
    .catch(error => console.error(error));
}

function buildBannerSection(movie) {
    const bannerCont = document.getElementById("banner-section");
    bannerCont.style.backgroundImage = `url('${imgPath}${movie.backdrop_path}')`;

    const div = document.createElement("div");
    div.className = "banner-content";
    div.innerHTML =  `
                    <h2 class="banner-title">${movie.title || movie.name}</h2>
                    <p class="banner-info">Now Streaming</p>
                    <p class="banner-overview">${movie.overview && movie.overview.length > 200 ? movie.overview.slice(0, 250).trim() + "..." : movie.overview}</p>
                    <div class="action-btn-container">
                        <button class="action-button"><i class="fa fa-play"></i> &nbsp; Play</button>
                        <button class="action-button"><i class="fa fa-info-circle"></i> &nbsp; More Info</button>
                    </div>
    `;
    bannerCont.append(div);
}

function fetchAndBuildAllSections() {
    fetch(apiPaths.fetchAllCategories)
    .then(response => response.json())
    .then(response => {
        const categories = response.genres;
        if (Array.isArray(categories) && categories.length) {
            categories.forEach(category => {
                fetchAndBuildMovieSection(apiPaths.fetchMoviesList(category.id), category.name);
            });
        }
    })
    .catch(error => console.error(error));
}

function fetchAndBuildMovieSection(fetchUrl, categoryName) {
    return fetch(fetchUrl)
    .then(response => response.json())
    .then(response => {
        const movies = response.results;
        if (Array.isArray(movies) && movies.length) {
            buildMoviesSection(movies, categoryName);
        }
        return movies;
    })
    .catch(error => console.error(error));
}

function buildMoviesSection(list, categoryName) {
    const moviesCont = document.getElementById("movies-cont");

    const moviesListHTML = list.map(item => {
        return `
            <div class="image-container">
                <img class="movie-item" src="${imgPath}${item.backdrop_path}" onclick="searchMovieTrailer('${item.title || item.name}')">   
            </div>     
        `;
    }).join('');

    const moviesSectionHTML = `
        <h2 class="movie-section-heading">${categoryName} <span class="explore-nudge">Explore All &gt;</span></h2>
        <div class="movies-row">
            ${moviesListHTML}
        </div>
    `

    const div = document.createElement("div");
    div.className = "movies-section";
    div.innerHTML = moviesSectionHTML;

    moviesCont.append(div);
}

function searchMovieTrailer(movieName) {
    if (!movieName) {
        return;
    }

    fetch(apiPaths.searchOnYoutube(movieName))
    .then(response => response.json())
    .then(response => {
        const bestResult = response.items[0];
        const youtubeURL = `${ytPath}${bestResult.id.videoId}`;
        
    })
    .catch((error) => console.error(error));
}

window.addEventListener("load", function() {
    init();
    window.addEventListener('scroll', function() {
        const header = document.querySelector(".header");
        if (window.scrollY > 5) {
            header.classList.add("black-bg");
        } else {
            header.classList.remove("black-bg");
        }
    })
})