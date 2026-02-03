const { Client } = require('pg');

// 🔴 PASTE YOUR RENDER "EXTERNAL DATABASE URL" INSIDE THE QUOTES BELOW 🔴
// It starts with postgres:// and ends with .render.com
const connectionString = 'postgresql://chakravyuh_user:wHdebdCKF0srnX5HY0CF6RCD5X0H1WM3@dpg-d5ti6a7gi27c73f8637g-a.oregon-postgres.render.com/chakravyuh';

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for Render
  },
});

// The specific list of teams you requested, mapped to your schema
const teamsToUpload = [
  { team_id: 'TEAM_HW',  name: 'Hello World',   token: 'HELLO-8291' },
  { team_id: 'TEAM_MKC', name: 'MKC',           token: 'MKC-3342' },
  { team_id: 'TEAM_BM',  name: 'BM',            token: 'BM-9921' },
  { team_id: 'TEAM_TF',  name: 'Twin Flames',   token: 'TWIN-7743' },
  { team_id: 'TEAM_MV',  name: 'Manasverse',    token: 'MANAS-2024' },
  { team_id: 'TEAM_TJ',  name: 'The Jack',      token: 'JACK-5512' },
  { team_id: 'TEAM_T3',  name: 'T3',            token: 'T3-8831' },
  { team_id: 'TEAM_DUO', name: 'Duo',           token: 'DUO-1192' },
  { team_id: 'TEAM_BB',  name: 'Binary Bytes',  token: 'BYTE-4428' },
  { team_id: 'TEAM_3I',  name: '3 Idiots',      token: 'IDIOT-3391' },
  { team_id: 'TEAM_IX',  name: 'Innovation X',  token: 'INNO-6625' },
  { team_id: 'TEAM_LL',  name: 'Logic Labs',    token: 'LOGIC-7719' },
  { team_id: 'TEAM_TB',  name: 'Tribytes',      token: 'TRI-2284' },
  { team_id: 'TEAM_GPT', name: 'ChatGPT',       token: 'GPT-9911' }
];

async function run() {
  try {
    console.log("⏳ Connecting to Render Database...");
    await client.connect();
    console.log("✅ Connected!");

    console.log("🚀 Uploading teams...");

    for (const team of teamsToUpload) {
      const query = `
        INSERT INTO teams (team_id, team_name, access_token, is_dummy)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (team_id) 
        DO UPDATE SET 
            access_token = EXCLUDED.access_token,
            team_name = EXCLUDED.team_name;
      `;
      
      const values = [team.team_id, team.name, team.token, false]; // is_dummy = false
      
      await client.query(query, values);
      console.log(`   👉 Inserted/Updated: ${team.name}`);
    }

    console.log("\n🎉 SUCCESS! All teams are live in the database.");

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.end();
  }
}

run();
