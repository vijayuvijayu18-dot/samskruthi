import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.resolve(__dirname, '../../public/images/heritage');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Map each place to its Wikipedia / Wikimedia source to fetch direct image buffer
const INTERNATIONAL_DOWNLOADS = [
  { id: 'hp-in-taj-mahal', slug: 'taj-mahal', title: 'Taj Mahal' },
  { id: 'hp-in-mehrangarh-fort', slug: 'mehrangarh-fort', title: 'Mehrangarh Fort' },
  { id: 'hp-in-kumbh-mela', slug: 'kumbh-mela', title: 'Kumbh Mela' },
  { id: 'hp-in-hyderabad-biryani', slug: 'hyderabad-biryani', title: 'Hyderabadi biryani' },
  { id: 'hp-af-giza-pyramids', slug: 'giza-pyramids', title: 'Giza pyramid complex' },
  { id: 'hp-af-lalibela-churches', slug: 'lalibela-churches', title: 'Church of Saint George, Lalibela' },
  { id: 'hp-sa-machu-picchu', slug: 'machu-picchu', title: 'Machu Picchu' },
  { id: 'hp-sa-inti-raymi', slug: 'inti-raymi', title: 'Inti Raymi' },
  { id: 'hp-na-teotihuacan', slug: 'teotihuacan', title: 'Pyramid of the Sun' },
  { id: 'hp-na-mesa-verde', slug: 'mesa-verde', title: 'Cliff Palace' },
  { id: 'hp-eu-acropolis-athens', slug: 'acropolis-athens', title: 'Parthenon' },
  { id: 'hp-eu-venice-lagoon', slug: 'venice-lagoon', title: 'Grand Canal (Venice)' },
  { id: 'hp-eu-colosseum-rome', slug: 'colosseum-rome', title: 'Colosseum' },
  { id: 'hp-eu-flamenco-andalusia', slug: 'flamenco-andalusia', title: 'Flamenco' },
  { id: 'hp-as-angkor-wat', slug: 'angkor-wat', title: 'Angkor Wat' },
  { id: 'hp-as-petra-jordan', slug: 'petra-jordan', title: 'Al-Khazneh' },
  { id: 'hp-as-kyoto-temples', slug: 'kyoto-temples', title: 'Kinkaku-ji' },
  { id: 'hp-as-wayang-kulit', slug: 'wayang-kulit', title: 'Wayang kulit' },
  { id: 'hp-oc-rapa-nui', slug: 'rapa-nui', title: 'Moai' },
  { id: 'hp-oc-uluru', slug: 'uluru', title: 'Uluru' },
  { id: 'hp-oc-ta-moko', slug: 'ta-moko', title: 'Haka' },
];

async function fetchWikiImage(title) {
  const url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=original|thumbnail&pithumbsize=1000&titles=' + encodeURIComponent(title);
  const r = await fetch(url, { headers: { 'User-Agent': 'SamskruthiHeritageApp/1.0 (contact@samskruthi.org)' } });
  const data = await r.json();
  const pages = data.query?.pages ? Object.values(data.query.pages) : [];
  const page = pages[0];
  return page?.thumbnail?.source || page?.original?.source;
}

async function downloadFile(url, dest) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'SamskruthiHeritageApp/1.0 (contact@samskruthi.org)',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(buffer));
  return fs.statSync(dest).size;
}

async function run() {
  console.log('🏛️ Downloading verified images for all worldwide sites into public/images/heritage/ ...');
  for (const item of INTERNATIONAL_DOWNLOADS) {
    const dest = path.join(targetDir, `${item.slug}.jpg`);
    try {
      const imgUrl = await fetchWikiImage(item.title);
      if (!imgUrl) {
        console.warn(`⚠️ No wiki image found for ${item.title}`);
        continue;
      }
      const size = await downloadFile(imgUrl, dest);
      console.log(`✅ [${item.id}] ${item.slug}.jpg (${Math.round(size / 1024)} KB)`);
    } catch (err) {
      console.error(`❌ [${item.id}] Failed ${item.title}:`, err.message);
    }
  }
  console.log('✨ Completed downloading all international heritage images!');
}

run();
