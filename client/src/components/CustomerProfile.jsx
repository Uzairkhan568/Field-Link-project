import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import "./CustomerProfile.css";

function CustomerProfile() {
    const { user } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);

    const [addressForm, setAddressForm] = useState({
        label: "",
        addressLine: "",
        city: "",
        state: "",
        postalCode: "",
    });

    useEffect(() => {
        async function fetchProfile() {
            try {
                const response = await fetch("/api/users/me", {
                    credentials: "include",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load profile."
                    );
                }

                setProfile(data.user);
                setName(data.user.name || "");
                setEmail(data.user.email || "");
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, []);

    async function updateProfile(event) {
        event.preventDefault();

        setError("");
        setMessage("");

        try {
            const response = await fetch("/api/users/me", {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update profile."
                );
            }

            setProfile(data.user);
            setMessage("Profile updated successfully.");
        } catch (err) {
            setError(err.message);
        }
    }

    function handleAddressChange(event) {
        const { name, value } = event.target;

        setAddressForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function resetAddressForm() {
        setAddressForm({
            label: "",
            addressLine: "",
            city: "",
            state: "",
            postalCode: "",
        });

        setEditingAddressId(null);
        setShowAddressForm(false);
    }

    async function saveAddress(event) {
        event.preventDefault();

        setError("");
        setMessage("");

        const url = editingAddressId
            ? `/api/users/me/addresses/${editingAddressId}`
            : "/api/users/me/addresses";

        const method = editingAddressId ? "PATCH" : "POST";

        try {
            const response = await fetch(url, {
                method,
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(addressForm),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to save address."
                );
            }

            const updatedProfileResponse = await fetch(
                "/api/users/me",
                {
                    credentials: "include",
                }
            );

            const updatedProfile =
                await updatedProfileResponse.json();

            if (!updatedProfileResponse.ok) {
                throw new Error(
                    updatedProfile.message ||
                    "Address saved, but profile could not be refreshed."
                );
            }

            setProfile(updatedProfile.user);
            setMessage(
                editingAddressId
                    ? "Address updated successfully."
                    : "Address added successfully."
            );

            resetAddressForm();
        } catch (err) {
            setError(err.message);
        }
    }

    function startEditingAddress(address) {
        setAddressForm({
            label: address.label || "",
            addressLine: address.addressLine || "",
            city: address.city || "",
            state: address.state || "",
            postalCode: address.postalCode || "",
        });

        setEditingAddressId(address._id);
        setShowAddressForm(true);
        setError("");
        setMessage("");
    }

    async function deleteAddress(addressId) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this address?"
        );

        if (!confirmed) {
            return;
        }

        setError("");
        setMessage("");

        try {
            const response = await fetch(
                `/api/users/me/addresses/${addressId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete address."
                );
            }

            setProfile((current) => ({
                ...current,
                addresses: current.addresses.filter(
                    (address) => address._id !== addressId
                ),
            }));

            setMessage("Address deleted successfully.");
        } catch (err) {
            setError(err.message);
        }
    }

    async function setDefaultAddress(addressId) {
        setError("");
        setMessage("");

        try {
            const response = await fetch(
                `/api/users/me/addresses/${addressId}/default`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update default address."
                );
            }

            setProfile((current) => ({
                ...current,
                addresses: current.addresses.map((address) => ({
                    ...address,
                    isDefault: address._id === addressId,
                })),
            }));

            setMessage("Default address updated.");
        } catch (err) {
            setError(err.message);
        }
    }

    if (loading) {
        return (
            <main className="customer-profile-page">
                <p>Loading profile...</p>
            </main>
        );
    }

    if (!profile) {
        return (
            <main className="customer-profile-page">
                <p className="profile-error">
                    {error || "Unable to load profile."}
                </p>
            </main>
        );
    }

    return (
        <main className="customer-profile-page">
            <div className="customer-profile-container">
                <div className="profile-header">
                    <h1>My Profile</h1>
                    <p>
                        Manage your personal information and saved
                        service addresses.
                    </p>
                </div>

                {error && (
                    <p className="profile-error">
                        {error}
                    </p>
                )}

                {message && (
                    <p className="profile-message">
                        {message}
                    </p>
                )}

                <section className="profile-section">
                    <h2>Personal Information</h2>

                    <form
                        className="profile-form"
                        onSubmit={updateProfile}
                    >
                        <label>
                            Name
                            <input
                                type="text"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                required
                                maxLength={100}
                            />
                        </label>

                        <label>
                            Email
                            <input
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                required
                            />
                        </label>

                        <label>
                            Account type
                            <input
                                type="text"
                                value={profile.role}
                                disabled
                            />
                        </label>

                        <button type="submit">
                            Save Profile
                        </button>
                    </form>
                </section>

                <section className="profile-section">
                    <div className="section-heading">
                        <div>
                            <h2>Saved Addresses</h2>
                            <p>
                                Choose where you want WEFiX services
                                to be performed.
                            </p>
                        </div>

                        {!showAddressForm && (
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddressForm(true);
                                    setEditingAddressId(null);
                                    setError("");
                                    setMessage("");
                                }}
                            >
                                + Add Address
                            </button>
                        )}
                    </div>

                    {showAddressForm && (
                        <form
                            className="address-form"
                            onSubmit={saveAddress}
                        >
                            <h3>
                                {editingAddressId
                                    ? "Edit Address"
                                    : "Add New Address"}
                            </h3>

                            <label>
                                Label
                                <input
                                    type="text"
                                    name="label"
                                    placeholder="Home"
                                    value={addressForm.label}
                                    onChange={handleAddressChange}
                                    required
                                    maxLength={50}
                                />
                            </label>

                            <label>
                                Address
                                <input
                                    type="text"
                                    name="addressLine"
                                    placeholder="House / Flat / Street"
                                    value={addressForm.addressLine}
                                    onChange={handleAddressChange}
                                    required
                                    maxLength={200}
                                />
                            </label>

                            <div className="address-row">
                                <label>
                                    City
                                    <input
                                        type="text"
                                        name="city"
                                        value={addressForm.city}
                                        onChange={handleAddressChange}
                                        required
                                        maxLength={100}
                                    />
                                </label>

                                <label>
                                    State
                                    <input
                                        type="text"
                                        name="state"
                                        value={addressForm.state}
                                        onChange={handleAddressChange}
                                        required
                                        maxLength={100}
                                    />
                                </label>

                                <label>
                                    Postal Code
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={addressForm.postalCode}
                                        onChange={handleAddressChange}
                                        required
                                        maxLength={20}
                                    />
                                </label>
                            </div>

                            <div className="address-form-actions">
                                <button type="submit">
                                    {editingAddressId
                                        ? "Update Address"
                                        : "Save Address"}
                                </button>

                                <button
                                    type="button"
                                    onClick={resetAddressForm}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {profile.addresses.length === 0 ? (
                        <p className="no-addresses">
                            You haven't saved any addresses yet.
                        </p>
                    ) : (
                        <div className="addresses-list">
                            {profile.addresses.map((address) => (
                                <div
                                    key={address._id}
                                    className={`address-card ${address.isDefault
                                            ? "default-address"
                                            : ""
                                        }`}
                                >
                                    <div className="address-card-header">
                                        <h3>{address.label}</h3>

                                        {address.isDefault && (
                                            <span className="default-badge">
                                                Default
                                            </span>
                                        )}
                                    </div>

                                    <p>{address.addressLine}</p>
                                    <p>
                                        {address.city},{" "}
                                        {address.state}
                                    </p>
                                    <p>
                                        {address.postalCode}
                                    </p>

                                    <div className="address-actions">
                                        {!address.isDefault && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDefaultAddress(
                                                        address._id
                                                    )
                                                }
                                            >
                                                Set as default
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                startEditingAddress(
                                                    address
                                                )
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                deleteAddress(
                                                    address._id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

export default CustomerProfile;