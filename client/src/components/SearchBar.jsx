import "./SearchBar.css";

function SearchBar({ searchTerm, setSearchTerm }) {
    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Search for a service..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
            />
        </div>
    );
}

export default SearchBar;
