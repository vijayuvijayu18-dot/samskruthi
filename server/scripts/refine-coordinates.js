import { turso } from '../db/turso.js';

async function updatePreciseCoordinates() {
  console.log('📍 Updating precise geographical coordinates in Turso...');

  const updates = [
    { id: 'hp-8', lat: 25.3076, lng: 83.0107, loc: 'Dashashwamedh Ghat, Varanasi' },
    { id: 'hp-13', lat: 10.7516, lng: 76.2736, loc: 'Kerala Kalamandalam, Cheruthuruthy' },
    { id: 'hp-in-kumbh-mela', lat: 25.4262, lng: 81.8844, loc: 'Triveni Sangam Confluence, Prayagraj' },
    { id: 'hp-in-hyderabad-biryani', lat: 17.3616, lng: 78.4747, loc: 'Historic Charminar Quarter, Hyderabad' }
  ];

  for (const u of updates) {
    await turso.execute({
      sql: 'UPDATE heritage_places SET latitude = ?, longitude = ?, location = ? WHERE id = ?;',
      args: [u.lat, u.lng, u.loc, u.id]
    });
    console.log(`✅ [${u.id}] Updated to ${u.lat}, ${u.lng} (${u.loc})`);
  }

  console.log('✨ All coordinates refined to exact sub-monument geodetic markers!');
}

updatePreciseCoordinates().catch(console.error);
