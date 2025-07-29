import { useState, useEffect, useCallback } from 'react';
import { loadSettings, saveSettings } from '@/lib/storage';

interface MotionData {
  alpha: number;  // Z-axis rotation
  beta: number;   // X-axis rotation (forward/backward tilt)
  gamma: number;  // Y-axis rotation (left/right tilt)
}

type MotionCallback = () => void;
type MotionSensitivity = 'low' | 'medium' | 'high';

interface UseMotionSensorResult {
  motionData: MotionData | null;
  isSupported: boolean;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  onTiltForward: (callback: MotionCallback) => void;
  onTiltBackward: (callback: MotionCallback) => void;
  onTiltLeft: (callback: MotionCallback) => void;
  onTiltRight: (callback: MotionCallback) => void;
  cleanup: () => void;
  sensitivity: MotionSensitivity;
  setSensitivity: (sensitivity: MotionSensitivity) => void;
}

/**
 * Cihaz hareket sensörü hook'u
 * Telefon eğme hareketlerini algılar ve callback'leri tetikler
 */
export const useMotionSensor = (): UseMotionSensorResult => {
  const [motionData, setMotionData] = useState<MotionData | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [sensitivity, setSensitivity] = useState<MotionSensitivity>('medium');
  
  // Callback'ler
  const [forwardCallback, setForwardCallback] = useState<MotionCallback | null>(null);
  const [backwardCallback, setBackwardCallback] = useState<MotionCallback | null>(null);
  const [leftCallback, setLeftCallback] = useState<MotionCallback | null>(null);
  const [rightCallback, setRightCallback] = useState<MotionCallback | null>(null);

  // Veri yumuşatma için buffer
  const [motionBuffer, setMotionBuffer] = useState<MotionData[]>([]);
  const [lastTriggerTime, setLastTriggerTime] = useState(0);
  
  // Ayarlardan hassasiyet değerlerini al
  const getSensitivityThresholds = (sens: MotionSensitivity) => {
    switch (sens) {
      case 'low': return { threshold: 25, deadZone: 8 };
      case 'medium': return { threshold: 15, deadZone: 5 };
      case 'high': return { threshold: 10, deadZone: 3 };
    }
  };
  
  const { threshold: TILT_THRESHOLD, deadZone: DEAD_ZONE } = getSensitivityThresholds(sensitivity);
  const COOLDOWN_TIME = 800; // ms
  const BUFFER_SIZE = 3; // Yumuşatma için son 3 değeri sakla

  useEffect(() => {
    // Cihaz desteğini kontrol et
    setIsSupported('DeviceOrientationEvent' in window);
    
    // Kaydedilen ayarları yükle
    const settings = loadSettings();
    setSensitivity(settings.motionSensitivity);
  }, []);

  // Veri yumuşatma fonksiyonu
  const smoothMotionData = useCallback((newData: MotionData) => {
    setMotionBuffer(prevBuffer => {
      const updatedBuffer = [...prevBuffer, newData].slice(-BUFFER_SIZE);
      
      if (updatedBuffer.length === BUFFER_SIZE) {
        // Hareketli ortalama hesapla
        const smoothed = {
          alpha: updatedBuffer.reduce((sum, data) => sum + data.alpha, 0) / BUFFER_SIZE,
          beta: updatedBuffer.reduce((sum, data) => sum + data.beta, 0) / BUFFER_SIZE,
          gamma: updatedBuffer.reduce((sum, data) => sum + data.gamma, 0) / BUFFER_SIZE,
        };
        return updatedBuffer;
      }
      
      return updatedBuffer;
    });
  }, [BUFFER_SIZE]);

  // Titreşim geri bildirimi
  const triggerHapticFeedback = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  const handleDeviceOrientation = useCallback((event: DeviceOrientationEvent) => {
    const { alpha, beta, gamma } = event;
    
    if (alpha !== null && beta !== null && gamma !== null) {
      const newMotionData = { alpha, beta, gamma };
      setMotionData(newMotionData);
      smoothMotionData(newMotionData);

      // Cooldown kontrolü
      const now = Date.now();
      if (now - lastTriggerTime < COOLDOWN_TIME) {
        return;
      }

      // Dead zone kontrolü
      const isInDeadZone = Math.abs(beta) < DEAD_ZONE && Math.abs(gamma) < DEAD_ZONE;
      if (isInDeadZone) {
        return;
      }

      let actionTriggered = false;

      // İleri eğilme (ekran aşağı)
      if (beta > TILT_THRESHOLD && forwardCallback) {
        forwardCallback();
        actionTriggered = true;
      }
      
      // Geri eğilme (ekran yukarı)
      else if (beta < -TILT_THRESHOLD && backwardCallback) {
        backwardCallback();
        actionTriggered = true;
      }
      
      // Sağa eğilme
      else if (gamma > TILT_THRESHOLD && rightCallback) {
        rightCallback();
        actionTriggered = true;
      }
      
      // Sola eğilme  
      else if (gamma < -TILT_THRESHOLD && leftCallback) {
        leftCallback();
        actionTriggered = true;
      }

      if (actionTriggered) {
        setLastTriggerTime(now);
        triggerHapticFeedback();
      }
    }
  }, [forwardCallback, backwardCallback, leftCallback, rightCallback, lastTriggerTime, TILT_THRESHOLD, DEAD_ZONE, COOLDOWN_TIME, smoothMotionData, triggerHapticFeedback]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      // Ayarları güncelle - desteklenmiyor
      const settings = loadSettings();
      saveSettings({ ...settings, motionPermissionStatus: 'unsupported' });
      return false;
    }

    try {
      // iOS 13+ için özel izin isteği
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setHasPermission(true);
          window.addEventListener('deviceorientation', handleDeviceOrientation);
          
          // Ayarları güncelle
          const settings = loadSettings();
          saveSettings({ ...settings, motionPermissionStatus: 'granted' });
          return true;
        } else {
          // Ayarları güncelle - reddedildi
          const settings = loadSettings();
          saveSettings({ ...settings, motionPermissionStatus: 'denied' });
          return false;
        }
      } else {
        // Android ve eski tarayıcılar için
        setHasPermission(true);
        window.addEventListener('deviceorientation', handleDeviceOrientation);
        
        // Ayarları güncelle
        const settings = loadSettings();
        saveSettings({ ...settings, motionPermissionStatus: 'granted' });
        return true;
      }
    } catch (error) {
      console.error('Motion sensor permission error:', error);
      
      // Ayarları güncelle - hata
      const settings = loadSettings();
      saveSettings({ ...settings, motionPermissionStatus: 'denied' });
      return false;
    }
  }, [isSupported, handleDeviceOrientation]);

  const onTiltForward = useCallback((callback: MotionCallback) => {
    setForwardCallback(() => callback);
  }, []);

  const onTiltBackward = useCallback((callback: MotionCallback) => {
    setBackwardCallback(() => callback);
  }, []);

  const onTiltLeft = useCallback((callback: MotionCallback) => {
    setLeftCallback(() => callback);
  }, []);

  const onTiltRight = useCallback((callback: MotionCallback) => {
    setRightCallback(() => callback);
  }, []);

  const updateSensitivity = useCallback((newSensitivity: MotionSensitivity) => {
    setSensitivity(newSensitivity);
    
    // Ayarları kaydet
    const settings = loadSettings();
    saveSettings({ ...settings, motionSensitivity: newSensitivity });
  }, []);

  const cleanup = useCallback(() => {
    window.removeEventListener('deviceorientation', handleDeviceOrientation);
    setForwardCallback(null);
    setBackwardCallback(null);
    setLeftCallback(null);
    setRightCallback(null);
    setHasPermission(false);
  }, [handleDeviceOrientation]);

  return {
    motionData,
    isSupported,
    hasPermission,
    requestPermission,
    onTiltForward,
    onTiltBackward,
    onTiltLeft,
    onTiltRight,
    cleanup,
    sensitivity,
    setSensitivity: updateSensitivity
  };
};