import { turso } from '../db/turso.js';

async function audit() {
  const res = await turso.execute('SELECT id, name, location, country, state, city, latitude, longitude, image_url, category FROM heritage_places ORDER BY id;');
  console.log(`Total places in Turso: ${res.rows.length}`);
  res.rows.forEach(r => {
    console.log(`[${r.id}] ${r.name} (${r.country || 'India'}, ${r.state}) -> Lat: ${r.latitude}, Lng: ${r.longitude} | Cat: ${r.category} | Img: ${r.image_url}`);
  });
}

audit().catch(console.error);
