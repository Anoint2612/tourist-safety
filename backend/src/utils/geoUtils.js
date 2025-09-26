// State-level bounding boxes to avoid water or out-of-region points
const stateBoundaries = {
  assam: {
    latMin: 24.1,
    latMax: 27.9,
    lonMin: 89.7,
    lonMax: 96.0
  },
  sikkim: {
    latMin: 27.0,
    latMax: 28.1,
    lonMin: 88.0,
    lonMax: 88.9
  },
  arunachalPradesh: {
    latMin: 26.6,
    latMax: 29.3,
    lonMin: 91.6,
    lonMax: 97.4
  },
  westBengal: {
    // northern West Bengal only
    latMin: 26.0,
    latMax: 27.1,
    lonMin: 88.0,
    lonMax: 89.8
  }
};

const generateStateCoordinates = (stateName) => {
  const key = stateName.toLowerCase().replace(' ', '').replace('(north)', '');
  const bounds = stateBoundaries[key];
  if (!bounds) {
    throw new Error(`State "${stateName}" not supported. Available: ${Object.keys(stateBoundaries).join(', ')}`);
  }

  const latitude = (Math.random() * (bounds.latMax - bounds.latMin) + bounds.latMin).toFixed(6);
  const longitude = (Math.random() * (bounds.lonMax - bounds.lonMin) + bounds.lonMin).toFixed(6);

  return {
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    state: stateName
  };
};

// Weighted across NE states; prevents ocean/out-of-bound points by design
const generateNortheastIndiaCoordinates = () => {
  const states = ['assam', 'sikkim', 'arunachalPradesh', 'westBengal'];
  const weights = [0.4, 0.2, 0.3, 0.1];

  const random = Math.random();
  let cumulativeWeight = 0;
  let selectedState = states[0];
  for (let i = 0; i < states.length; i++) {
    cumulativeWeight += weights[i];
    if (random <= cumulativeWeight) {
      selectedState = states[i];
      break;
    }
  }

  const stateNames = {
    assam: 'Assam',
    sikkim: 'Sikkim',
    arunachalPradesh: 'Arunachal Pradesh',
    westBengal: 'West Bengal (North)'
  };

  return generateStateCoordinates(stateNames[selectedState]);
};

// Hotspot-biased generator; clusters around popular destinations with small random offset
const generateTouristAreaCoordinates = () => {
  const touristHotspots = [
    // Assam
    { name: 'Guwahati', state: 'Assam', lat: 26.1445, lon: 91.7362, weight: 0.25 },
    { name: 'Kaziranga National Park', state: 'Assam', lat: 26.5775, lon: 93.1713, weight: 0.15 },
    { name: 'Jorhat', state: 'Assam', lat: 26.7509, lon: 94.2037, weight: 0.08 },
    { name: 'Tezpur', state: 'Assam', lat: 26.6340, lon: 92.7933, weight: 0.05 },

    // Sikkim
    { name: 'Gangtok', state: 'Sikkim', lat: 27.3389, lon: 88.6065, weight: 0.15 },
    { name: 'Pelling', state: 'Sikkim', lat: 27.2151, lon: 88.2426, weight: 0.08 },
    { name: 'Nathula Pass', state: 'Sikkim', lat: 27.3919, lon: 88.8418, weight: 0.05 },

    // Arunachal Pradesh
    { name: 'Itanagar', state: 'Arunachal Pradesh', lat: 27.0844, lon: 93.6053, weight: 0.08 },
    { name: 'Tawang', state: 'Arunachal Pradesh', lat: 27.5858, lon: 91.8689, weight: 0.06 },
    { name: 'Bomdila', state: 'Arunachal Pradesh', lat: 27.2615, lon: 92.4089, weight: 0.03 },

    // West Bengal (North)
    { name: 'Darjeeling', state: 'West Bengal', lat: 27.0410, lon: 88.2663, weight: 0.10 },
    { name: 'Kalimpong', state: 'West Bengal', lat: 27.0587, lon: 88.4673, weight: 0.04 }
  ];

  const random = Math.random();
  let cumulativeWeight = 0;
  let selectedHotspot = touristHotspots[0];
  for (const hotspot of touristHotspots) {
    cumulativeWeight += hotspot.weight;
    if (random <= cumulativeWeight) {
      selectedHotspot = hotspot;
      break;
    }
  }

  const randomOffset = 0.05; // ~5.5km
  const latitude = selectedHotspot.lat + (Math.random() - 0.5) * 2 * randomOffset;
  const longitude = selectedHotspot.lon + (Math.random() - 0.5) * 2 * randomOffset;

  const bounds = stateBoundaries[selectedHotspot.state.toLowerCase().replace(' ', '').replace('(north)', '')];
  const clampedLat = Math.max(bounds.latMin, Math.min(bounds.latMax, latitude));
  const clampedLon = Math.max(bounds.lonMin, Math.min(bounds.lonMax, longitude));

  return {
    latitude: parseFloat(clampedLat.toFixed(6)),
    longitude: parseFloat(clampedLon.toFixed(6)),
    nearestCity: selectedHotspot.name,
    state: selectedHotspot.state
  };
};

module.exports = {
  generateNortheastIndiaCoordinates,
  generateTouristAreaCoordinates,
  generateStateCoordinates,
  stateBoundaries
};
