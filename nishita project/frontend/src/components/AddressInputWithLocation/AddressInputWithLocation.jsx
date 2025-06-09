import React, { useState } from 'react';

const AddressInputWithLocation = ({ onAddressChange, onLocationChange }) => {
  const [address, setAddress] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState('');

  // Placeholder for reverse geocoding (replace with real API call if needed)
  const reverseGeocode = async (lat, lng) => {
    // For demo: just return "Lat: xx, Lng: yy"
    return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setAddress(val);
    onAddressChange(val);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoadingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const addr = await reverseGeocode(latitude, longitude);

        setAddress(addr);
        onAddressChange(addr);
        onLocationChange({ latitude, longitude });

        setLoadingLocation(false);
      },
      (err) => {
        setError('Unable to retrieve your location.');
        setLoadingLocation(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="address-input">
      <input
        type="text"
        value={address}
        onChange={handleInputChange}
        placeholder="Enter your address"
        className="address-textbox"
      />
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={loadingLocation}
        className="location-btn"
      >
        {loadingLocation ? 'Fetching location...' : 'Use Current Location'}
      </button>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
};

export default AddressInputWithLocation;
