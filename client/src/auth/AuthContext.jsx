import { useEffect, useMemo, useState } from "react";
import {
    getCurrentUser,
    loginUser,
    logoutUser,
    registerUser,
} from "../api/authApi";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function restoreSession() {
            try {
                const data = await getCurrentUser();
                setUser(data.user);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        restoreSession();
    }, []);

    const value = useMemo(() => ({
        user,
        loading,
        async login(credentials) {
            const data = await loginUser(credentials);
            setUser(data.user);
            return data.user;
        },
        async register(credentials) {
            const data = await registerUser(credentials);
            setUser(data.user);
            return data.user;
        },
        async logout() {
            await logoutUser();
            setUser(null);
        },
    }), [loading, user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
