import { NavLink, Outlet } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import type { Locale } from '@/i18n';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-accent-soft text-accent'
      : 'text-ink-muted hover:bg-surface hover:text-ink'
  }`;

export function AppLayout() {
  const { t, theme, toggleTheme, locale, setLocale } = useSettings();

  return (
    <div className="min-h-screen bg-surface text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-border bg-surface-raised">
          <div className="border-b border-border px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              DataLayer
            </p>
            <h1 className="mt-1 text-lg font-semibold tracking-tight">
              {t('app.name')}
            </h1>
          </div>
          <nav className="flex flex-col gap-1 p-3">
            <NavLink to="/guias" className={linkClass}>
              {t('nav.guides')}
            </NavLink>
            <NavLink to="/biblioteca" className={linkClass}>
              {t('nav.library')}
            </NavLink>
          </nav>

          <div className="mt-auto space-y-4 border-t border-border p-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                {t('settings.title')}
              </p>
              <label className="mb-3 flex items-center justify-between gap-2 text-sm text-ink">
                <span>{t('settings.darkMode')}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={theme === 'dark'}
                  onClick={toggleTheme}
                  className={`relative h-6 w-11 rounded-full transition ${
                    theme === 'dark' ? 'bg-accent' : 'bg-border-strong'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition ${
                      theme === 'dark' ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-ink">
                <span>{t('settings.language')}</span>
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as Locale)}
                  className="rounded-md border border-border bg-surface-raised px-2 py-1.5 text-sm outline-none focus:border-accent"
                >
                  <option value="es">{t('lang.es')}</option>
                  <option value="en">{t('lang.en')}</option>
                  <option value="pt">{t('lang.pt')}</option>
                </select>
              </label>
            </div>
            <p className="text-xs text-ink-subtle">{t('app.tagline')}</p>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
