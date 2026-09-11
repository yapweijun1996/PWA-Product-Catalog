import { useEffect, useState } from 'react';
import { downloadBackup, restoreBackup } from '../../backup';
import { clearAllData } from '../../store';
import { ImportPanel } from './ImportPanel';
import type { CompanySettings } from '../../types';
import type { Labels } from '../../i18n/translations';
import type { Notice } from '../../components/common/Toast';

interface SettingsScreenProps {
  settings: CompanySettings;
  labels: Labels;
  onSave: (settings: CompanySettings) => Promise<void>;
  onImported: () => Promise<void>;
  onNotice: (notice: Notice) => void;
}

export function SettingsScreen({
  settings,
  labels,
  onSave,
  onImported,
  onNotice,
}: SettingsScreenProps) {
  const [value, setValue] = useState(settings);

  useEffect(() => {
    setValue(settings);
  }, [settings]);

  return (
    <section className="screen">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">{labels.workspaceControl}</p>
          <h2>{labels.settings}</h2>
          <p className="muted">{labels.localOnlyHelp}</p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="card">
          <h3>{labels.company}</h3>
          <div className="settings-form">
            <label>
              <span>{labels.company}</span>
              <input
                name="company-name"
                value={value.companyName}
                onChange={(event) => setValue({ ...value, companyName: event.target.value })}
              />
            </label>

            <label>
              <span>{labels.address}</span>
              <textarea
                name="company-address"
                rows={2}
                value={value.address}
                onChange={(event) => setValue({ ...value, address: event.target.value })}
              />
            </label>

            <label>
              <span>{labels.contact}</span>
              <input
                name="company-contact"
                value={value.contact}
                onChange={(event) => setValue({ ...value, contact: event.target.value })}
              />
            </label>

            <div className="form-grid">
              <label>
                <span>{labels.currency}</span>
                <input
                  name="currency"
                  maxLength={3}
                  value={value.defaultCurrency}
                  onChange={(event) =>
                    setValue({ ...value, defaultCurrency: event.target.value.toUpperCase() })
                  }
                />
              </label>

              <label>
                <span>{labels.defaultTax}</span>
                <input
                  name="default-tax"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={value.defaultTaxRate}
                  onChange={(event) =>
                    setValue({ ...value, defaultTaxRate: Number(event.target.value) })
                  }
                />
              </label>
            </div>

            <label>
              <span>{labels.language}</span>
              <select
                name="language"
                value={value.language}
                onChange={(event) =>
                  setValue({ ...value, language: event.target.value as CompanySettings['language'] })
                }
              >
                <option value="en">{labels.english}</option>
                <option value="zh-Hans">{labels.mandarin}</option>
                <option value="ms">{labels.malay}</option>
                <option value="vi">{labels.vietnamese}</option>
                <option value="ja">{labels.japanese}</option>
              </select>
            </label>

            <label>
              <span>{labels.logo}</span>
              <input
                name="company-logo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file || file.size > 1024 * 1024) {
                    onNotice({ tone: 'error', message: labels.logoError });
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => setValue({ ...value, logoDataUrl: String(reader.result) });
                  reader.readAsDataURL(file);
                }}
              />
            </label>

            <button className="button" onClick={() => void onSave(value)}>
              {labels.saveSettings}
            </button>
          </div>
        </div>

        <ImportPanel
          currency={value.defaultCurrency}
          labels={labels}
          onImported={onImported}
          onNotice={onNotice}
        />

        <div className="card data-tools">
          <h3>{labels.dataSafety}</h3>
          <p className="muted">{labels.dataSafetyHelp}</p>
          <button className="button button-secondary" onClick={() => void downloadBackup()}>
            {labels.backup}
          </button>
          <label className="file-button button button-secondary">
            {labels.restore}
            <input
              name="backup-file"
              type="file"
              accept="application/json"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try {
                  await restoreBackup(file);
                  await onImported();
                  onNotice({ tone: 'success', message: labels.backupRestored });
                } catch (error) {
                  onNotice({
                    tone: 'error',
                    message: error instanceof Error ? error.message : labels.restoreFailed,
                  });
                }
              }}
            />
          </label>
          <button
            className="button button-danger"
            onClick={async () => {
              if (window.confirm(labels.clearConfirm)) {
                await clearAllData();
                await onImported();
                onNotice({ tone: 'success', message: labels.localDataCleared });
              }
            }}
          >
            {labels.clear}
          </button>
        </div>
      </div>
    </section>
  );
}
