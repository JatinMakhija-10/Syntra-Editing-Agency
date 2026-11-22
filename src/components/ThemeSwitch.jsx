/**
 * ThemeSwitch Component - Quiet Chrome
 * Minimal, accessible theme toggle with line icons.
 */
export function ThemeSwitch({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400"
      style={{
        borderColor: 'var(--border-color)',
        backgroundColor: 'var(--bg-overlay)',
        color: 'var(--text-secondary)',
      }}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? (
        /* Sun line icon */
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        /* Moon line icon */
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}
