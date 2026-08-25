import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

function Navbar() {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate("/");
    }

    return (
        <nav>
            <h2><Link to="/">WEFiX</Link></h2>

            <div className="nav-links">
                <Link to="/">Home</Link>
                <a href="/#services">Services</a>
                {!loading && (user ? (
                    <>
                        <span className="nav-user">Hi, {user.name}</span>
                        <button type="button" onClick={handleLogout}>Log out</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Log in</Link>
                        <Link to="/register">Create account</Link>
                    </>
                ))}
            </div>
        </nav>
    );
}

export default Navbar;
