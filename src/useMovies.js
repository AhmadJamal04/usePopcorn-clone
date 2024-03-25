import { useEffect, useState } from "react";

export function useMovies(query,callBack){
    const ApiKey = "7fafd120";
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(null);
    const [error, setError] = useState("");
    useEffect(() => {
        callBack?.()
        const controller = new AbortController();
        setIsLoading(true);
        setError("");
        if (!query.length > 0) {
          setMovies([]);
          setIsLoading(false);
          return;
        }
        fetch(`http://www.omdbapi.com/?apikey=${ApiKey}&s=${query}`, {
          signal: controller.signal,
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error("Failed to fetch data");
            }
    
            return res.json();
          })
          .then((data) => {
            if (data.Response === "False") {
              throw new Error("movies not found");
            }
    
            setMovies(data.Search);
       
            setError("");
          })
          .catch((err) => {
            console.log(err);
            if (err.name !== "AbortError") {
              setError(err.message);
            }
          })
          .finally(() => {
            setIsLoading(false);
          });
        return () => {
          controller.abort();
        };
      }, [query]);
      return {movies,error,isLoading}
}