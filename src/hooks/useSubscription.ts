import { useState, useEffect, useRef, useCallback } from 'react';
import { LN, SATS } from '@getalby/sdk';
import { NWC_STRING } from '../lib/constants';

type Status = 'idle' | 'pending' | 'paid' | 'expired' | 'error';

export function useSubscription() {
  const [amount, setAmount] = useState(1);
  const [invoice, setInvoice] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  const lnRef = useRef<LN | null>(null);
  const unsubscribeRef = useRef<() => void>(() => {});

  useEffect(() => {
    lnRef.current = new LN(NWC_STRING);
    return () => {
      unsubscribeRef.current?.();
      lnRef.current?.close();
    };
  }, []);

  const checkPayment = async (invoice: string) => {
    try {
      const result = await lnRef.current?.nwcClient.lookupInvoice({ invoice });
      if (result?.state === 'settled') {
        setStatus('paid');
      }
    } catch (e) {
      console.warn('lookupInvoice fallback failed', e);
    }
  };

  const createInvoice = useCallback(async () => {
    if (!lnRef.current) return;

    setStatus('pending');
    setInvoice(null);

    try {
      const request = await lnRef.current.requestPayment(SATS(amount));
      const bolt11 = request.invoice.paymentRequest;

      setInvoice(bolt11);

      request
        .onPaid(() => {
          setStatus('paid');
        })
        .onTimeout(600, () => {
          setStatus('expired');
        });

      unsubscribeRef.current = () => request.unsubscribe?.();

      // fallback nostr-based lookup after delay
      setTimeout(() => checkPayment(bolt11), 10_000);
    } catch (e: any) {
      console.error('Error creando invoice:', e?.message);
      setStatus('error');
    }
  }, [amount]);

  return {
    amount,
    invoice,
    status,
    createInvoice,
  };
}
