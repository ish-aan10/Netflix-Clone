const apiKey = "a30b7a37a0066a2632d9b0684c0605b7";
const apiEndpoints = "https://api.themoviedb.org/3";
const imgPath = "https://image.tmdb.org/t/p/original";
const ytKey = "AIzaSyAT7LhhnPL9bpvKJ0oVPt6Pg3ChUjpZpeg";
const ytPath = "https://www.youtube.com/embed/";

const genres = [
    {"id": 28, "name": "Action"},
    {"id": 12, "name": "Adventure"},
    {"id": 16, "name": "Animation"}, 
    {"id": 35, "name": "Comedy"}, 
    {"id": 80, "name": "Crime"}, 
    {"id": 99, "name": "Documentary"}, 
    {"id": 18, "name": "Drama"}, 
    {"id": 10751, "name": "Family"}, 
    {"id": 14, "name": "Fantasy"}, 
    {"id": 36, "name": "History"}, 
    {"id": 27, "name": "Horror"}, 
    {"id": 10402, "name": "Music"}, 
    {"id": 9648, "name": "Mystery"}, 
    {"id": 10749, "name": "Romance"}, 
    {"id": 878, "name": "Science Fiction"}, 
    {"id": 10770, "name": "TV Movie"}, 
    {"id": 53, "name": "Thriller"}, 
    {"id": 10752, "name": "War"}, 
    {"id": 37, "name": "Western"}];

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
        console.log(list);
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

function getGenreNames(genreIds) {
    return genreIds.map(id => {
        const genre = genres.find(gen => gen.id === id);
        return genre ? genre.name  : undefined;
    }).filter(name => name !== null);
}

function buildMoviesSection(list, categoryName) {
    const moviesCont = document.getElementById("movies-cont");

    const moviesListHTML = list.map(item => {
        if (item.backdrop_path) {
            const genreNames = getGenreNames(item.genre_ids).join('&nbsp;&#9679; ');
            return `
                    <div class="image-container">
                        <img class="movie-item" src="${imgPath}${item.backdrop_path}" onmouseover="searchMovieTrailer('${item.title || item.name}','yt${item.id}')">   
                        <div class="iframe-wrap" id="yt${item.id}"></div>
                        <div class="pop-win">    
                            <div class="innerContainer">
                                <div class="rowOne">
                                    <div>
                                        <i class="fa fa-play"></i>
                                        <i class="fa fa-plus"></i>
                                        <i class="fa fa-thumbs-up"></i>
                                    </div>
                                    <div>
                                        <i class="fa fa-angle-down"></i>
                                    </div>
                                </div>
                                <div class="innerInfo">${item.name || item.title}</div>
                                <div class="innerGenre">${genreNames}</div>
                            </div>
                        </div>
                    </div>
                    `;
        }
    }).join('');

    const moviesSectionHTML = `
        <h2 class="movie-section-heading">${categoryName} <span class="explore-nudge">Explore All &gt;</span></h2>
        <div class="movies-row">
            ${moviesListHTML}
        </div>
    `;

    const div = document.createElement("div");
    div.className = "movies-section";
    div.innerHTML = moviesSectionHTML;

    moviesCont.append(div);
}

function searchMovieTrailer(movieName, iframeId) {
    if (!movieName) {
        return;
    }

    fetch(apiPaths.searchOnYoutube(movieName))
    .then(response => response.json())
    .then(response => {
        console.log(response);
        const bestResult = response.items[0];
        const youtubeURL = `${ytPath}${bestResult.id.videoId}?controls=0`;

        const elements = document.getElementById(iframeId);
        const div = document.createElement("div");
        div.innerHTML = `<iframe src="${youtubeURL}"></iframe>`;

        elements.append(div);        
    })
    .catch(error => console.log(error));
}

window.addEventListener("load", function() {
    init();
    window.addEventListener('scroll', function() {
        const header = document.getElementById("header");
        if (window.scrollY > 5) {
            header.classList.add("black-bg");
        } else {
            header.classList.remove("black-bg");
        }
    })
})