const HISTORY_KEY = 'moodsense:history';
const USERS_KEY = 'moodsense:users';

export function signup({ email, password }) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  if (users[email]) throw new Error('User already exists');
  users[email] = { email, password };
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { email };
}

export function login({ email, password }) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  const u = users[email];
  if (!u || u.password !== password) throw new Error('Invalid credentials');
  return { email };
}

export function addMood({ email, mood, note }) {
  const entry = { email, mood, note: note || '', at: new Date().toISOString() };
  const list = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  list.push(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  return entry;
}

export function getHistory(email) {
  const list = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  return list.filter(e => e.email === email).sort((a, b) => new Date(b.at) - new Date(a.at));
}

export const EMOTIONS = ['happy', 'sad', 'neutral', 'angry', 'surprised', 'fearful', 'disgusted', 'calm'];

export function detectEmotionMock() {
  const idx = Math.floor(Math.random() * EMOTIONS.length);
  return EMOTIONS[idx];
}
