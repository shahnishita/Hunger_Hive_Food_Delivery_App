// controllers/locationController.js
import fetch from 'node-fetch'; // You need to install this

export const reverseGeocode = async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          'User-Agent': 'YourApp/1.0' // Required by Nominatim API
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Reverse geocoding failed:', error.message);
    res.status(500).json({ error: 'Reverse geocoding failed' });
  }
};
