import {
  collection, doc, getDoc, setDoc, updateDoc,
  getDocs, onSnapshot, arrayUnion, arrayRemove, deleteDoc, addDoc
} from 'firebase/firestore';
import { db, isFirebaseReady } from './firebase';

// Sanitize category + title into a safe Firestore document ID
const sanitizeDocId = (category, serviceTitle) =>
  `${category}___${serviceTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 80)}`;

// ── Local Storage Fallback Store ──────────────────────────────
const STORAGE_KEY_ADDITIONS = 'syntra_local_additions';
const STORAGE_KEY_SERVICES = 'syntra_local_new_services';

export function getLocalAdditions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_ADDITIONS) || '{}');
  } catch {
    return {};
  }
}

function saveLocalAdditions(data) {
  localStorage.setItem(STORAGE_KEY_ADDITIONS, JSON.stringify(data));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('syntra_storage_update'));
  }
}

export function getLocalServices() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_SERVICES) || '[]');
  } catch {
    return [];
  }
}

function saveLocalServices(data) {
  localStorage.setItem(STORAGE_KEY_SERVICES, JSON.stringify(data));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('syntra_storage_update'));
  }
}

// ── Item CRUD ──────────────────────────────────────────────────

export async function addItemToService(category, serviceTitle, item) {
  const newItem = {
    ...item,
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseReady) {
    try {
      const id = sanitizeDocId(category, serviceTitle);
      const ref = doc(db, 'additions', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, { items: arrayUnion(newItem) });
      } else {
        await setDoc(ref, { category, serviceTitle, items: [newItem] });
      }
      return newItem;
    } catch (err) {
      console.warn('[Syntra] Firestore add failed, falling back to local storage:', err.message);
    }
  }

  // Local storage save
  const current = getLocalAdditions();
  if (!current[category]) current[category] = {};
  if (!current[category][serviceTitle]) current[category][serviceTitle] = [];
  current[category][serviceTitle].push(newItem);
  saveLocalAdditions(current);
  return newItem;
}

export async function removeItemFromService(category, serviceTitle, item) {
  if (isFirebaseReady) {
    try {
      const id = sanitizeDocId(category, serviceTitle);
      const ref = doc(db, 'additions', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const currentItems = snap.data().items || [];
        const updated = currentItems.filter(i => i.id !== item.id);
        await updateDoc(ref, { items: updated });
        return;
      }
    } catch (err) {
      console.warn('[Syntra] Firestore remove failed, falling back to local storage:', err.message);
    }
  }

  // Local storage remove
  const current = getLocalAdditions();
  if (current[category]?.[serviceTitle]) {
    current[category][serviceTitle] = current[category][serviceTitle].filter(i => i.id !== item.id);
    saveLocalAdditions(current);
  }
}

// ── New Service Cards ──────────────────────────────────────────

export async function addNewService(service) {
  const newSvc = {
    ...service,
    id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseReady) {
    try {
      const ref = await addDoc(collection(db, 'newServices'), newSvc);
      return ref.id;
    } catch (err) {
      console.warn('[Syntra] Firestore card add failed, falling back to local storage:', err.message);
    }
  }

  // Local storage save
  const current = getLocalServices();
  current.push(newSvc);
  saveLocalServices(current);
  return newSvc.id;
}

export async function updateNewServiceItems(id, items) {
  if (isFirebaseReady) {
    try {
      await updateDoc(doc(db, 'newServices', id), { items });
      return;
    } catch (err) {
      console.warn('[Syntra] Firestore update failed, falling back to local storage:', err.message);
    }
  }

  const current = getLocalServices();
  const index = current.findIndex(s => s.id === id);
  if (index !== -1) {
    current[index].items = items;
    saveLocalServices(current);
  }
}

export async function removeNewService(id) {
  if (isFirebaseReady) {
    try {
      await deleteDoc(doc(db, 'newServices', id));
      return;
    } catch (err) {
      console.warn('[Syntra] Firestore delete failed, falling back to local storage:', err.message);
    }
  }

  const current = getLocalServices();
  const updated = current.filter(s => s.id !== id);
  saveLocalServices(updated);
}

// ── Real-time subscriptions ────────────────────────────────────

