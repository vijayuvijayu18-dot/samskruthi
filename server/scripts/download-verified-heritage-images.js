import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.resolve(__dirname, '../../public/images/heritage');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const HERITAGE_DOWNLOADS = [
  {
    id: 'hp-1',
    slug: 'virupaksha-temple-hampi',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Complex_of_Virupaksha_Temple%2C_Hampi_%2804%29.jpg',
  },
  {
    id: 'hp-2',
    slug: 'konark-sun-temple',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Konarka_Temple.jpg',
  },
  {
    id: 'hp-3',
    slug: 'brihadisvara-temple',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Brihadisvara_Temple_during_Maha_Shivaratri-WUS03611_%28edit%29.jpg',
  },
  {
    id: 'hp-4',
    slug: 'khajuraho-monuments',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/1_Khajuraho.jpg',
  },
  {
    id: 'hp-5',
    slug: 'ellora-caves',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Ellora_Caves%2C_India%2C_Kailasa_Temple.jpg',
  },
  {
    id: 'hp-6',
    slug: 'ajanta-caves',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Ajanta_%2863%29.jpg',
  },
  {
    id: 'hp-7',
    slug: 'dholavira-harappan-metropolis',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/89/DHOLAVIRA_SITE_%2824%29.jpg',
  },
  {
    id: 'hp-8',
    slug: 'varanasi-ghats-kashi',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Dasaswamedh_ghat-varanasi_india-andres_larin.jpg',
  },
  {
    id: 'hp-9',
    slug: 'madurai-temple-city',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Gopuram_of_the_Meenakshi_Temple_at_Madurai.jpg',
  },
  {
    id: 'hp-10',
    slug: 'thanjavur-bronze-casting',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Shiva_as_the_Lord_of_Dance_LACMA_edit.jpg',
  },
  {
    id: 'hp-11',
    slug: 'bidriware-damascene-metal-art',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Bidriware_Hookah.jpg',
  },
  {
    id: 'hp-12',
    slug: 'yakshagana-theatre',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Yakshaganads.jpg',
  },
  {
    id: 'hp-13',
    slug: 'kathakali-dance-drama',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Kathakali_-Play_with_Kaurava.jpg',
  },
];

async function downloadFile(url, dest) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'SamskruthiHeritageApp/1.0 (contact@samskruthi.org)',
    },
  });
  if (!res.ok) {
    throw new Error(`Failed HTTP ${res.status} for ${url}`);
  }
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(buffer));
  const stats = fs.statSync(dest);
  return stats.size;
}

async function run() {
  console.log('🏛️ Downloading 13 Authentic Heritage Photographs from Wikimedia Commons to public/images/heritage/ ...');
  for (const item of HERITAGE_DOWNLOADS) {
    const dest = path.join(targetDir, `${item.slug}.jpg`);
    try {
      const size = await downloadFile(item.url, dest);
      console.log(`✅ [${item.id}] ${item.slug}.jpg (${Math.round(size / 1024)} KB) downloaded successfully`);
    } catch (err) {
      console.error(`❌ [${item.id}] Failed to download ${item.slug}:`, err.message);
    }
  }
  console.log('✨ All downloads completed.');
}

run();
