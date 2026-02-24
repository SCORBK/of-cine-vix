import heroImg from "@/assets/hero-banner.jpg";
import thrillerImg from "@/assets/movie-thriller.jpg";
import romanceImg from "@/assets/movie-romance.jpg";
import scifiImg from "@/assets/movie-scifi.jpg";
import horrorImg from "@/assets/movie-horror.jpg";
import comedyImg from "@/assets/movie-comedy.jpg";
import actionImg from "@/assets/movie-action.jpg";
import animationImg from "@/assets/movie-animation.jpg";

export interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  genre: string;
  duration: string;
  description: string;
  image: string;
}

const allImages = [thrillerImg, romanceImg, scifiImg, horrorImg, comedyImg, actionImg, animationImg];

const movieData: Movie[] = [
  { id: 1, title: "Sombras del Pasado", year: 2024, rating: 8.4, genre: "Thriller", duration: "2h 15min", description: "Un detective retirado debe enfrentar los fantasmas de su pasado cuando un caso sin resolver resurge.", image: thrillerImg },
  { id: 2, title: "Amor en Tiempos Modernos", year: 2024, rating: 7.8, genre: "Romance", duration: "1h 52min", description: "Dos almas se encuentran en la ciudad más grande del mundo y descubren que el destino tiene planes.", image: romanceImg },
  { id: 3, title: "Neón 2099", year: 2025, rating: 9.1, genre: "Ciencia Ficción", duration: "2h 30min", description: "En un futuro cyberpunk, un hacker descubre una conspiración que podría cambiar la humanidad para siempre.", image: scifiImg },
  { id: 4, title: "El Bosque Maldito", year: 2024, rating: 7.5, genre: "Terror", duration: "1h 45min", description: "Un grupo de excursionistas se adentra en un bosque del que nadie ha regresado con vida.", image: horrorImg },
  { id: 5, title: "Locos de Remate", year: 2024, rating: 7.2, genre: "Comedia", duration: "1h 38min", description: "Tres amigos deciden emprender un negocio absurdo que contra todo pronóstico se vuelve viral.", image: comedyImg },
  { id: 6, title: "Furia Extrema", year: 2025, rating: 8.7, genre: "Acción", duration: "2h 10min", description: "Un ex soldado debe rescatar a su familia de un cartel internacional en una carrera contra el tiempo.", image: actionImg },
  { id: 7, title: "Mundo Mágico", year: 2024, rating: 8.3, genre: "Animación", duration: "1h 35min", description: "Una niña descubre un portal a un mundo mágico donde las criaturas fantásticas necesitan su ayuda.", image: animationImg },
  { id: 8, title: "Código Rojo", year: 2025, rating: 8.0, genre: "Acción", duration: "2h 05min", description: "Una agente encubierta descubre un plan terrorista y tiene solo 24 horas para detenerlo.", image: thrillerImg },
  { id: 9, title: "Ecos del Silencio", year: 2024, rating: 8.6, genre: "Drama", duration: "2h 20min", description: "La historia de una familia que debe reconstruirse tras una tragedia que los sacudió.", image: romanceImg },
  { id: 10, title: "Galaxia Perdida", year: 2025, rating: 8.9, genre: "Ciencia Ficción", duration: "2h 45min", description: "Una misión espacial encuentra una civilización antigua en los confines del universo.", image: scifiImg },
  { id: 11, title: "La Última Risa", year: 2024, rating: 7.4, genre: "Comedia", duration: "1h 42min", description: "Un comediante en crisis encuentra inspiración en los lugares más inesperados.", image: comedyImg },
  { id: 12, title: "Pesadilla Infinita", year: 2025, rating: 7.9, genre: "Terror", duration: "1h 50min", description: "Los sueños de una joven empiezan a manifestarse en la realidad de formas terroríficas.", image: horrorImg },
];

export const heroMovie: Movie = {
  id: 0,
  title: "Cenizas de Guerra",
  year: 2025,
  rating: 9.3,
  genre: "Acción / Drama",
  duration: "2h 35min",
  description: "En un mundo devastado por el conflicto, un hombre busca redención mientras lucha por proteger lo que queda de la humanidad. Una épica cinematográfica que redefine el género de acción.",
  image: heroImg,
};

export const categories = [
  { name: "Tendencias", movies: movieData.slice(0, 6) },
  { name: "Acción y Aventura", movies: movieData.filter(m => m.genre === "Acción" || m.genre === "Ciencia Ficción") },
  { name: "Para Reír", movies: movieData.filter(m => m.genre === "Comedia" || m.genre === "Animación") },
  { name: "Suspenso y Terror", movies: movieData.filter(m => m.genre === "Thriller" || m.genre === "Terror") },
  { name: "Romance y Drama", movies: movieData.filter(m => m.genre === "Romance" || m.genre === "Drama") },
];

export default movieData;
