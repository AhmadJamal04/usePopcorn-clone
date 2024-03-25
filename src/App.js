import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";
const ApiKey = "7fafd120";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

// using local storage to store watched movies data
export default function App() {
  const [query, setQuery] = useState("");

  const [watched, setWatched] = useLocalStorageState([], "watched");

  const [selectedId, setSelectedId] = useState(null);

  function handleSelect(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }
  function handleClose() {
    setSelectedId(null);
  }
  function handleWachedMOvie(movie) {
    setWatched((watched) => [...watched, movie]);
  }
  function handleDelete(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
    console.log(watched);
  }

  const { movies, error, isLoading } = useMovies(query, handleClose);

  return (
    <>
      <Navbar>
        <div className="logo">
          <span role="img">🍿</span>
          <h1>usePopcorn</h1>
        </div>
        <Search query={query} setQuery={setQuery} />
        {movies.length ? (
          <p className="num-results">
            Found <strong>{movies.length}</strong> results
          </p>
        ) : (
          <p className="num-results">
            Found <strong>0</strong> results
          </p>
        )}
      </Navbar>

      <Main>
        <Box
          elemenet={
            isLoading ? (
              <Loading />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : (
              <MovieList movies={movies} handleSelect={handleSelect} />
            )
          }
        />

        <Box
          elemenet={
            selectedId ? (
              <MovieDetails
                watched={watched}
                onAddWatchedMovie={handleWachedMOvie}
                onCloseMovie={handleClose}
                selectedId={selectedId}
              />
            ) : (
              <>
                <WatchedSummary watched={watched} />
                <WachedList watched={watched} onDelete={handleDelete} />
              </>
            )
          }
        />
      </Main>
    </>
  );
}
function Loading() {
  return <p className="loader">Loading....</p>;
}
function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⚠️</span> {message}
    </p>
  );
}

function Navbar({ children }) {
  return <div className="nav-bar">{children}</div>;
}

function Main({ children }) {
  return <div className="main">{children}</div>;
}

function Box({ elemenet }) {
  const [isOpen, setisOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setisOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && elemenet}
    </div>
  );
}

function MovieList({ movies, handleSelect }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={handleSelect} />
      ))}
    </ul>
  );
}
function Movie({ movie, onSelectMovie }) {
  return (
    <li key={movie.imdbID} onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({
  selectedId,
  onCloseMovie,
  onAddWatchedMovie,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);

  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actor,
    Director: director,
    Genre: genre,
  } = movie;

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${ApiKey}&i=${selectedId}`
        );
        const data = await res.json();

        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );
  useEffect(() => {
    if (!title) return;
    document.title = `movie|${title}`;

    return () => {
      document.title = "usePopcorn";
    };
  }, [title]);

  function handleAdd() {
    const newWatchedMOvie = {
      imdbID: selectedId,

      year,
      title,
      runtime: Number(runtime.split(" ").at(0)),
      poster,
      imdbRating: Number(imdbRating),
      userRating,
    };
    onAddWatchedMovie(newWatchedMOvie);
    onCloseMovie();
  }
useKey("Escape",onCloseMovie);
  
  return (
    <div className="details">
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt="" />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released}&bull;{runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating}rating
              </p>
            </div>
          </header>
          <section>
            {" "}
            <div className="rating">
              {!isWatched ? (
                <>
                  {" "}
                  <StarRating
                    maxRating={10}
                    size={20}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + add to wachlist
                    </button>
                  )}
                </>
              ) : (
                <p>you rated this movie {watchedUserRating} ⭐</p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actor}</p>
            <p>Director {director}</p>
          </section>
        </>
      )}
    </div>
  );
}
function WachedList({ watched, onDelete }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} onDelete={onDelete} />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, onDelete }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={() => onDelete(movie.imdbID)}>
          X
        </button>
      </div>
    </li>
  );
}
function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
function Search({ query, setQuery }) {
  const inputEl = useRef(null);
  useKey("enter",()=>{
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  })
  

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      ref={inputEl}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
