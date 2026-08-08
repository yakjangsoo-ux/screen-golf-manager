// One-off migration: pushes existing local data/<month>/<date>.json files into
// Firestore's `logs` collection. Run manually once: `node scripts/migrate-data.js`
// Uses the client SDK against the project's open Firestore rules (no service
// account needed) since this is a disposable script, not a shipped feature.
const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const FIREBASE_CONFIG = {
  projectId: "screen-golf-manager",
  appId: "1:94940029914:web:698ed0da783773838596e3",
  storageBucket: "screen-golf-manager.firebasestorage.app",
  apiKey: "AIzaSyA5MhepW5yZ_hLD16POQsnXB_7j4zgDFAM",
  authDomain: "screen-golf-manager.firebaseapp.com",
  messagingSenderId: "94940029914",
};

const DATA_DIR = path.join(__dirname, '..', 'data');

async function main(){
  const app = initializeApp(FIREBASE_CONFIG);
  const db = getFirestore(app);

  const monthDirs = fs.readdirSync(DATA_DIR, { withFileTypes: true }).filter(d => d.isDirectory());
  let count = 0;
  for(const monthDir of monthDirs){
    const monthPath = path.join(DATA_DIR, monthDir.name);
    const files = fs.readdirSync(monthPath).filter(f => f.endsWith('.json'));
    for(const file of files){
      const date = file.replace(/\.json$/, '');
      const log = JSON.parse(fs.readFileSync(path.join(monthPath, file), 'utf8'));
      await setDoc(doc(db, 'logs', date), log);
      console.log(`업로드됨: ${date}`);
      count++;
    }
  }
  console.log(`완료: 총 ${count}건 업로드`);
  process.exit(0);
}

main().catch(err => { console.error('마이그레이션 실패:', err); process.exit(1); });
