import { useState, useEffect, useRef } from 'react';
import {
  addItemToService,
  removeItemFromService,
  addNewService,
  removeNewService,
  subscribeToAdditions,
  subscribeToNewServices,
  detectUrlType,
  TYPE_META
} from '../lib/contentStore';
import { servicesData } from '../servicesData';

const categories = ['VIDEO', 'GRAPHICS', 'THUMBNAILS', 'CONTENT', 'WEB', 'AI_UGC', 'AUTOMATION'];

/* ── Toast Notification System ─────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };
  return { toasts, success: msg => add(msg, 'success'), error: msg => add(msg, 'error'), info: msg => add(msg, 'info') };
}

function ToastContainer({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold shadow-2xl border animate-slide-up backdrop-blur-lg pointer-events-auto ${
          t.type === 'success' ? 'bg-green-950/90 border-green-500/30 text-green-300' :
          t.type === 'error' ? 'bg-red-950/90 border-red-500/30 text-red-300' :
          'bg-blue-950/90 border-blue-500/30 text-blue-300'
        }`}>
          <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ── Confirm Dialog ─────────────────────────────────────────── */
function useConfirm() {
  const [state, setState] = useState(null);
  const confirm = (msg) => new Promise(resolve => setState({ msg, resolve }));
  const ConfirmDialog = state ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <p className="text-sm text-white mb-6 leading-relaxed">{state.msg}</p>
        <div className="flex gap-3">
          <button onClick={() => { state.resolve(false); setState(null); }}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-xs uppercase tracking-widest font-bold hover:bg-white/5 transition">
            Cancel
          </button>
          <button onClick={() => { state.resolve(true); setState(null); }}
            className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-xs uppercase tracking-widest font-bold hover:bg-red-500/30 transition">
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  ) : null;
  return { confirm, ConfirmDialog };
}

