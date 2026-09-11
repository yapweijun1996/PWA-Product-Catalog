import { useCallback, useEffect, useState } from 'react';
import { DEMO_PRODUCTS } from './demo';
import {
  getActiveCatalog,
  getSettings,
  listQuotes,
  loadDraft,
  loadQuote,
  deleteQuote,
  duplicateQuote,
  replaceCatalog,
  saveDraft,
  saveSettings,
  getActiveCatalogVersion,
} from './store';
import {
  createEmptyQuote,
  getQuoteValidationErrors,
  createQuoteLine,
  getDefaultTaxRate,
  recalculateDraft,
  validatePercentage,
} from './domain';
import { Icon } from './icons';
import { registerPwa, type InstallAction, type UpdateInfo } from './pwa';
import { copy } from './i18n/translations';
import { AppNav, type Screen } from './components/layout/AppNav';
import { Toast, type Notice } from './components/common/Toast';
import { CatalogScreen } from './features/catalog/CatalogScreen';
import { QuoteScreen } from './features/quote/QuoteScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';
import type { CatalogVersion, CompanySettings, Product, Quote, QuoteDraft } from './types';

function currentScreen(): Screen {
  const value = window.location.hash.slice(1);
  return value === 'quotes' || value === 'settings' ? value : 'catalog';
}

