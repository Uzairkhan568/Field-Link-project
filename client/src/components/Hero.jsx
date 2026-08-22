import "./Hero.css";
import SearchBar from "./SearchBar";

function Hero({ searchTerm, setSearchTerm }) {
    return (
        <section>
            <h1>Find the right service, right where you need it.</h1>
            <p>
                Connect with trusted local field-service providers.
            </p>

            <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />
        </section>
    );
}

export default Hero;