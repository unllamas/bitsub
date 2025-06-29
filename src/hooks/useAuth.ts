import { useEffect, useState } from 'react';
import { init, requestProvider, onConnected, onDisconnected, type WebLNProviders } from '@getalby/bitcoin-connect';

init({
  appName: 'BitSub',
  filters: ['nwc'], // opcional: sólo mostrar conexiones NWC
});

export function useAuth() {
  const [provider, setProvider] = useState<typeof WebLNProviders | null>(null);
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Setear window.webln cuando haya conexión
  useEffect(() => {
    const unsub = onConnected(async (prov) => {
      (window as any).webln = prov;
      setProvider(prov);
      try {
        const key = await prov.getPubkey?.();
        if (key) setPubkey(key);
        setConnected(true);
      } catch (e) {
        console.error('No se pudo obtener pubkey', e);
      }
    });

    const unsubDis = onDisconnected(() => {
      setProvider(null);
      setPubkey(null);
      setConnected(false);
    });

    return () => {
      unsub?.();
      unsubDis?.();
    };
  }, []);

  const login = async () => {
    try {
      const prov = await requestProvider();
      (window as any).webln = prov;
      setProvider(prov);

      const key = await prov.getPubkey?.();
      if (key) setPubkey(key);
      setConnected(true);
    } catch (e) {
      console.error('Error al conectar', e);
    }
  };

  const logout = () => {
    setProvider(null);
    setPubkey(null);
    setConnected(false);
  };

  useEffect(() => {
    // check si ya hay conexión previa
    if ((window as any).webln) {
      setProvider((window as any).webln);
      (async () => {
        try {
          const key = await (window as any).webln.getPubkey?.();
          if (key) {
            setPubkey(key);
            setConnected(true);
          }
        } catch {}
      })();
    }
    setLoading(false);
  }, []);

  return {
    provider,
    pubkey,
    connected,
    loading,
    login,
    logout,
  };
}
