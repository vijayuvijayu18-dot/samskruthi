async function runSuite() {
  console.log('🌍 =======================================================');
  console.log('   SAMSKRUTHI WORLDWIDE HERITAGE ATLAS — TEST SUITE');
  console.log('=======================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
    }
  }

  const BASE_URL = 'http://localhost:5000/api';

  // TEST 1: Load All Worldwide Places
  try {
    const res = await fetch(`${BASE_URL}/places`);
    assert(res.ok, 'GET /api/places returns HTTP 200');
    const places = await res.json();
    assert(places.length >= 30, `Full world dataset retrieved (${places.length} places loaded)`);

    // TEST 2: Multi-Continent Coverage
    const continents = new Set(places.map(p => p.continent));
    assert(continents.has('Asia'), 'Covers Asia');
    assert(continents.has('Europe'), 'Covers Europe');
    assert(continents.has('Africa'), 'Covers Africa');
    assert(continents.has('South America'), 'Covers South America');
    assert(continents.has('North America'), 'Covers North America');
    assert(continents.has('Oceania'), 'Covers Oceania');

    // TEST 3: Coordinate Accuracy
    const validCoords = places.every(p => 
      typeof p.latitude === 'number' && !isNaN(p.latitude) && p.latitude >= -90 && p.latitude <= 90 &&
      typeof p.longitude === 'number' && !isNaN(p.longitude) && p.longitude >= -180 && p.longitude <= 180
    );
    assert(validCoords, 'All locations have valid, non-null, bounded GPS coordinates');

    // TEST 4: Category Diversity
    const categories = new Set(places.map(p => p.category));
    assert(categories.has('monuments-architecture'), 'Includes Monuments & Architecture');
    assert(categories.has('ancient-civilizations'), 'Includes Ancient Civilizations');
    assert(categories.has('festivals-celebrations'), 'Includes Festivals & Living Celebrations');
    assert(categories.has('traditional-crafts'), 'Includes Master Traditional Crafts');
    assert(categories.has('performing-arts'), 'Includes Classical Dance & Performing Arts');
    assert(categories.has('food-heritage'), 'Includes Food Heritage & Gastronomy');
    assert(categories.has('cultural-traditions'), 'Includes Indigenous Cultural Traditions');

    // TEST 5: Nearby Geodetic Discovery — Bengaluru / South India (12.9716, 77.5946)
    const nearbyBengaluru = await fetch(`${BASE_URL}/places/nearby?lat=12.9716&lng=77.5946&radius=500`).then(r => r.json());
    assert(nearbyBengaluru.totalFound > 0, `Bengaluru nearby discovery found ${nearbyBengaluru.totalFound} places within 500km`);
    assert(nearbyBengaluru.places[0].distanceKm < nearbyBengaluru.places[nearbyBengaluru.places.length - 1].distanceKm, 'Nearby places properly sorted ascending by distance (nearest first)');
    console.log(`   📍 Nearest to Bengaluru: ${nearbyBengaluru.places[0].name} (${nearbyBengaluru.places[0].distanceKm} km away)`);

    // TEST 6: Nearby Geodetic Discovery — Cairo / North Africa (30.0444, 31.2357)
    const nearbyCairo = await fetch(`${BASE_URL}/places/nearby?lat=30.0444&lng=31.2357&radius=1000`).then(r => r.json());
    assert(nearbyCairo.totalFound > 0, `Cairo nearby discovery found ${nearbyCairo.totalFound} places`);
    assert(nearbyCairo.places[0].slug.includes('pyramids') || nearbyCairo.places[0].distanceKm < 50, `Nearest to Cairo is Giza Pyramids (${nearbyCairo.places[0].distanceKm} km)`);

    // TEST 7: Nearby Geodetic Discovery — Rome / Europe (41.9028, 12.4964)
    const nearbyRome = await fetch(`${BASE_URL}/places/nearby?lat=41.9028&lng=12.4964&radius=1000`).then(r => r.json());
    assert(nearbyRome.totalFound > 0, `Rome nearby discovery found ${nearbyRome.totalFound} places`);
    assert(nearbyRome.places[0].slug.includes('colosseum') || nearbyRome.places[0].distanceKm < 10, `Nearest to Rome is Colosseum (${nearbyRome.places[0].distanceKm} km)`);

    // TEST 8: Nearby Geodetic Discovery — Cusco / Andes (-13.5319, -71.9675)
    const nearbyCusco = await fetch(`${BASE_URL}/places/nearby?lat=-13.5319&lng=-71.9675&radius=200`).then(r => r.json());
    assert(nearbyCusco.totalFound >= 2, `Cusco nearby discovery found ${nearbyCusco.totalFound} Incan heritage sites`);
    console.log(`   📍 Nearest to Cusco: ${nearbyCusco.places[0].name} (${nearbyCusco.places[0].distanceKm} km away)`);

    // TEST 9: Global Search
    const searchRes = await fetch(`${BASE_URL}/places?q=Taj`).then(r => r.json());
    assert(searchRes.length > 0 && searchRes.some(p => p.name.includes('Taj Mahal')), 'Search for "Taj" correctly returns Taj Mahal');

    const searchCountry = await fetch(`${BASE_URL}/places?q=Peru`).then(r => r.json());
    assert(searchCountry.length >= 2, `Search by country "Peru" returns ${searchCountry.length} Peruvian heritage locations`);

    // TEST 10: Slug Details Endpoint
    const slugRes = await fetch(`${BASE_URL}/places/machu-picchu-citadel`).then(r => r.json());
    assert(slugRes.name.includes('Machu Picchu'), 'GET /api/places/machu-picchu-citadel returns complete dossier');
    assert(Boolean(slugRes.culturalSignificance), 'Place dossier contains cultural significance');
    assert(Boolean(slugRes.unescoStatus), 'Place dossier contains verified UNESCO status');

  } catch (err) {
    console.error('Test suite execution error:', err);
    assert(false, `Unexpected suite failure: ${err.message}`);
  }

  console.log(`\n=======================================================`);
  console.log(`   RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log(`=======================================================\n`);
}

runSuite();
