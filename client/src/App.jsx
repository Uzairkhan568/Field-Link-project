import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SearchBar from "./components/SearchBar";
import Services from "./components/Services";

function App() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div>
      <Navbar />
      <Hero />

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <Services searchTerm={searchTerm} />
    </div>
  );
}

export default App;