import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbJsonPath = path.join(__dirname, '../src/data/db.json');

async function seedDatabase() {
  const dbJson = JSON.parse(fs.readFileSync(dbJsonPath, 'utf-8'));

  if (!process.env.MONGODB_CONNECTION_STRING) {
    throw new Error('MONGODB_CONNECTION_STRING env var not set');
  }

  const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING);

  try {
    await client.connect();
    const db = client.db('portfolio');

    // Extract data from db.json
    // The legacy seed file has no current profile content. Leave the profile
    // managed in MongoDB instead of recreating its obsolete location field.

    const workTab = dbJson.tabs.find(t => t.title === 'work');
    const projectsTab = dbJson.tabs.find(t => t.title === 'projects');
    const bookshelfTab = dbJson.tabs.find(t => t.title === 'digital_bookshelf');

    const workData = {
      subtitle: workTab.subtitle,
      current: workTab.current ?? workTab.content.current,
      prev: workTab.prev ?? workTab.content.prev,
    };
    const bookshelfData = {
      subtitle: bookshelfTab.subtitle,
      current: bookshelfTab.current ?? bookshelfTab.content.current,
      future: bookshelfTab.future ?? bookshelfTab.content.future,
    };

    // For projects, flatten the structure since page.tsx expects top-level current/prev
    const projectsData = {
      subtitle: projectsTab.subtitle,
      current: projectsTab.current,
      prev: projectsTab.prev,
    };

    // Seed collections
    console.log('Seeding work...');
    await db.collection('work').updateOne({}, { $set: workData }, { upsert: true });

    console.log('Seeding projects...');
    await db.collection('projects').updateOne({}, { $set: projectsData }, { upsert: true });

    console.log('Seeding bookshelf...');
    await db.collection('bookshelf').updateOne({}, { $set: bookshelfData }, { upsert: true });

    console.log('Database seeded successfully!');
  } finally {
    await client.close();
  }
}

seedDatabase().catch(err => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
