import React, { useState } from 'react';
import { Zap, Users, Calendar, ArrowRight, Shield } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import MainPageHeader from './MainPageHeader';
import CheckoutModal from './CheckoutModal';

import { MOCK_SUBSCRIPTION } from '../lib/constants';

const HomePage: React.FC = () => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<'email' | 'nostr'>('email');
  const [initialValues, setInitialValues] = useState({
    email: '',
    nostr: '',
  });

  // const { name, amountSat, invoice, paymentStatus, error, editSubscription, createInvoice, checkPaymentStatus } =
  //   useNwcSubscription(nwcString);

  // Handle URL parameters on component mount
  // useEffect(() => {
  //   const urlParams = new URLSearchParams(window.location.search);

  //   // Check if modal should be opened
  //   const openModal = urlParams.get('subscribe');
  //   if (openModal === 'true') {
  //     setIsCheckoutOpen(true);
  //   }

  //   // Check for tab selection
  //   const tab = urlParams.get('tab');
  //   if (tab === 'email' || tab === 'nostr') {
  //     setInitialTab(tab);
  //   }

  //   // Check for email value
  //   const email = urlParams.get('email');
  //   if (email) {
  //     setInitialValues((prev) => ({ ...prev, email: decodeURIComponent(email) }));
  //     setInitialTab('email'); // Auto-select email tab if email is provided
  //   }

  //   // Check for nostr value
  //   const nostr = urlParams.get('nostr');
  //   if (nostr) {
  //     setInitialValues((prev) => ({ ...prev, nostr: decodeURIComponent(nostr) }));
  //     setInitialTab('nostr'); // Auto-select nostr tab if nostr is provided
  //   }

  //   // Clean URL after processing parameters (optional)
  //   if (urlParams.toString()) {
  //     const cleanUrl = window.location.pathname;
  //     window.history.replaceState({}, document.title, cleanUrl);
  //   }
  // }, []);

  // const formatSats = (sats: number) => {
  //   return new Intl.NumberFormat('es-ES').format(sats);
  // };

  const handleSubscribeClick = () => {
    setIsCheckoutOpen(true);
  };

  const handleModalClose = () => {
    setIsCheckoutOpen(false);
    // Reset initial values when modal closes
    setInitialValues({ email: '', nostr: '' });
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Use the new MainPageHeader */}
      <MainPageHeader />

      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        {/* Featured Badge */}
        <div className='text-center mb-6'>
          <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-bitcoin-100 text-bitcoin-800'>
            <svg className='w-4 h-4 mr-1' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
            </svg>
            Suscripción Destacada
          </span>
        </div>

        {/* Cover Image */}
        <div className='relative rounded-2xl overflow-hidden mb-8'>
          <img
            src={MOCK_SUBSCRIPTION.coverImage}
            alt={MOCK_SUBSCRIPTION.title}
            className='w-full h-64 md:h-80 object-cover'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />
          <div className='absolute bottom-6 left-6 text-white'>
            <h1 className='text-3xl md:text-4xl font-bold mb-2'>{MOCK_SUBSCRIPTION.title}</h1>
            <p className='text-white/90'>por {MOCK_SUBSCRIPTION.creator.name}</p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2'>
            {/* Creator Info */}
            <div className='flex items-center space-x-4 mb-6'>
              <img
                src={MOCK_SUBSCRIPTION.creator.avatar}
                alt={MOCK_SUBSCRIPTION.creator.name}
                className='w-12 h-12 rounded-full'
              />
              <div>
                <h2 className='font-semibold text-gray-900'>{MOCK_SUBSCRIPTION.creator.name}</h2>
                <p className='text-gray-600 text-sm'>@{MOCK_SUBSCRIPTION.creator.username}</p>
              </div>
            </div>

            {/* Introduction with Markdown */}
            <div className='mb-8 prose prose-lg max-w-none'>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className='markdown-content'
                components={{
                  p: ({ node, ...props }) => <p className='text-gray-700 text-lg leading-relaxed' {...props} />,
                  strong: ({ node, ...props }) => <strong className='font-bold text-gray-900' {...props} />,
                  em: ({ node, ...props }) => <em className='italic text-gray-700' {...props} />,
                  del: ({ node, ...props }) => <del className='line-through text-gray-500' {...props} />,
                  a: ({ node, ...props }) => (
                    <a className='text-bitcoin-600 hover:text-bitcoin-700 underline' {...props} />
                  ),
                }}
              >
                {MOCK_SUBSCRIPTION.intro}
              </ReactMarkdown>
            </div>

            {/* Description with Markdown */}
            <div className='mb-8 prose prose-lg max-w-none'>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className='markdown-content'
                components={{
                  h2: ({ node, ...props }) => (
                    <h2 className='text-xl font-semibold text-gray-900 mb-4 mt-6' {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className='text-lg font-semibold text-gray-900 mb-3 mt-5' {...props} />
                  ),
                  p: ({ node, ...props }) => <p className='text-gray-700 mb-4' {...props} />,
                  ul: ({ node, ...props }) => <ul className='list-disc pl-6 mb-4 space-y-2' {...props} />,
                  ol: ({ node, ...props }) => <ol className='list-decimal pl-6 mb-4 space-y-2' {...props} />,
                  li: ({ node, ...props }) => <li className='text-gray-700' {...props} />,
                  strong: ({ node, ...props }) => <strong className='font-semibold' {...props} />,
                  em: ({ node, ...props }) => <em className='italic' {...props} />,
                  a: ({ node, ...props }) => (
                    <a className='text-bitcoin-600 hover:text-bitcoin-700 underline' {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className='border-l-4 border-gray-200 pl-4 italic text-gray-600 my-4' {...props} />
                  ),
                  code: ({ node, ...props }) => (
                    <code className='bg-gray-100 rounded px-1 py-0.5 font-mono text-sm' {...props} />
                  ),
                  pre: ({ node, ...props }) => (
                    <pre className='bg-gray-100 rounded p-4 overflow-x-auto my-4 font-mono text-sm' {...props} />
                  ),
                }}
              >
                {MOCK_SUBSCRIPTION.description}
              </ReactMarkdown>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-2 md:grid-cols-3 gap-6 mb-8'>
              <div className='text-center p-4 bg-white rounded-lg border border-gray-200'>
                <Users className='w-6 h-6 text-bitcoin-600 mx-auto mb-2' />
                <div className='text-2xl font-bold text-gray-900'>{MOCK_SUBSCRIPTION.creator.subscribers}</div>
                <div className='text-sm text-gray-600'>Suscriptores</div>
              </div>

              <div className='text-center p-4 bg-white rounded-lg border border-gray-200'>
                <Calendar className='w-6 h-6 text-bitcoin-600 mx-auto mb-2' />
                <div className='text-2xl font-bold text-gray-900'>1x</div>
                <div className='text-sm text-gray-600'>Por semana</div>
              </div>

              <div className='text-center p-4 bg-white rounded-lg border border-gray-200'>
                <Shield className='w-6 h-6 text-bitcoin-600 mx-auto mb-2' />
                <div className='text-2xl font-bold text-gray-900'>100%</div>
                <div className='text-sm text-gray-600'>Seguro</div>
              </div>
            </div>
          </div>

          {/* Subscription Card */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-8'>
              <div className='text-center mb-6'>
                <div className='flex items-center justify-center space-x-2 mb-2'>
                  <Zap className='w-6 h-6 text-lightning-500' />
                  <span className='text-3xl font-bold text-gray-900'>{MOCK_SUBSCRIPTION.price}</span>
                  <span className='text-gray-600'>sats</span>
                </div>
              </div>

              <button
                onClick={handleSubscribeClick}
                className='w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-bitcoin-500 to-lightning-500 hover:from-bitcoin-600 hover:to-lightning-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 mb-4'
              >
                <span>Suscribirse Ahora</span>
                <ArrowRight className='w-5 h-5' />
              </button>

              <div className='text-center'>
                <p className='text-sm text-gray-600'>Cancela en cualquier momento</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className='mt-12 bg-gradient-to-r from-bitcoin-50 to-lightning-50 rounded-2xl p-8'>
          <div className='text-center mb-6'>
            <h3 className='text-2xl font-bold text-gray-900 mb-2'>¿Por qué elegir BitSub?</h3>
            <p className='text-gray-600'>La forma más segura y descentralizada de gestionar suscripciones</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='text-center'>
              <div className='w-12 h-12 bg-bitcoin-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                <Shield className='w-6 h-6 text-bitcoin-600' />
              </div>
              <h4 className='font-semibold text-gray-900 mb-2'>100% Descentralizado</h4>
              <p className='text-gray-600 text-sm'>Sin intermediarios. Tus pagos van directamente al creador.</p>
            </div>

            <div className='text-center'>
              <div className='w-12 h-12 bg-lightning-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                <Zap className='w-6 h-6 text-lightning-600' />
              </div>
              <h4 className='font-semibold text-gray-900 mb-2'>Pagos Instantáneos</h4>
              <p className='text-gray-600 text-sm'>Confirmación inmediata con Bitcoin Lightning Network.</p>
            </div>

            <div className='text-center'>
              <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                <Users className='w-6 h-6 text-green-600' />
              </div>
              <h4 className='font-semibold text-gray-900 mb-2'>Sin KYC</h4>
              <p className='text-gray-600 text-sm'>Privacidad total. Solo necesitas email o tu pubkey de Nostr.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={handleModalClose}
        subscription={{
          id: MOCK_SUBSCRIPTION.id,
          title: MOCK_SUBSCRIPTION.title,
          creator: MOCK_SUBSCRIPTION.creator.name,
          price: MOCK_SUBSCRIPTION.price,
          priceUSD: MOCK_SUBSCRIPTION.priceUSD,
          description: MOCK_SUBSCRIPTION.description,
        }}
        initialTab={initialTab}
        initialValues={initialValues}
      />
    </div>
  );
};

export default HomePage;