/* ── Mini Live Preview ──────────────────────────────────────── */
function LivePreview({ detectedType }) {
  if (!detectedType) return null;
  const meta = TYPE_META[detectedType.type];
  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
        <span>{meta.icon}</span>
        <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: meta.color }}>{meta.label} Preview</span>
      </div>
      <div className="p-2">
        {(detectedType.type === 'youtube' || detectedType.type === 'drive' || detectedType.type === 'instagram') && (
          <div className="aspect-video rounded-lg overflow-hidden bg-black">
            <iframe src={detectedType.src} className="w-full h-full" allowFullScreen title="preview" />
          </div>
        )}
        {detectedType.type === 'image' && (
          <img src={detectedType.src} alt="preview" className="w-full rounded-lg max-h-48 object-cover" />
        )}
        {(detectedType.type === 'website' || detectedType.type === 'pdf') && (
          <div className="aspect-video rounded-lg overflow-hidden bg-black/50">
            <iframe src={detectedType.src} className="w-full h-full" title="preview" sandbox="allow-same-origin allow-scripts" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Stats Card ─────────────────────────────────────────────── */
function StatsBadge({ label, value, color = '#FFD100' }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 bg-white/[0.01]">
      <span className="text-2xl font-bold" style={{ color }}>{value}</span>
      <span className="text-[9px] uppercase tracking-widest text-gray-500 mt-1">{label}</span>
    </div>
  );
}

/* ── Main Admin Component ───────────────────────────────────── */
export default function Admin() {
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('syntra_admin_auth') === 'true'
  );
  const [authError, setAuthError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);

  const [activeCategory, setActiveCategory] = useState('VIDEO');
  const [selectedServiceTitle, setSelectedServiceTitle] = useState('');
  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'manage' | 'stats'
  
  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Real-time data
  const [firestoreAdditions, setFirestoreAdditions] = useState({});
  const [firestoreNewServices, setFirestoreNewServices] = useState([]);

  // Add item form
  const [inputUrl, setInputUrl] = useState('');
  const [detectedType, setDetectedType] = useState(null);
  const [itemTitle, setItemTitle] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Create card form
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDesc, setNewCardDesc] = useState('');
  const [newCardTag, setNewCardTag] = useState('');
  const [isCreatingCard, setIsCreatingCard] = useState(false);

  // Lockout logic
  const isLockedOut = lockoutUntil && new Date() < lockoutUntil;

  const handleLogin = (e) => {
    e.preventDefault();
    if (isLockedOut) return;
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'syntra@admin2025';
    if (password === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('syntra_admin_auth', 'true');
      setAuthError('');
      setLoginAttempts(0);
      toast.success('Welcome back, Jatin!');
    } else {
      const attempts = loginAttempts + 1;
      setLoginAttempts(attempts);
      if (attempts >= 5) {
        const unlock = new Date(Date.now() + 60000);
        setLockoutUntil(unlock);
        setAuthError('Too many attempts. Locked for 1 minute.');
      } else {
        setAuthError(`Incorrect password. ${5 - attempts} attempt(s) remaining.`);
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('syntra_admin_auth');
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const unsubAdditions = subscribeToAdditions(setFirestoreAdditions);
    const unsubNewServices = subscribeToNewServices(setFirestoreNewServices);
    return () => { unsubAdditions(); unsubNewServices(); };
  }, [isAuthenticated]);

  useEffect(() => {
    if (inputUrl.trim()) {
      setDetectedType(detectUrlType(inputUrl));
    } else {
      setDetectedType(null);
      setShowPreview(false);
    }
  }, [inputUrl]);

  const getServices = () => {
    const staticList = Object.keys(servicesData[activeCategory] || {});
    const customList = firestoreNewServices
      .filter(s => s.category === activeCategory)
      .map(s => s.title);
    return [...new Set([...staticList, ...customList])];
  };

  const currentServices = getServices();

  useEffect(() => {
    if (currentServices.length > 0 && !currentServices.includes(selectedServiceTitle)) {
      setSelectedServiceTitle(currentServices[0]);
    }
  }, [activeCategory, firestoreNewServices]);

  // Computed stats
  const totalCustomItems = Object.values(firestoreAdditions).reduce((acc, cat) =>
    acc + Object.values(cat).reduce((a, items) => a + items.length, 0), 0);
  const totalCustomCards = firestoreNewServices.length;
  const totalStaticItems = Object.values(servicesData).reduce((acc, cat) =>
    acc + Object.values(cat).reduce((a, svc) =>
      a + (svc.examples?.length || 0) + (svc.videoShowcase?.length || 0) + (svc.webPreview?.length || 0), 0), 0);

  // Filtered items for manage tab
  const getFilteredItems = (items) => {
    return items
      .filter(item => filterType === 'all' || item.type === filterType)
      .filter(item =>
        !searchQuery ||
        (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.src || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!selectedServiceTitle || !inputUrl.trim() || !detectedType) return;
    setIsAdding(true);
    try {
      await addItemToService(activeCategory, selectedServiceTitle, {
        type: detectedType.type,
        src: detectedType.src,
        title: itemTitle.trim(),
        description: itemDesc.trim(),
      });
      setInputUrl(''); setItemTitle(''); setItemDesc(''); setDetectedType(null); setShowPreview(false);
      toast.success(`✓ Added to "${selectedServiceTitle}"`);
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveItem = async (serviceTitle, item) => {
    const ok = await confirm(`Remove "${item.title || item.src}" from "${serviceTitle}"?`);
    if (!ok) return;
    try {
      await removeItemFromService(activeCategory, serviceTitle, item);
      toast.success('Item removed.');
    } catch (err) {
      toast.error('Error: ' + err.message);
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim() || !newCardDesc.trim() || !newCardTag.trim()) return;
    setIsCreatingCard(true);
    try {
      await addNewService({ category: activeCategory, title: newCardTitle.trim(), desc: newCardDesc.trim(), tag: newCardTag.trim() });
      setNewCardTitle(''); setNewCardDesc(''); setNewCardTag('');
      toast.success(`Card "${newCardTitle}" created!`);
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setIsCreatingCard(false);
    }
  };

  const handleRemoveCard = async (id, title) => {
    const ok = await confirm(`Delete card "${title}" and ALL its items? This cannot be undone.`);
    if (!ok) return;
    try {
      await removeNewService(id);
      toast.success(`Card "${title}" deleted.`);
    } catch (err) {
      toast.error('Error: ' + err.message);
    }
  };

  const handleRemoveAllItems = async (serviceTitle) => {
    const allItems = firestoreAdditions[activeCategory]?.[serviceTitle] || [];
    if (!allItems.length) return;
    const ok = await confirm(`Remove ALL ${allItems.length} custom items from "${serviceTitle}"?`);
    if (!ok) return;
    try {
      for (const item of allItems) {
        await removeItemFromService(activeCategory, serviceTitle, item);
      }
      toast.success('All items removed.');
    } catch (err) {
      toast.error('Error: ' + err.message);
    }
  };

  /* ─── LOGIN SCREEN ──────────────────────────────────────────── */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808] px-4 font-sans text-[#f5f5f3]">
        <ToastContainer toasts={toast.toasts} />
        <div className="w-full max-w-md">
          <div className="p-8 rounded-3xl border border-white/10 backdrop-blur-xl bg-white/[0.02] shadow-2xl">
            <div className="flex flex-col items-center mb-8">
              <img src="/assets/syntra-logo.png" alt="Syntra" className="h-9 w-auto mb-4" />
              <h1 className="text-xl font-bold tracking-wider uppercase text-yellow-400" style={{ fontFamily: 'var(--font-display)' }}>
                Secure Admin
              </h1>
              <p className="text-xs text-gray-500 mt-1">Syntra Studio Control Panel</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="admin-pass" className="text-xs uppercase tracking-widest text-gray-400">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    id="admin-pass"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLockedOut}
                    className="w-full rounded-xl px-4 py-3 pr-12 text-sm bg-white/5 border border-white/10 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/25 transition-all text-white disabled:opacity-50"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs transition">
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              {authError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/40 border border-red-500/20">
                  <span className="text-red-400 text-xs font-semibold">⚠ {authError}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={isLockedOut}
                className="w-full py-3.5 bg-yellow-400 text-black text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-yellow-300 transition-all shadow-lg hover:shadow-yellow-400/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLockedOut ? '🔒 Locked' : 'Access Dashboard →'}
              </button>
            </form>
          </div>
          <p className="text-center text-[10px] text-gray-600 mt-4 tracking-widest">SYNTRA STUDIO — ADMIN v2.0</p>
        </div>
      </div>
    );
  }

  /* ─── DASHBOARD ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#080808] text-[#f5f5f3] font-sans pb-20">
      <ToastContainer toasts={toast.toasts} />
      {ConfirmDialog}

      {/* Sticky Header */}
      <header className="border-b border-white/5 sticky top-0 bg-[#080808]/95 backdrop-blur-xl z-30">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/assets/syntra-logo.png" alt="Syntra" className="h-7 w-auto object-contain" />
            <span className="font-extrabold tracking-[0.2em] text-sm uppercase text-white" style={{ fontFamily: 'var(--font-display)' }}>
              SYNTRA
            </span>
            <span className="text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 rounded bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-bold">
              Admin v2
            </span>
          </div>

          {/* Tab Navigation */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/5">
            {[['add', '＋ Add Content'], ['manage', '⊟ Manage'], ['stats', '◎ Stats']].map(([tab, label]) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold transition ${
                  activeTab === tab ? 'bg-yellow-400 text-black shadow' : 'text-gray-400 hover:text-white'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a href="/" target="_blank" className="text-xs text-gray-400 hover:text-white transition hidden sm:block">
              Live Site ↗
            </a>
            <button onClick={handleLogout}
              className="px-3 py-1.5 border border-red-500/30 text-red-400 text-[10px] uppercase tracking-widest font-bold rounded-full hover:bg-red-500/10 transition">
              Logout
            </button>
          </div>
        </div>
        {/* Mobile tabs */}
        <div className="flex md:hidden border-t border-white/5">
          {[['add', 'Add'], ['manage', 'Manage'], ['stats', 'Stats']].map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-[10px] uppercase tracking-widest font-bold transition ${
                activeTab === tab ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Category Row */}
      <div className="sticky top-[57px] md:top-[53px] z-20 bg-[#080808]/90 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] tracking-wider uppercase font-semibold transition ${
                activeCategory === cat
                  ? 'bg-yellow-400 text-black font-bold shadow-lg shadow-yellow-400/10'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
              }`}>
              {cat}
            </button>
          ))}
          <div className="ml-auto flex-shrink-0 text-[10px] text-gray-600 font-mono whitespace-nowrap">
            {getServices().length} service(s)
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 mt-8">

        {/* ── ADD CONTENT TAB ─────────────────────────────────── */}
        {activeTab === 'add' && (
          <div className="grid lg:grid-cols-[1fr,1.4fr] gap-8">

            {/* Left: Controls */}
            <div className="space-y-6">
              
              {/* Add Portfolio Content */}
              <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] space-y-5">
                <div>
                  <h2 className="text-sm uppercase tracking-widest text-yellow-400 font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                    Add Portfolio Content
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Paste a URL — type is auto-detected instantly.</p>
                </div>

                <form onSubmit={handleAddItem} className="space-y-4">
                  {/* Service Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Destination Card</label>
                    {currentServices.length > 0 ? (
                      <select value={selectedServiceTitle} onChange={(e) => setSelectedServiceTitle(e.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-sm bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-400 cursor-pointer">
                        {currentServices.map(title => (
                          <option key={title} value={title} className="bg-[#0f0f0f]">{title}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs text-red-400 p-3 bg-red-950/20 rounded-xl border border-red-500/20">
                        No service cards found. Create one below or switch category.
                      </p>
                    )}
                  </div>

                  {/* URL Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Paste URL</label>
                    <input
                      type="url"
                      placeholder="YouTube, Instagram, Drive, PDF, Image, Website..."
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 text-sm bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-400 transition"
                      required
                    />
                  </div>

                  {/* Detection Banner */}
                  {detectedType && (
                    <div className="p-3 rounded-xl flex items-center justify-between border" style={{
                      borderColor: `${TYPE_META[detectedType.type].color}33`,
                      backgroundColor: `${TYPE_META[detectedType.type].color}10`
                    }}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{TYPE_META[detectedType.type].icon}</span>
                        <div>
                          <p className="text-xs font-bold" style={{ color: TYPE_META[detectedType.type].color }}>
                            {TYPE_META[detectedType.type].label} Detected
                          </p>
                          <p className="text-[10px] text-gray-500 truncate max-w-[200px] mt-0.5 font-mono">{detectedType.src}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setShowPreview(!showPreview)}
                        className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-white transition px-2 py-1 rounded border border-white/10 hover:bg-white/5">
                        {showPreview ? 'Hide' : 'Preview'}
                      </button>
                    </div>
                  )}

                  {/* Live Preview */}
                  {showPreview && detectedType && <LivePreview detectedType={detectedType} />}

                  {/* Title */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Title <span className="text-gray-600">(optional)</span></label>
                    <input type="text" placeholder="e.g. Client Explainer Video"
                      value={itemTitle} onChange={(e) => setItemTitle(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 text-sm bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-400 transition" />
                  </div>

                  {/* Description */}
                  {detectedType && ['youtube', 'drive', 'instagram', 'website', 'pdf'].includes(detectedType.type) && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Description <span className="text-gray-600">(optional)</span></label>
                      <textarea rows={2} placeholder="Brief note about this asset..."
                        value={itemDesc} onChange={(e) => setItemDesc(e.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-sm bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-400 transition resize-none" />
                    </div>
                  )}

                  <button type="submit" disabled={isAdding || !detectedType || !selectedServiceTitle}
                    className="w-full py-3.5 bg-yellow-400 text-black text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-yellow-300 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg hover:shadow-yellow-400/10">
                    {isAdding ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Adding...
                      </span>
                    ) : '＋ Add to Card'}
                  </button>
                </form>
              </div>

              {/* Create Custom Service Card */}
              <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] space-y-5">
                <div>
                  <h2 className="text-sm uppercase tracking-widest text-yellow-400 font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                    Create Service Card
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Add a custom card to the {activeCategory} tab.</p>
                </div>
                <form onSubmit={handleCreateCard} className="space-y-3">
                  <input type="text" placeholder="Card Title" value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-400 transition"
                    required />
                  <input type="text" placeholder="Tag (e.g. Design, Web, Elite)" value={newCardTag}
                    onChange={(e) => setNewCardTag(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-400 transition"
                    required />
                  <textarea rows={2} placeholder="Card description..." value={newCardDesc}
                    onChange={(e) => setNewCardDesc(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-400 transition resize-none"
                    required />
                  <button type="submit" disabled={isCreatingCard}
                    className="w-full py-3 bg-white/10 text-white hover:bg-white/20 text-xs uppercase tracking-widest font-bold rounded-xl transition cursor-pointer disabled:opacity-50">
                    {isCreatingCard ? 'Creating...' : '＋ Create Card'}
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Service Item List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                  {activeCategory} — Content Overview
                </h2>
                <span className="text-[10px] text-gray-600 font-mono">
                  {(firestoreAdditions[activeCategory] ? Object.values(firestoreAdditions[activeCategory]).reduce((a,i)=>a+i.length,0) : 0)} custom items
                </span>
              </div>
              
              <div className="space-y-4 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
                {currentServices.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    <p className="text-4xl mb-3">📭</p>
                    <p className="text-sm">No service cards. Create one on the left!</p>
                  </div>
                ) : currentServices.map((title) => {
                  const isCustomCard = firestoreNewServices.find(s => s.category === activeCategory && s.title === title);
                  const staticData = servicesData[activeCategory]?.[title] || {};
                  const addedItems = firestoreAdditions[activeCategory]?.[title] || [];
                  const staticCount = (staticData.examples?.length || 0) + (staticData.videoShowcase?.length || 0) + (staticData.webPreview?.length || 0);

                  return (
                    <div key={title} className={`p-5 rounded-xl border bg-white/[0.01] space-y-4 transition ${selectedServiceTitle === title ? 'border-yellow-400/30 bg-yellow-400/[0.02]' : 'border-white/5'}`}>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border ${
                              isCustomCard ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' : 'bg-white/5 text-gray-500 border-white/5'
                            }`}>
                              {isCustomCard ? 'Custom' : 'Static'}
                            </span>
                            {addedItems.length > 0 && (
                              <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
                                {addedItems.length} added
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-white truncate">{title}</h3>
                          {staticCount > 0 && (
                            <p className="text-[10px] text-gray-500 mt-0.5">+ {staticCount} static items in code</p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => { setSelectedServiceTitle(title); document.querySelector('#url-input')?.focus(); }}
                            className="px-3 py-1.5 rounded-lg bg-yellow-400/10 text-yellow-400 text-[10px] font-bold border border-yellow-400/20 hover:bg-yellow-400/20 transition">
                            Select
                          </button>
                          {addedItems.length > 1 && (
                            <button onClick={() => handleRemoveAllItems(title)}
                              className="px-3 py-1.5 rounded-lg bg-orange-950/40 text-orange-400 text-[10px] font-bold border border-orange-500/20 hover:bg-orange-900/40 transition">
                              Clear All
                            </button>
                          )}
                          {isCustomCard && (
                            <button onClick={() => handleRemoveCard(isCustomCard.id, title)}
                              className="px-3 py-1.5 rounded-lg bg-red-950/40 text-red-400 text-[10px] font-bold border border-red-500/20 hover:bg-red-900/40 transition">
                              Delete
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Items */}
                      {addedItems.length > 0 && (
                        <div className="space-y-2">
                          {addedItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-[#0a0a0a] gap-3">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <span className="text-lg flex-shrink-0">{TYPE_META[item.type]?.icon || '🌐'}</span>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate">{item.title || 'Untitled'}</p>
                                  <p className="text-[9px] text-gray-500 truncate font-mono mt-0.5">{item.src}</p>
                                  <span className="text-[8px] uppercase tracking-widest font-bold mt-0.5 inline-block" style={{ color: TYPE_META[item.type]?.color }}>
                                    {TYPE_META[item.type]?.label}
                                  </span>
                                </div>
                              </div>
                              <button onClick={() => handleRemoveItem(title, item)}
                                className="flex-shrink-0 p-1.5 px-2.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/40 text-xs font-bold border border-red-500/20 transition">
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── MANAGE TAB ──────────────────────────────────────── */}
        {activeTab === 'manage' && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="search"
                placeholder="Search by title or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-[200px] rounded-xl px-4 py-2.5 text-sm bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-400 transition"
              />
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                className="rounded-xl px-4 py-2.5 text-sm bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-400 cursor-pointer">
                <option value="all" className="bg-[#0f0f0f]">All Types</option>
                {Object.entries(TYPE_META).map(([type, meta]) => (
                  <option key={type} value={type} className="bg-[#0f0f0f]">{meta.icon} {meta.label}</option>
                ))}
              </select>
              {(searchQuery || filterType !== 'all') && (
                <button onClick={() => { setSearchQuery(''); setFilterType('all'); }}
                  className="px-3 py-2.5 rounded-xl border border-white/10 text-gray-400 text-xs hover:text-white hover:bg-white/5 transition">
                  Clear
                </button>
              )}
            </div>

            {/* Items Grid */}
            <div className="space-y-4">
              {currentServices.map((title) => {
                const addedItems = firestoreAdditions[activeCategory]?.[title] || [];
                const filtered = getFilteredItems(addedItems);
                if (filtered.length === 0 && (searchQuery || filterType !== 'all')) return null;

                return (
                  <div key={title} className="p-5 rounded-2xl border border-white/5 bg-white/[0.01]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-white">{title}</h3>
                      <span className="text-[10px] text-gray-500">{filtered.length} item(s)</span>
                    </div>
                    {filtered.length === 0 ? (
                      <p className="text-xs text-gray-600 italic">No custom items here yet.</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {filtered.map((item) => (
                          <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-[#0a0a0a]">
                            <span className="text-2xl mt-0.5 flex-shrink-0">{TYPE_META[item.type]?.icon || '🌐'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white">{item.title || 'Untitled'}</p>
                              <p className="text-[9px] text-gray-500 font-mono break-all mt-0.5">{item.src.substring(0, 60)}{item.src.length > 60 ? '…' : ''}</p>
                              {item.description && <p className="text-[10px] text-gray-400 mt-1">{item.description}</p>}
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: TYPE_META[item.type]?.color }}>
                                  {TYPE_META[item.type]?.label}
                                </span>
                                <button onClick={() => handleRemoveItem(title, item)}
                                  className="text-[9px] uppercase tracking-widest font-bold text-red-400 hover:text-red-300 transition">
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STATS TAB ───────────────────────────────────────── */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-sm uppercase tracking-widest text-yellow-400 font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                Dashboard Overview
              </h2>
              <p className="text-xs text-gray-500">Real-time portfolio stats from Firestore.</p>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsBadge label="Static Portfolio Items" value={totalStaticItems} />
              <StatsBadge label="Custom Added Items" value={totalCustomItems} color="#34A853" />
              <StatsBadge label="Custom Service Cards" value={totalCustomCards} color="#4285F4" />
              <StatsBadge label="Categories" value={categories.length} color="#E1306C" />
            </div>

            {/* Per Category Breakdown */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-4">Per Category Breakdown</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(cat => {
                  const catAdditions = firestoreAdditions[cat] || {};
                  const customCount = Object.values(catAdditions).reduce((a, items) => a + items.length, 0);
                  const staticCat = servicesData[cat] || {};
                  const staticCount = Object.values(staticCat).reduce((a, svc) =>
                    a + (svc.examples?.length || 0) + (svc.videoShowcase?.length || 0) + (svc.webPreview?.length || 0), 0);
                  const customCards = firestoreNewServices.filter(s => s.category === cat).length;

                  return (
                    <div key={cat} className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">{cat}</span>
                        <button onClick={() => { setActiveCategory(cat); setActiveTab('add'); }}
                          className="text-[10px] text-yellow-400 hover:text-yellow-300 transition">Manage →</button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <p className="text-lg font-bold text-white">{staticCount}</p>
                          <p className="text-[8px] uppercase text-gray-600 tracking-widest">Static</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-400">{customCount}</p>
                          <p className="text-[8px] uppercase text-gray-600 tracking-widest">Custom</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-400">{customCards}</p>
                          <p className="text-[8px] uppercase text-gray-600 tracking-widest">Cards</p>
                        </div>
                      </div>
                      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all"
                          style={{ width: `${Math.min(((staticCount + customCount) / Math.max(totalStaticItems, 1)) * 100, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Type Distribution */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-4">Content Type Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(TYPE_META).map(([type, meta]) => {
                  const count = Object.values(firestoreAdditions).reduce((acc, cat) =>
                    acc + Object.values(cat).reduce((a, items) => a + items.filter(i => i.type === type).length, 0), 0);
                  return (
                    <div key={type} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] text-center">
                      <span className="text-2xl">{meta.icon}</span>
                      <p className="text-xl font-bold mt-1" style={{ color: meta.color }}>{count}</p>
                      <p className="text-[9px] uppercase tracking-widest text-gray-500 mt-0.5">{meta.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <a href="/" target="_blank"
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition font-semibold">
                  View Live Site ↗
                </a>
                <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl border border-orange-500/20 text-xs text-orange-400 hover:bg-orange-500/10 transition font-semibold">
                  Firebase Console ↗
                </a>
                <a href="https://app.netlify.com" target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl border border-teal-500/20 text-xs text-teal-400 hover:bg-teal-500/10 transition font-semibold">
                  Netlify Dashboard ↗
                </a>
              </div>
            </div>
          </div>
        )}

      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
      `}</style>
    </div>
  );
}
