import React, { useState, useEffect } from 'react';
import ReactQRCode from 'react-qr-code';
import { X, Mail, Key, Copy, CheckCircle, AlertCircle, Loader2, Shield, XCircle } from 'lucide-react';

import { useAlby } from '../hooks/useAlby';
import { useSubscription } from '../hooks/useSubscription';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: {
    id: string;
    title: string;
    creator: string;
    price: number; // in sats
    priceUSD: number;
    description: string;
  };
  initialTab?: 'email' | 'nostr';
  initialValues?: {
    email: string;
    nostr: string;
  };
}

interface FormData {
  email: string;
  nostrPubkey: string;
}

interface FormErrors {
  email?: string;
  nostrPubkey?: string;
  general?: string;
  validation?: string;
}

type CheckoutStep = 'validation' | 'form' | 'payment' | 'success';
type ContactTab = 'email' | 'nostr';

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  subscription,
  initialTab = 'email',
  initialValues = { email: '', nostr: '' },
}) => {
  const { formatSats, loading: albyLoading } = useAlby();
  const { amount, invoice, status, createInvoice } = useSubscription();

  console.log('status', status);

  // State management
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('validation');
  const [activeTab, setActiveTab] = useState<ContactTab>(initialTab);
  const [formData, setFormData] = useState<FormData>({
    email: initialValues.email || '',
    nostrPubkey: initialValues.nostr || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  // Development mode detection
  // const isDevelopment = process.env.NODE_ENV === 'development';

  // Reset state when modal opens/closes or when initial values change
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('validation');
      setActiveTab(initialTab);
      setFormData({
        email: initialValues.email || '',
        nostrPubkey: initialValues.nostr || '',
      });
      setErrors({});
      setCopied(false);
      setValidationResult(null);
    }
  }, [isOpen, subscription.id, initialTab, initialValues]);

  // Countdown timer for invoice expiration
  // useEffect(() => {
  //   if (timeLeft <= 0 || paymentStatus !== 'pending') return;

  //   const timer = setInterval(() => {
  //     setTimeLeft((prev) => {
  //       if (prev <= 1) {
  //         setPaymentStatus('expired');
  //         return 0;
  //       }
  //       return prev - 1;
  //     });
  //   }, 1000);

  //   return () => clearInterval(timer);
  // }, [timeLeft, paymentStatus]);

  // Handle payment status updates
  // const handlePaymentStatusChange = useCallback((status: any) => {
  //   if (status.status === 'settled') {
  //     setPaymentStatus('paid');
  //     setCurrentStep('success');
  //   } else if (status.status === 'failed') {
  //     setPaymentStatus('failed');
  //     setErrors({ general: status.failureReason || 'Payment failed' });
  //   } else if (status.status === 'expired') {
  //     setPaymentStatus('expired');
  //   }
  // }, []);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateNostrPubkey = (pubkey: string): boolean => {
    // npub format validation
    if (pubkey.startsWith('npub1')) {
      return pubkey.length === 63;
    }
    // hex format validation
    if (pubkey.length === 64) {
      return /^[0-9a-fA-F]{64}$/.test(pubkey);
    }
    return false;
  };

  const validateActiveTab = (): boolean => {
    const newErrors: FormErrors = {};

    if (activeTab === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
        setErrors(newErrors);
        return false;
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address (example@domain.com)';
        setErrors(newErrors);
        return false;
      }
    } else if (activeTab === 'nostr') {
      if (!formData.nostrPubkey.trim()) {
        newErrors.nostrPubkey = 'Nostr pubkey is required';
        setErrors(newErrors);
        return false;
      } else if (!validateNostrPubkey(formData.nostrPubkey)) {
        newErrors.nostrPubkey = 'Please enter a valid Nostr pubkey (npub1... format)';
        setErrors(newErrors);
        return false;
      }
    }

    setErrors({});
    return true;
  };

  // Real-time validation
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear errors as user types for the active tab only
    if (field === 'email' && activeTab === 'email') {
      setErrors((prev) => ({ ...prev, email: undefined }));
    } else if (field === 'nostrPubkey' && activeTab === 'nostr') {
      setErrors((prev) => ({ ...prev, nostrPubkey: undefined }));
    }
  };

  // Handle tab switching
  const handleTabSwitch = (tab: ContactTab) => {
    setActiveTab(tab);
    setErrors({}); // Clear all errors when switching tabs
  };

  // Step 1: Validate subscription eligibility
  const handleValidateSubscription = async () => {
    if (!validateActiveTab()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // TO-DO: SAVE CONTACT
      // const contactValue = activeTab === 'email' ? formData.email : formData.nostrPubkey;

      await createInvoice();
      setCurrentStep('payment');
    } catch (error) {
      console.error('❌ Validation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Validation failed';
      setErrors({ validation: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Form submission
  // const handleFormSubmit = async (e?: React.FormEvent) => {
  //   if (e) e.preventDefault();

  //   if (!validateActiveTab()) {
  //     return;
  //   }

  //   setLoading(true);
  //   setErrors({});

  //   try {
  //     console.log('🔄 Creating invoice for subscription:', subscription.id);

  //     // Check if wallet is connected
  //     if (!isConnected) {
  //       throw new Error('No wallet connected. Please connect your Lightning wallet first.');
  //     }

  //     const invoiceRequest = {
  //       amount: subscription.price,
  //       description: `${subscription.title} - Monthly subscription`,
  //       expirySeconds: 1800, // 30 minutes
  //       payerData: {
  //         contactType: activeTab,
  //         contactValue: activeTab === 'email' ? formData.email : formData.nostrPubkey,
  //         ...(activeTab === 'email' && { email: formData.email }),
  //         ...(activeTab === 'nostr' && { nostrPubkey: formData.nostrPubkey }),
  //         subscriptionId: subscription.id,
  //         timestamp: Date.now(),
  //       },
  //     };

  //     let invoiceResponse;

  //     invoiceResponse = await createInvoice(invoiceRequest, {
  //       onPaymentStatusChange: handlePaymentStatusChange,
  //       monitorPayment: true,
  //     });

  //     if (invoiceResponse) {
  //       setInvoice(invoiceResponse);
  //       setTimeLeft(1800); // 30 minutes
  //       setCurrentStep('payment');
  //       console.log('✅ Invoice created successfully:', invoiceResponse);
  //     } else {
  //       throw new Error('Failed to create invoice');
  //     }
  //   } catch (error) {
  //     console.error('❌ Invoice creation failed:', error);
  //     const errorMessage = error instanceof Error ? error.message : 'Failed to create payment invoice';
  //     setErrors({ general: errorMessage });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Development: Simulate payment
  // const simulatePayment = async (success: boolean = true) => {
  //   if (!isDevelopment || !invoice) return;

  //   console.log(`🧪 Simulating ${success ? 'successful' : 'failed'} payment...`);

  //   setLoading(true);

  //   // Simulate network delay
  //   await new Promise((resolve) => setTimeout(resolve, 2000));

  //   if (success) {
  //     setPaymentStatus('paid');
  //     setCurrentStep('success');
  //     console.log('✅ Payment simulation successful');
  //   } else {
  //     setPaymentStatus('failed');
  //     setErrors({ general: 'Simulated payment failure for testing' });
  //     console.log('❌ Payment simulation failed');
  //   }

  //   setLoading(false);
  // };

  // Format time remaining
  // const formatTime = (seconds: number): string => {
  //   const minutes = Math.floor(seconds / 60);
  //   const remainingSeconds = seconds % 60;
  //   return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  // };

  // Handle modal close
  const handleClose = () => {
    if (currentStep === 'payment' && status === 'pending') {
      // Warn user about pending payment
      if (window.confirm('You have a pending payment. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Retry payment
  // const handleRetry = () => {
  //   // Stop payment monitoring if active
  //   if (invoice?.paymentHash) {
  //     stopPaymentMonitoring(invoice.paymentHash);
  //   }

  //   setCurrentStep('validation');
  //   setPaymentStatus('pending');
  //   setErrors({});
  //   setTimeLeft(0);
  //   setValidationResult(null);
  // };

  if (!isOpen) return null;

  return (
    <div className='fixed z-50 inset-0 flex items-end justify-center p-4 pb-12 bg-black bg-opacity-80 backdrop-blur-md'>
      <div className='bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>Subscribe to v2</h2>
            {/* <p className='text-gray-600'>{subscription.title}</p> */}
          </div>
          <button
            onClick={handleClose}
            className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          {/* Subscription Summary */}
          {/* <div className='bg-gray-50 rounded-lg p-4 mb-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='font-semibold text-gray-900'>{subscription.title}</h3>
                <p className='text-sm text-gray-600'>by {subscription.creator}</p>
              </div>
              <div className='text-right'>
                <div className='text-xl font-bold text-gray-900'>{formatSats(subscription.price)} sats</div>
                <div className='text-sm text-gray-600'>≈ ${subscription.priceUSD} USD/month</div>
              </div>
            </div>
          </div> */}

          {/* Step 1: Contact Form with Tabs */}
          {status === 'idle' && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>Contact Information</h3>
                {/* <p className='text-gray-600 mb-6'>Choose how you'd like to receive your subscription content.</p> */}
              </div>

              {errors.validation && (
                <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
                  <div className='flex items-start space-x-3'>
                    <XCircle className='w-5 h-5 text-red-600 mt-0.5' />
                    <div>
                      <h4 className='font-medium text-red-900'>Cannot Subscribe</h4>
                      <p className='text-red-800 text-sm mt-1'>{errors.validation}</p>
                      {validationResult?.activeSubscription && (
                        <div className='mt-3 p-3 bg-red-100 rounded-lg'>
                          <p className='text-red-800 text-sm font-medium'>Current Active Subscription:</p>
                          <p className='text-red-700 text-sm'>
                            Started: {new Date(validationResult.activeSubscription.subscribedAt).toLocaleDateString()}
                          </p>
                          <p className='text-red-700 text-sm'>
                            Expires: {new Date(validationResult.activeSubscription.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {errors.general && (
                <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
                  <div className='flex items-center space-x-2'>
                    <AlertCircle className='w-5 h-5 text-red-600' />
                    <span className='text-red-800 text-sm'>{errors.general}</span>
                  </div>
                </div>
              )}

              {/* Tab Selector */}
              <div className='mb-6'>
                <div className='grid grid-cols-2 gap-3'>
                  <button
                    type='button'
                    onClick={() => handleTabSwitch('email')}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      activeTab === 'email'
                        ? 'border-bitcoin-500 bg-bitcoin-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Mail className='w-6 h-6 text-bitcoin-600 mb-2' />
                    <div className='font-medium text-gray-900'>Email</div>
                    {/* <div className='text-sm text-gray-600'>Receive via email</div> */}
                  </button>

                  <button
                    type='button'
                    onClick={() => handleTabSwitch('nostr')}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      activeTab === 'nostr'
                        ? 'border-bitcoin-500 bg-bitcoin-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Key className='w-6 h-6 text-bitcoin-600 mb-2' />
                    <div className='font-medium text-gray-900'>Nostr</div>
                    {/* <div className='text-sm text-gray-600'>Decentralized messages</div> */}
                  </button>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleValidateSubscription();
                }}
                className='space-y-6'
              >
                {/* Email Tab Content */}
                {activeTab === 'email' && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Email Address *</label>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                      <input
                        type='email'
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-bitcoin-500 focus:border-transparent ${
                          errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder='example@domain.com'
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className='mt-1 text-sm text-red-600 flex items-center'>
                        <AlertCircle className='w-4 h-4 mr-1' />
                        {errors.email}
                      </p>
                    )}
                    <p className='mt-1 text-sm text-gray-500'>Used for subscription delivery and validation</p>
                  </div>
                )}

                {/* Nostr Tab Content */}
                {activeTab === 'nostr' && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Nostr Public Key *</label>
                    <div className='relative'>
                      <Key className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                      <input
                        type='text'
                        value={formData.nostrPubkey}
                        onChange={(e) => handleInputChange('nostrPubkey', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-bitcoin-500 focus:border-transparent font-mono text-sm ${
                          errors.nostrPubkey ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder='npub1...'
                        required
                      />
                    </div>
                    {errors.nostrPubkey && (
                      <p className='mt-1 text-sm text-red-600 flex items-center'>
                        <AlertCircle className='w-4 h-4 mr-1' />
                        {errors.nostrPubkey}
                      </p>
                    )}
                    <p className='mt-1 text-sm text-gray-500'>
                      Your Nostr public key for decentralized content delivery
                    </p>
                  </div>
                )}

                <button
                  type='submit'
                  disabled={loading || albyLoading}
                  className='w-full flex items-center justify-center space-x-2 bg-bitcoin-500 hover:bg-bitcoin-600 disabled:bg-bitcoin-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors'
                >
                  {loading ? (
                    <>
                      <Loader2 className='w-5 h-5 animate-spin' />
                      <span>Validating...</span>
                    </>
                  ) : (
                    <>
                      <Shield className='w-5 h-5' />
                      <span>Validate & Continue</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Payment */}
          {status === 'pending' && invoice && (
            <div className='space-y-6'>
              {/* <div className='text-center'>
                <div className='w-16 h-16 bg-lightning-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Zap className='w-8 h-8 text-lightning-600' />
                </div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>Complete Your Payment</h3>
                <p className='text-gray-600'>Scan the QR code or copy the Lightning invoice to pay</p>
              </div> */}

              {/* Payment Status */}
              {/* <div
                className={`p-4 rounded-lg border ${
                  paymentStatus === 'pending'
                    ? 'bg-lightning-50 border-lightning-200'
                    : paymentStatus === 'error'
                    ? 'bg-red-50 border-red-200'
                    : paymentStatus === 'expired'
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className='flex items-center space-x-3'>
                  {paymentStatus === 'pending' && (
                    <>
                      <Clock className='w-5 h-5 text-lightning-600 animate-pulse' />
                      <div>
                        <div className='font-medium text-gray-900'>Waiting for payment...</div>
                        <div className='text-sm text-gray-600'>
                          Time remaining: <span className='font-mono font-bold'>{formatTime(timeLeft)}</span>
                        </div>
                      </div>
                    </>
                  )}
                  {paymentStatus === 'error' && (
                    <>
                      <AlertCircle className='w-5 h-5 text-red-600' />
                      <div>
                        <div className='font-medium text-red-900'>Payment Failed</div>
                        <div className='text-sm text-red-700'>{errors.general}</div>
                      </div>
                    </>
                  )}
                  {paymentStatus === 'expired' && (
                    <>
                      <Clock className='w-5 h-5 text-gray-600' />
                      <div>
                        <div className='font-medium text-gray-900'>Invoice Expired</div>
                        <div className='text-sm text-gray-600'>Please create a new payment</div>
                      </div>
                    </>
                  )}
                </div>
              </div> */}

              {status === 'pending' && (
                <>
                  {/* QR Code */}
                  {invoice && (
                    <div className='w-full max-w-md mx-auto px-4'>
                      <div className='mb-6'>
                        <div className='w-full flex justify-center'>
                          <ReactQRCode value={invoice} size={280} fgColor={'#000'} bgColor={'#fff'} />
                        </div>
                      </div>

                      <div className='flex-1 flex flex-col items-center text-center w-full px-4'>
                        <div className='flex items-center gap-2 text-gray-500 mb-2'>
                          <span>Waiting for payment</span>
                        </div>

                        <div className='text-3xl mb-2'>
                          <b>{amount}</b> {'SAT'}
                        </div>

                        {/* <div className='flex items-center gap-2 text-lg text-gray-600'>
                          <span>~</span>
                          {amount}
                          <span>USD</span>
                        </div> */}
                      </div>
                    </div>
                  )}

                  {/* Invoice String */}
                  <button
                    onClick={() => copyToClipboard(invoice)}
                    className='w-full flex-1 flex items-center justify-center space-x-2 bg-lightning-500 hover:bg-lightning-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors'
                  >
                    {copied ? (
                      <>
                        <CheckCircle className='w-4 h-4' />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className='w-4 h-4' />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {/* Action Buttons */}
                  {/* <div className='flex space-x-3'>
                    <button
                      onClick={() => window.open(`lightning:${invoice}`, '_blank')}
                      className='flex-1 flex items-center justify-center space-x-2 bg-lightning-500 hover:bg-lightning-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors'
                    >
                      <ExternalLink className='w-4 h-4' />
                      <span>Open in Wallet</span>
                    </button>

                    <button
                      onClick={() => copyToClipboard(invoice)}
                      className='flex items-center justify-center space-x-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors'
                    >
                      <QrCode className='w-4 h-4' />
                      <span>Share</span>
                    </button>
                  </div> */}

                  {/* Development Mode: Simulate Payment */}
                  {/* {isDevelopment && (
                    <div className='border-t border-gray-200 pt-6'>
                      <div className='bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4'>
                        <div className='flex items-center space-x-2 mb-2'>
                          <PlayCircle className='w-5 h-5 text-amber-600' />
                          <span className='font-medium text-amber-900'>Development Mode</span>
                        </div>
                        <p className='text-sm text-amber-800'>
                          Use these buttons to simulate payment scenarios for testing.
                        </p>
                      </div>

                      <div className='flex space-x-3'>
                        <button
                          onClick={() => simulatePayment(true)}
                          disabled={loading}
                          className='flex-1 flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors'
                        >
                          {loading ? <Loader2 className='w-4 h-4 animate-spin' /> : <CheckCircle className='w-4 h-4' />}
                          <span>Simulate Success</span>
                        </button>

                        <button
                          onClick={() => simulatePayment(false)}
                          disabled={loading}
                          className='flex-1 flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors'
                        >
                          {loading ? <Loader2 className='w-4 h-4 animate-spin' /> : <AlertCircle className='w-4 h-4' />}
                          <span>Simulate Failure</span>
                        </button>
                      </div>
                    </div>
                  )} */}
                </>
              )}

              {/* Retry Button for Failed/Expired */}
              {/* {(paymentStatus === 'failed' || paymentStatus === 'expired') && (
                <button
                  onClick={handleRetry}
                  className='w-full flex items-center justify-center space-x-2 bg-bitcoin-500 hover:bg-bitcoin-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors'
                >
                  <RefreshCw className='w-5 h-5' />
                  <span>Try Again</span>
                </button>
              )} */}
            </div>
          )}

          {/* Step 4: Success */}
          {status === 'paid' && (
            <div className='text-center space-y-6'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
                <CheckCircle className='w-8 h-8 text-green-600' />
              </div>

              <div>
                <h3 className='text-2xl font-bold text-gray-900 mb-2'>Payment Successful!</h3>
                <p className='text-gray-600'>Your subscription to {subscription.title} has been activated.</p>
              </div>

              <div className='bg-green-50 rounded-lg p-6'>
                <h4 className='font-semibold text-gray-900 mb-4'>Subscription Details:</h4>
                <div className='space-y-2 text-sm text-gray-700'>
                  <div className='flex justify-between'>
                    <span>Subscription:</span>
                    <span>{subscription.title}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Creator:</span>
                    <span>{subscription.creator}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Amount Paid:</span>
                    <span>{formatSats(subscription.price)} sats</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Contact Method:</span>
                    <span>{activeTab === 'email' ? 'Email' : 'Nostr'}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Contact:</span>
                    <span className='font-mono text-xs'>
                      {activeTab === 'email' ? formData.email : formData.nostrPubkey.substring(0, 16) + '...'}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Next Payment:</span>
                    <span>{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className='space-y-3'>
                <button
                  onClick={onClose}
                  className='w-full bg-bitcoin-500 hover:bg-bitcoin-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors'
                >
                  Close
                </button>

                <p className='text-sm text-gray-500'>You'll receive your first content delivery within 24 hours.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
