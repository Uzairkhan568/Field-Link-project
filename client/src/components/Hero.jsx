import "./Hero.css";
import SearchBar from "./SearchBar";

function Hero({ searchTerm, setSearchTerm }) {
    return (
        <section>
            <h1>Find the right service, right when you need it.</h1>
            <p>
                Connect with trusted local service professionals.
            </p>

            <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />
        </section>
    );
}

export default Hero;