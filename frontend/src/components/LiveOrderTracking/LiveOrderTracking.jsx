// LiveOrderTracking.jsx

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import getDistanceFromLatLonInKm from '../../context/shared/utils/distance'; // ✅ Correct

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Restaurant location (I-Space IT Park, Bavdhan, Pune)
const defaultSourceLocation = {
  lat: 18.5205,
  lon: 73.8148,
  displayName: "I-Space IT Park, Bavdhan, Pune",
};

const LiveOrderTracking = () => {
  const [useBrowserLocation, setUseBrowserLocation] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [sourceLocation, setSourceLocation] = useState(null);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [extraCharges, setExtraCharges] = useState(0);
  const [assignedBoy, setAssignedBoy] = useState(null);
  const [deliveryBoys, setDeliveryBoys] = useState([]);

  const getBrowserLocation = () =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          resolve({
            lat: latitude,
            lon: longitude,
            displayName: "Your Current Location",
          });
        },
        (err) => reject(new Error("Failed to fetch current location."))
      );
    });

  const calculateDelivery = (sourceLoc, destLoc) => {
    const dist = getDistanceFromLatLonInKm(
      sourceLoc.lat,
      sourceLoc.lon,
      destLoc.lat,
      destLoc.lon
    );
    const timeMinutes = (dist / 30) * 60;

    let charges = 0;
    if (dist > 4) charges = 100;

    setDistance(dist.toFixed(2));
    setEstimatedTime(timeMinutes.toFixed(0));
    setExtraCharges(charges);
  };

  useEffect(() => {
    const fetchDeliveryBoys = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/deliveryboys");
        if (Array.isArray(res.data)) {
          setDeliveryBoys(res.data);
        } else if (res.data?.data && Array.isArray(res.data.data)) {
          setDeliveryBoys(res.data.data);
        } else {
          setDeliveryBoys([]);
        }
      } catch {
        setDeliveryBoys([]);
      }
    };

    fetchDeliveryBoys();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setSourceLocation(defaultSourceLocation);

        let destLoc = null;
        if (useBrowserLocation) {
          destLoc = await getBrowserLocation();
        }

        if (!destLoc) {
          setError("User location not available.");
          return;
        }

        setUserLocation(destLoc);
        calculateDelivery(defaultSourceLocation, destLoc);

        if (deliveryBoys.length > 0) {
          const randomIndex = Math.floor(Math.random() * deliveryBoys.length);
          setAssignedBoy(deliveryBoys[randomIndex]);
        } else {
          setAssignedBoy(null);
        }

        setError(null);
      } catch (err) {
        setError(err.message);
        setDistance(null);
        setEstimatedTime(null);
        setExtraCharges(0);
        setAssignedBoy(null);
      }
    })();
  }, [useBrowserLocation, deliveryBoys]);

  return (
    <div
      style={{
        backgroundColor: "#111",
        color: "white",
        padding: "15px",
        borderRadius: "8px",
        maxWidth: "700px",
        margin: "0 auto",
      }}
    >
      <h2>Live Order Tracking</h2>

      <label style={{ display: "block", marginBottom: "10px" }}>
        <input
          type="checkbox"
          checked={useBrowserLocation}
          onChange={() => setUseBrowserLocation(!useBrowserLocation)}
        />
        &nbsp; Use My Current Location as Delivery Address
      </label>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <MapContainer
        center={[
          userLocation?.lat || defaultSourceLocation.lat,
          userLocation?.lon || defaultSourceLocation.lon,
        ]}
        zoom={userLocation ? 15 : 5}
        style={{ height: "300px", width: "100%", borderRadius: "8px" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />

        {sourceLocation && (
          <Marker position={[sourceLocation.lat, sourceLocation.lon]}>
            <Popup>
              Restaurant Location:<br />
              {sourceLocation.displayName}
            </Popup>
          </Marker>
        )}

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lon]}>
            <Popup>
              Delivery Destination:<br />
              {userLocation.displayName}
            </Popup>
          </Marker>
        )}

        {deliveryBoys.map((boy, idx) => {
          const lat = 18.5205 + 0.02 + idx * 0.01;
          const lon = 73.8148 + 0.02 + idx * 0.01;

          return (
            <Marker key={idx} position={[lat, lon]}>
              <Popup>
                <strong>{boy.name}</strong><br />
                Phone: {boy.phone}<br />
                Address: {boy.address || "N/A"}<br />
                Instructions: {boy.instructions || "None"}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <hr style={{ margin: "20px 0", borderColor: "#555" }} />

      <h3>Delivery Person</h3>
      {assignedBoy ? (
        <div style={{ backgroundColor: "#222", padding: "10px", marginBottom: "10px", borderRadius: "5px" }}>
          <p><strong>Name:</strong> {assignedBoy.name}</p>
          <p><strong>Phone:</strong> {assignedBoy.phone}</p>
          <p><strong>From:</strong> {assignedBoy.address || "N/A"}</p>
          <p><strong>Instructions:</strong> {assignedBoy.instructions || "None"}</p>
        </div>
      ) : (
        <p>No delivery person assigned.</p>
      )}

      <hr style={{ margin: "20px 0", borderColor: "#555" }} />

      <h3>Delivery Details</h3>
      {distance && estimatedTime ? (
        <div style={{ backgroundColor: "#222", padding: "10px", borderRadius: "5px" }}>
          <p><strong>Distance:</strong> {distance} km</p>
          <p><strong>Estimated Time:</strong> {estimatedTime} minutes</p>
          <p><strong>Extra Charges:</strong> ₹{extraCharges}</p>
        </div>
      ) : (
        <p>Calculating delivery details...</p>
      )}
    </div>
  );
};

export default LiveOrderTracking;