function App() {
  const [screen, setScreen] = useState<Screen>(currentScreen);
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogVersion, setCatalogVersion] = useState<CatalogVersion | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [draft, setDraft] = useState<QuoteDraft | null>(null);
  const [settings, setSettings] = useState<CompanySettings>({
    id: 'default',
    companyName: 'Your Company',
    address: '',
    contact: '',
    defaultCurrency: 'USD',
    defaultTaxRate: 0,
    language: 'en',
    logoDataUrl: '',
  });
  const [online, setOnline] = useState(navigator.onLine);
  const [notice, setNotice] = useState<Notice>(null);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [installAction, setInstallAction] = useState<InstallAction | null>(null);
  const [showUpdate, setShowUpdate] = useState(true);
  const labels = copy[settings.language];

  const refresh = useCallback(async () => {
    const [catalog, savedSettings, savedDraft, quoteHistory, activeVersion] = await Promise.all([
      getActiveCatalog(),
      getSettings(),
      loadDraft(),
      listQuotes(),
      getActiveCatalogVersion(),
    ]);
    setProducts(catalog);
    setCatalogVersion(activeVersion ?? null);
    setSettings(savedSettings);
    setDraft(savedDraft ? recalculateDraft(savedDraft) : null);
    setQuotes(quoteHistory);
  }, []);

  useEffect(() => {
    void refresh();
    registerPwa(setUpdateInfo, (action) => setInstallAction(() => action));
  }, [refresh]);

  useEffect(() => {
    document.title = labels.appName;
  }, [labels.appName]);

  useEffect(() => {
    const onHash = () => setScreen(currentScreen());
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('hashchange', onHash);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const navigate = (next: Screen) => {
    window.location.hash = next;
  };

  const addToQuote = async (product: Product) => {
    const base = draft ?? createEmptyQuote(settings.defaultCurrency, settings.defaultTaxRate);
    const existing = base.lines.find((line) => line.productId === product.id);
    const lines = existing
      ? base.lines.map((line) =>
          line.id === existing.id ? { ...line, quantity: line.quantity + 1 } : line
        )
      : [
          ...base.lines,
          {
            ...createQuoteLine(product, base.id),
            taxRateSnapshot: getDefaultTaxRate(settings.defaultTaxRate),
          },
        ];
    const next = recalculateDraft({ ...base, status: 'draft', lines });
    await saveDraft(next);
    setDraft(next);
    setQuotes(await listQuotes());
    setNotice({ tone: 'success', message: `${product.name} · ${labels.add}` });
  };

  const mutateDraft = async (change: (value: QuoteDraft) => QuoteDraft) => {
    if (!draft) return;
    const next = recalculateDraft(change(draft));
    setDraft(next);
    await saveDraft(next);
    setQuotes(await listQuotes());
  };

  const exportPdf = async () => {
    if (!draft || draft.lines.length === 0) return;
    const quoteErrors = getQuoteValidationErrors(draft);
    if (quoteErrors.length) {
      setNotice({ tone: 'error', message: labels.invalidQuote });
      return;
    }
    try {
      const { downloadQuotePdf } = await import('./pdf');
      await downloadQuotePdf(draft, settings, labels);
      const next = { ...draft, status: 'exported' as const };
      await saveDraft(next);
      setDraft(next);
      setQuotes(await listQuotes());
      setNotice({ tone: 'success', message: labels.pdfDownloaded });
    } catch (error) {
      setNotice({
        tone: 'error',
        message: error instanceof Error ? error.message : labels.pdfExportFailed,
      });
    }
  };

  const sharePdf = async () => {
    if (!draft || draft.lines.length === 0) return;
    const quoteErrors = getQuoteValidationErrors(draft);
    if (quoteErrors.length) {
      setNotice({ tone: 'error', message: labels.invalidQuote });
      return;
    }
    try {
      const { downloadQuotePdf, shareQuotePdf } = await import('./pdf');
      const shared = await shareQuotePdf(draft, settings, labels);
      if (!shared) {
        await downloadQuotePdf(draft, settings, labels);
        setNotice({ tone: 'info', message: labels.shareUnsupported });
      } else {
        setNotice({ tone: 'success', message: labels.share });
      }
      const next = { ...draft, status: 'shared' as const };
      await saveDraft(next);
      setDraft(next);
      setQuotes(await listQuotes());
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setNotice({
        tone: 'error',
        message: error instanceof Error ? error.message : labels.shareFailed,
      });
    }
  };

  const onSettingsSaved = async (next: CompanySettings) => {
    if (!/^[A-Z]{3}$/.test(next.defaultCurrency) || validatePercentage(next.defaultTaxRate)) {
      setNotice({ tone: 'error', message: labels.invalidSettings });
      return;
    }
    await saveSettings(next);
    setSettings(next);
    setNotice({ tone: 'success', message: labels.save });
  };

  const openQuote = async (quoteId: string) => {
    const loaded = await loadQuote(quoteId);
    if (loaded) {
      setDraft(recalculateDraft({ ...loaded, status: 'draft' }));
      navigate('quotes');
    }
  };

  const duplicateQuoteAction = async (quoteId: string) => {
    const next = await duplicateQuote(quoteId);
    setDraft(next);
    setQuotes(await listQuotes());
    navigate('quotes');
    setNotice({ tone: 'success', message: `${labels.duplicated} ${next.quoteNumber}.` });
  };

  const deleteQuoteAction = async (quoteId: string) => {
    if (!window.confirm(labels.deleteConfirm)) return;
    await deleteQuote(quoteId);
    setDraft(await loadDraft());
    setQuotes(await listQuotes());
    setNotice({ tone: 'success', message: labels.delete });
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" />
          </div>
          <div>
            <p className="eyebrow">{labels.workspace}</p>
            <h1>{labels.appName}</h1>
          </div>
        </div>
        <div className="topbar-status" aria-live="polite">
          <span className={`status-dot ${online ? 'is-online' : 'is-offline'}`} />
          {online ? labels.online : labels.offline}
          {installAction && (
            <button
              className="button button-small button-secondary"
              onClick={async () => {
                const accepted = await installAction();
                if (accepted) setInstallAction(null);
              }}
            >
              {labels.install}
            </button>
          )}
          {updateInfo && showUpdate && (
            <div className="update-prompt">
              <span>
                {labels.update} · v{updateInfo.version}
              </span>
              <button
                className="button button-small button-warning"
                onClick={() => updateInfo.action()}
              >
                {labels.updateNow}
              </button>
              <button className="update-later" onClick={() => setShowUpdate(false)}>
                {labels.later}
              </button>
            </div>
          )}
        </div>
      </header>

      <AppNav
        screen={screen}
        labels={labels}
        quoteLinesCount={draft?.lines.length}
        onNavigate={navigate}
      />

      <main className="main-content">
        {screen === 'catalog' && (
          <CatalogScreen
            products={products}
            version={catalogVersion}
            labels={labels}
            draft={draft}
            onAdd={addToQuote}
            onLoadDemo={async () => {
              await replaceCatalog(DEMO_PRODUCTS, 'Built-in demo catalog');
              await refresh();
              setNotice({ tone: 'success', message: labels.local });
            }}
            onViewQuote={() => navigate('quotes')}
          />
        )}
        {screen === 'quotes' && (
          <QuoteScreen
            draft={draft}
            quotes={quotes}
            labels={labels}
            onChange={mutateDraft}
            onExport={exportPdf}
            onShare={sharePdf}
            onOpen={openQuote}
            onDuplicate={duplicateQuoteAction}
            onDelete={deleteQuoteAction}
          />
        )}
        {screen === 'settings' && (
          <SettingsScreen
            settings={settings}
            labels={labels}
            onSave={onSettingsSaved}
            onImported={refresh}
            onNotice={setNotice}
          />
        )}
      </main>

      <Toast notice={notice} />
    </div>
  );
}

export default App;
