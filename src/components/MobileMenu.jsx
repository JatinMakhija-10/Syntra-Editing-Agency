import { useEffect } from 'react';

export const MobileMenu = ({ isOpen, onClose, onNavigate }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ backgroundColor: 'var(--modal-bg)' }}
        onClick={onClose}
      />
      
      {/* Menu content */}
      <nav
        className="absolute top-20 left-0 right-0 mx-4 rounded-2xl border p-6 flex flex-col gap-4"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
        }}
        aria-label="Mobile navigation"
      >
        <a
          href="#about"
          onClick={(e) => {
            onNavigate(e);
            onClose();
          }}
          className="text-base tracking-[0.15em] uppercase py-3 hover:text-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded px-2"
          style={{ color: 'var(--text-primary)' }}
        >
          About
        </a>
        <a
          href="#services"
          onClick={(e) => {
            onNavigate(e);
            onClose();
          }}
          className="text-base tracking-[0.15em] uppercase py-3 hover:text-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded px-2 flex items-center justify-between"
          style={{ color: 'var(--text-primary)' }}
        >
          <span>Services</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-yellow-400 text-black">
            6 Disciplines
          </span>
        </a>
        <a
          href="#clients"
          onClick={(e) => {
            onNavigate(e);
            onClose();
          }}
          className="text-base tracking-[0.15em] uppercase py-3 hover:text-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded px-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Clients
        </a>
        <a
          href="#process"
          onClick={(e) => {
            onNavigate(e);
            onClose();
          }}
          className="text-base tracking-[0.15em] uppercase py-3 hover:text-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded px-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Process
        </a>
        <a
          href="#contact"
          onClick={(e) => {
            onNavigate(e);
            onClose();
          }}
          className="text-base tracking-[0.15em] uppercase py-3 px-6 bg-yellow-400 text-black rounded-full text-center hover:bg-yellow-300 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
        >
          Contact
        </a>
      </nav>
    </div>
  );
};
