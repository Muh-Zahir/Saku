'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, Check } from 'lucide-react';

export default function PwaInstallPrompt({ addToast, hideWhenModalOpen = false }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker with readyState check
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSw = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registered successfully with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      };

      if (document.readyState === 'complete') {
        registerSw();
      } else {
        window.addEventListener('load', registerSw);
      }
    }

    // 2. Check if already running in standalone mode (installed PWA)
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);

      const mediaQuery = window.matchMedia('(display-mode: standalone)');
      const handleModeChange = (e) => setIsStandalone(e.matches);
      mediaQuery.addEventListener?.('change', handleModeChange);
    }

    // 3. Listen for Chrome / Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent automatic mini-infobar
      e.preventDefault();
      // Store event
      setDeferredPrompt(e);

      // Check if user dismissed recently
      const dismissedUntil = localStorage.getItem('saku_pwa_banner_dismissed_until');
      if (!dismissedUntil || Date.now() > parseInt(dismissedUntil, 10)) {
        // Show install banner after 1.5 second polite delay
        const timer = setTimeout(() => {
          setShowBanner(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Listen for successful install
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowBanner(false);
      setIsStandalone(true);
      if (addToast) {
        addToast('Saku berhasil dipasang di layar utama! 🎉');
      }
      localStorage.setItem('saku_pwa_installed', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [addToast]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (addToast) {
        addToast('Buka menu titik 3 Chrome lalu pilih "Install aplikasi" atau "Tambahkan ke Layar Utama"');
      }
      return;
    }

    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        if (addToast) {
          addToast('Memasang Saku ke layar utama...');
        }
        setShowBanner(false);
      }
    } catch (err) {
      console.error('[PWA] Error during install prompt:', err);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  };

  // Expose global trigger for menu items
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__triggerPwaInstall = () => {
        if (deferredPrompt) {
          handleInstallClick();
        } else {
          if (addToast) {
            addToast('Untuk memasang di HP: Buka menu Chrome (titik 3 di kanan atas) lalu pilih "Install aplikasi" atau "Tambahkan ke Layar Utama"');
          }
        }
      };
    }
  }, [deferredPrompt, addToast]);

  const handleDismissBanner = () => {
    setShowBanner(false);
    // Dismiss for 3 days
    const threeDaysLater = Date.now() + 3 * 24 * 60 * 60 * 1000;
    localStorage.setItem('saku_pwa_banner_dismissed_until', threeDaysLater.toString());
  };

  if (isStandalone || !showBanner || !deferredPrompt || hideWhenModalOpen) {
    return null;
  }

  return (
    <div className="pwa-install-banner-wrap" role="alert" aria-live="polite">
      <div className="pwa-install-banner">
        <div className="pwa-install-left">
          <div className="pwa-app-icon">
            <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="14" fill="#134e3f"/>
              <circle cx="24" cy="24" r="13" stroke="#2dd4bf" stroke-width="2.5" opacity="0.4"/>
              <path d="M19 28C19 23.0294 23.0294 19 28 19C28 23.9706 23.9706 28 19 28Z" fill="#34d399"/>
              <path d="M23 19C23 15.134 26.134 12 30 12C30 15.866 26.866 19 23 19Z" fill="#a7f3d0"/>
              <path d="M17 26V30C17 31.6569 18.3431 33 20 33H27" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div className="pwa-install-text">
            <div className="pwa-install-title">
              Pasang Aplikasi Saku
              <span className="pwa-badge">Resmi</span>
            </div>
            <p className="pwa-install-desc">
              Akses cepat tanpa browser & pengingat notifikasi otomatis.
            </p>
          </div>
        </div>

        <div className="pwa-install-actions">
          <button
            className="pwa-install-btn"
            onClick={handleInstallClick}
            disabled={isInstalling}
          >
            <Download size={15} />
            {isInstalling ? 'Memasang...' : 'Pasang'}
          </button>
          <button
            className="pwa-dismiss-btn"
            onClick={handleDismissBanner}
            aria-label="Tutup saran pemasangan"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
