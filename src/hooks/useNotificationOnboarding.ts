import { useEffect, useState, useCallback } from 'react';

interface Params {
  permission: NotificationPermission;
  notificationsEnabled: boolean;
  notificationPrompted: boolean;
  setNotificationPrompted: (v: boolean) => void;
  requestPermission: () => Promise<NotificationPermission>;
  onGranted: () => void; // called when permission granted (enable local toggle outside)
}

interface ReturnType {
  showBanner: boolean;
  dismissBanner: () => void;
  handleBannerEnable: () => Promise<void>;
  showPostStartPrompt: boolean;
  triggerPostStartPrompt: () => void;
  closePostStartPrompt: () => void;
  handlePostStartEnable: () => Promise<void>;
}

export function useNotificationOnboarding({
  permission,
  notificationsEnabled,
  notificationPrompted,
  setNotificationPrompted,
  requestPermission,
  onGranted
}: Params): ReturnType {
  const [showBanner, setShowBanner] = useState(false);
  const [showPostStartPrompt, setShowPostStartPrompt] = useState(false);

  // Banner visibility logic
  useEffect(() => {
    if (permission === 'default' && !notificationsEnabled && !notificationPrompted) {
      const timer = setTimeout(() => setShowBanner(true), 1200);
      return () => clearTimeout(timer);
    } else {
      setShowBanner(false);
    }
  }, [permission, notificationsEnabled, notificationPrompted]);

  const dismissBanner = useCallback(() => {
    setNotificationPrompted(true);
    setShowBanner(false);
  }, [setNotificationPrompted]);

  const handleBannerEnable = useCallback(async () => {
    const result = await requestPermission();
    setNotificationPrompted(true);
    setShowBanner(false);
    if (result === 'granted') {
      onGranted();
    }
  }, [requestPermission, setNotificationPrompted, onGranted]);

  const triggerPostStartPrompt = useCallback(() => {
    if (!notificationsEnabled && !notificationPrompted) {
      setTimeout(() => setShowPostStartPrompt(true), 400);
    }
  }, [notificationsEnabled, notificationPrompted]);

  const closePostStartPrompt = useCallback(() => {
    setNotificationPrompted(true);
    setShowPostStartPrompt(false);
  }, [setNotificationPrompted]);

  const handlePostStartEnable = useCallback(async () => {
    const result = await requestPermission();
    setNotificationPrompted(true);
    setShowPostStartPrompt(false);
    if (result === 'granted') {
      onGranted();
    }
  }, [requestPermission, onGranted, setNotificationPrompted]);

  return {
    showBanner,
    dismissBanner,
    handleBannerEnable,
    showPostStartPrompt,
    triggerPostStartPrompt,
    closePostStartPrompt,
    handlePostStartEnable
  };
}
