export type UpdateAction = () => void;
export type InstallAction = () => Promise<boolean>;
export type UpdateInfo = { version: string; action: UpdateAction };

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface VersionMessage {
  version?: string;
}

function readWaitingVersion(worker: ServiceWorker): Promise<string> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    const timer = window.setTimeout(() => resolve(__APP_VERSION__), 1000);
    channel.port1.onmessage = (event: MessageEvent<VersionMessage>) => {
      window.clearTimeout(timer);
      const reportedVersion = event.data?.version;
      resolve(reportedVersion && !reportedVersion.startsWith('__') ? reportedVersion : __APP_VERSION__);
    };
    worker.postMessage({ type: 'GET_VERSION' }, [channel.port2]);
  });
}

export function registerPwa(
  onUpdateAvailable: (info: UpdateInfo) => void,
  onInstallAvailable: (action: InstallAction) => void,
): void {
  let deferredInstall: InstallPromptEvent | null = null;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstall = event as InstallPromptEvent;
    onInstallAvailable(async () => {
      if (!deferredInstall) return false;
      await deferredInstall.prompt();
      const choice = await deferredInstall.userChoice;
      deferredInstall = null;
      return choice.outcome === 'accepted';
    });
  });
  if (!('serviceWorker' in navigator)) return;

  const baseUrl = import.meta.env.BASE_URL;
  let refreshing = false;
  let hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) {
      hadController = true;
      return;
    }
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  void navigator.serviceWorker.register(`${baseUrl}sw.js`, { scope: baseUrl }).then((registration) => {
    const exposeWaitingWorker = () => {
      const worker = registration.waiting;
      if (!worker) return;
      void readWaitingVersion(worker).then((version) => {
        onUpdateAvailable({
          version,
          action: () => worker.postMessage({ type: 'SKIP_WAITING' }),
        });
      });
    };

    exposeWaitingWorker();
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) exposeWaitingWorker();
      });
    });

    window.addEventListener('focus', () => {
      void registration.update().catch(() => undefined);
    });
  }).catch(() => undefined);
}
