import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import "./BookingForm.css";

function BookingForm({ service, onDone }) {
    const { user } = useAuth();

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [useCustomAddress, setUseCustomAddress] = useState(false);

    const [addressLine, setAddressLine] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [postalCode, setPostalCode] = useState("");

    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function fetchAddresses() {
            if (!user) {
                setLoadingAddresses(false);
                return;
            }

            try {
                const response = await fetch("/api/users/me", {
                    credentials: "include",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load saved addresses."
                    );
                }

                const savedAddresses = data.user.addresses || [];

                setAddresses(savedAddresses);

                const defaultAddress = savedAddresses.find(
                    (address) => address.isDefault
                );

                if (defaultAddress) {
                    selectSavedAddress(defaultAddress, savedAddresses);
                } else if (savedAddresses.length > 0) {
                    selectSavedAddress(savedAddresses[0], savedAddresses);
                } else {
                    setUseCustomAddress(true);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoadingAddresses(false);
            }
        }

        fetchAddresses();
    }, [user]);

    function selectSavedAddress(address, savedAddresses = addresses) {
        setSelectedAddressId(address._id);
        setUseCustomAddress(false);

        setAddressLine(address.addressLine || "");
        setCity(address.city || "");
        setState(address.state || "");
        setPostalCode(address.postalCode || "");

        if (savedAddresses.length > 0) {
            setAddresses(savedAddresses);
        }
    }

    function handleAddressSelection(event) {
        const value = event.target.value;

        if (value === "custom") {
            setSelectedAddressId("");
            setUseCustomAddress(true);

            setAddressLine("");
            setCity("");
            setState("");
            setPostalCode("");

            return;
        }

        const selectedAddress = addresses.find(
            (address) => address._id === value
        );

        if (selectedAddress) {
            selectSavedAddress(selectedAddress);
        }
    }

    function validateDateTime() {
        if (!date || !time) {
            setError("Please select a date and time.");
            return false;
        }

        const bookingDateTime = new Date(`${date}T${time}`);

        if (isNaN(bookingDateTime.getTime())) {
            setError("Invalid booking date or time.");
            return false;
        }

        const now = new Date();

        if (bookingDateTime.getTime() < now.getTime()) {
            setError("Appointments cannot be in the past.");
            return false;
        }

        const timezone =
            Intl.DateTimeFormat().resolvedOptions().timeZone;

        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });

        const nowLocalStr = formatter.format(now);
        const scheduledLocalStr = formatter.format(bookingDateTime);

        if (nowLocalStr === scheduledLocalStr) {
            const oneHourFromNow =
                now.getTime() + 60 * 60 * 1000;

            if (
                bookingDateTime.getTime() < oneHourFromNow
            ) {
                setError(
                    "Same-day appointments require at least 1 hour of advance notice."
                );
                return false;
            }
        }

        return true;
    }

    function validateAddress() {
        if (
            !addressLine.trim() ||
            !city.trim() ||
            !state.trim() ||
            !postalCode.trim()
        ) {
            setError("Please provide a complete service address.");
            return false;
        }

        return true;
    }

    async function handleSubmit() {
        if (submitting || submitted) {
            return;
        }

        setError("");

        if (!validateDateTime()) {
            return;
        }

        if (!validateAddress()) {
            return;
        }

        const bookingDateTime = new Date(`${date}T${time}`);

        const timezone =
            Intl.DateTimeFormat().resolvedOptions().timeZone;

        setSubmitting(true);

        try {
            const response = await fetch("/api/bookings", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    serviceId: service.id,
                    scheduledAt: bookingDateTime.toISOString(),
                    timezone,
                    address: {
                        addressLine: addressLine.trim(),
                        city: city.trim(),
                        state: state.trim(),
                        postalCode: postalCode.trim(),
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message || "Unable to create booking."
                );
                setSubmitting(false);
                return;
            }

            setSubmitted(true);
            setSubmitting(false);
        } catch (error) {
            setError("Unable to connect to the server.");
            setSubmitting(false);
        }
    }

    if (!user) {
        return (
            <section className="booking-form">
                <div className="booking-confirmation">
                    <h3>Authentication Required</h3>
                    <p>
                        Please log in or register to book a service.
                    </p>
                    <button onClick={onDone}>
                        Close
                    </button>
                </div>
            </section>
        );
    }

    if (submitted) {
        return (
            <section className="booking-form">
                <div className="booking-confirmation">
                    <h3>Booking Confirmed</h3>

                    <p>Service: {service.name}</p>
                    <p>Date: {date}</p>
                    <p>Time: {time}</p>

                    <p>
                        Location: {addressLine}, {city},{" "}
                        {state} {postalCode}
                    </p>

                    <p>
                        Your booking request has been submitted
                        successfully.
                    </p>

                    <button onClick={onDone}>
                        Done
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="booking-form">
            <h2>Book {service.name}</h2>

            <label>
                Preferred Date
                <input
                    type="date"
                    min={
                        new Date()
                            .toISOString()
                            .split("T")[0]
                    }
                    value={date}
                    onChange={(event) =>
                        setDate(event.target.value)
                    }
                />
            </label>

            <label>
                Preferred Time
                <input
                    type="time"
                    value={time}
                    onChange={(event) =>
                        setTime(event.target.value)
                    }
                />
            </label>

            <label>
                Service Address
                {loadingAddresses ? (
                    <p>Loading saved addresses...</p>
                ) : addresses.length > 0 ? (
                    <select
                        value={
                            useCustomAddress
                                ? "custom"
                                : selectedAddressId
                        }
                        onChange={handleAddressSelection}
                    >
                        {addresses.map((address) => (
                            <option
                                key={address._id}
                                value={address._id}
                            >
                                {address.label}
                                {address.isDefault
                                    ? " (Default)"
                                    : ""}
                            </option>
                        ))}

                        <option value="custom">
                            Use a different address
                        </option>
                    </select>
                ) : (
                    <p>
                        You don't have any saved addresses.
                        Enter your service address below.
                    </p>
                )}
            </label>

            {useCustomAddress && (
                <>
                    <label>
                        Address Line
                        <input
                            type="text"
                            value={addressLine}
                            onChange={(event) =>
                                setAddressLine(event.target.value)
                            }
                            placeholder="123 Main St"
                        />
                    </label>

                    <div className="booking-address-row">
                        <label>
                            City
                            <input
                                type="text"
                                value={city}
                                onChange={(event) =>
                                    setCity(event.target.value)
                                }
                                placeholder="City"
                            />
                        </label>

                        <label>
                            State
                            <input
                                type="text"
                                value={state}
                                onChange={(event) =>
                                    setState(event.target.value)
                                }
                                placeholder="State"
                            />
                        </label>

                        <label>
                            Postal Code
                            <input
                                type="text"
                                value={postalCode}
                                onChange={(event) =>
                                    setPostalCode(event.target.value)
                                }
                                placeholder="Zip"
                            />
                        </label>
                    </div>
                </>
            )}

            {!useCustomAddress && selectedAddressId && (
                <div className="selected-address">
                    {(() => {
                        const address = addresses.find(
                            (item) =>
                                item._id === selectedAddressId
                        );

                        if (!address) {
                            return null;
                        }

                        return (
                            <>
                                <strong>{address.label}</strong>

                                <p>{address.addressLine}</p>

                                <p>
                                    {address.city},{" "}
                                    {address.state}{" "}
                                    {address.postalCode}
                                </p>
                            </>
                        );
                    })()}
                </div>
            )}

            {error && <p>{error}</p>}

            <button
                disabled={
                    submitting || loadingAddresses
                }
                onClick={handleSubmit}
            >
                {submitting
                    ? "Submitting..."
                    : "Continue"}
            </button>
        </section>
    );
}

export default BookingForm;