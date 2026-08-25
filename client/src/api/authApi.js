async function request(path, options = {}) {
    const response = await fetch(path, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong. Please try again.");
    }

    return data;
}

export function registerUser(credentials) {
    return request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(credentials),
    });
}

export function loginUser(credentials) {
    return request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
    });
}

export function logoutUser() {
    return request("/api/auth/logout", { method: "POST" });
}

export function getCurrentUser() {
    return request("/api/auth/me");
}
