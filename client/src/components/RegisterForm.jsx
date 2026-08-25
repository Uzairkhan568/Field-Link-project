import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import "./AuthForm.css";

function RegisterForm() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await register({ name, email, password });
            navigate("/");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="auth-page">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h1>Create your account</h1>
                <p>Customer accounts are ready for future booking management.</p>
                <label>
                    Name
                    <input type="text" value={name} onChange={(event) => setName(event.target.value)} required />
                </label>
                <label>
                    Email
                    <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                </label>
                <label>
                    Password
                    <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength="8" required />
                </label>
                {error && <p className="auth-error" role="alert">{error}</p>}
                <button disabled={submitting} type="submit">
                    {submitting ? "Creating account..." : "Create account"}
                </button>
                <p>Already have an account? <Link to="/login">Log in</Link>.</p>
            </form>
        </main>
    );
}

export default RegisterForm;