export function subscribeToAdditions(callback) {
  if (isFirebaseReady) {
    try {
      return onSnapshot(collection(db, 'additions'), (snap) => {
        const result = {};
        snap.forEach(d => {
          const data = d.data();
          if (!result[data.category]) result[data.category] = {};
          result[data.category][data.serviceTitle] = data.items || [];
        });
        callback(result);
      }, (err) => {
        console.warn('[Syntra] Firestore additions error, using local storage:', err.message);
        callback(getLocalAdditions());
      });
    } catch (err) {
      console.warn('[Syntra] Firestore subscribe error:', err.message);
    }
  }

  // Local storage reactive subscription
  callback(getLocalAdditions());
  if (typeof window === 'undefined') return () => {};

  const handler = () => callback(getLocalAdditions());
  window.addEventListener('syntra_storage_update', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('syntra_storage_update', handler);
    window.removeEventListener('storage', handler);
  };
}

export function subscribeToNewServices(callback) {
  if (isFirebaseReady) {
    try {
      return onSnapshot(collection(db, 'newServices'), (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, (err) => {
        console.warn('[Syntra] Firestore newServices error, using local storage:', err.message);
        callback(getLocalServices());
      });
    } catch (err) {
      console.warn('[Syntra] Firestore subscribe error:', err.message);
    }
  }

  // Local storage reactive subscription
  callback(getLocalServices());
  if (typeof window === 'undefined') return () => {};

  const handler = () => callback(getLocalServices());
  window.addEventListener('syntra_storage_update', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('syntra_storage_update', handler);
    window.removeEventListener('storage', handler);
  };
}

// ── Admin reads (non-reactive) ─────────────────────────────────

export async function getAdditionsForService(category, serviceTitle) {
  if (isFirebaseReady) {
    try {
      const id = sanitizeDocId(category, serviceTitle);
      const snap = await getDoc(doc(db, 'additions', id));
      if (snap.exists()) return snap.data().items || [];
    } catch (err) {
      console.warn('[Syntra] Firestore read error:', err.message);
    }
  }
  const current = getLocalAdditions();
  return current[category]?.[serviceTitle] || [];
}

// ── URL auto-detection ─────────────────────────────────────────

export function detectUrlType(rawUrl) {
  if (!rawUrl || !rawUrl.trim()) return null;
  const url = rawUrl.trim();

  // YouTube watch URL
  const ytWatch = url.match(/(?:youtube\.com\/watch\?.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytWatch) return { type: 'youtube', src: `https://www.youtube.com/embed/${ytWatch[1]}` };

  // YouTube Shorts
  const ytShorts = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (ytShorts) return { type: 'youtube', src: `https://www.youtube.com/embed/${ytShorts[1]}` };

  // YouTube embed already formatted
  if (url.includes('youtube.com/embed/')) return { type: 'youtube', src: url };

  // Instagram Reel
  const igMatch = url.match(/instagram\.com\/reel\/([A-Za-z0-9_-]+)/);
  if (igMatch) return { type: 'instagram', src: `https://www.instagram.com/reel/${igMatch[1]}/embed` };

  // Google Drive view → convert to preview
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) return { type: 'drive', src: `https://drive.google.com/file/d/${driveMatch[1]}/preview` };

  // PDF
  if (url.match(/\.pdf($|\?)/i) || url.includes('/pdf/') || url.includes('type=pdf')) {
    return { type: 'pdf', src: url };
  }

  // Common image hosting / image extensions
  if (
    url.match(/\.(jpg|jpeg|png|gif|webp|svg|avif|bmp)($|\?)/i) ||
    url.match(/postimg\.cc|imgur\.com|i\.ibb\.co|cloudinary\.com|imgbb\.com|i\.imgur/)
  ) {
    return { type: 'image', src: url };
  }

  // Default → website preview iframe
  return { type: 'website', src: url };
}

export const TYPE_META = {
  youtube:   { icon: '▶', label: 'YouTube Video',    color: '#FF0000' },
  instagram: { icon: '📸', label: 'Instagram Reel',  color: '#E1306C' },
  drive:     { icon: '🎬', label: 'Google Drive',    color: '#4285F4' },
  pdf:       { icon: '📄', label: 'PDF Document',    color: '#FF6B35' },
  image:     { icon: '🖼', label: 'Image',           color: '#34A853' },
  website:   { icon: '🌐', label: 'Website Preview', color: '#9333EA' },
};
