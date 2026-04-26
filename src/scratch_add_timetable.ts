import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || '(default)');

const TIMETABLE = [
  { start: '06:00', end: '09:20', title: 'Physical Conditioning', subject: 'Quant', type: 'study', description: '4km Run + Boxing. Sacred block. Do not alter. This builds your QAT endurance.' },
  { start: '09:20', end: '10:00', title: 'Recovery', subject: 'General', type: 'reminder', description: 'Breakfast & Hydration. Switch your brain from physical to mental mode.' },
  { start: '10:00', end: '11:30', title: 'Deep Focus', subject: 'English', type: 'study', description: 'English (Grammar/RC). Your mind is sharpest here. Crucial for Paper 1 & Paper 2.' },
  { start: '11:30', end: '14:00', title: 'Core Profession', subject: 'General', type: 'study', description: 'Tech Lead Duties. Team stand-ups, code reviews, critical bugs.' },
  { start: '14:00', end: '15:30', title: 'Stealth Block 1', subject: 'Reasoning', type: 'study', description: 'Reasoning & GK. 45m Reasoning PYQs, 45m Static GK/Current Affairs.' },
  { start: '15:30', end: '17:30', title: 'Profession Wrap-up', subject: 'General', type: 'study', description: 'Tech Lead Duties. Finish remaining IT tasks, emails, and next-day planning.' },
  { start: '17:30', end: '19:30', title: 'Stealth Block 2', subject: 'Quant', type: 'study', description: 'Quant (Maths). Heavy lifting. Treat this like your 200kg deadlift.' },
  { start: '19:30', end: '20:30', title: 'Dinner & Detach', subject: 'General', type: 'reminder', description: 'Screen-free time. Take a quick walk around Nehru Vihar to clear the monitors from your head.' },
  { start: '20:30', end: '21:30', title: 'Light Revision', subject: 'Awareness', type: 'study', description: 'Vocab / GK PDFs / Mistakes. No new concepts. Light review of the day\'s errors.' },
  { start: '22:00', end: '23:00', title: 'Hard Stop', subject: 'General', type: 'deadline', description: 'Sleep. Secure 8 hours. Non-negotiable for sustained output.' }
];

async function run() {
  const email = 'yadavamarjit772@gmail.com';
  console.log(`Searching for user with email: ${email}`);
  
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.error('User not found!');
    return;
  }
  
  const userDoc = snapshot.docs[0];
  const uid = userDoc.id;
  console.log(`Found user! UID: ${uid}`);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  console.log(`Adding ${TIMETABLE.length} events for today...`);
  
  for (const item of TIMETABLE) {
    const [startH, startM] = item.start.split(':').map(Number);
    const [endH, endM] = item.end.split(':').map(Number);
    
    const startTime = new Date(today);
    startTime.setHours(startH, startM);
    
    const endTime = new Date(today);
    endTime.setHours(endH, endM);
    
    await addDoc(collection(db, 'users', uid, 'events'), {
      userId: uid,
      title: item.title,
      description: item.description,
      type: item.type,
      subject: item.subject,
      startTime: startTime.getTime(),
      endTime: endTime.getTime(),
      status: 'pending',
      reminded: false,
    });
    console.log(`Added: ${item.title}`);
  }
  
  console.log('Successfully updated timetable!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
