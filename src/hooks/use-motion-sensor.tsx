import { useState, useEffect, useCallback, useRef } from 'react';
import { loadSettings, saveSettings } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';

interface MotionData {
  alpha: number;  // Z-axis rotation
  beta: number;   // X-axis rotation (forward/backward tilt)
  gamma: number;  // Y-axis rotation (left/right tilt)
}

// iOS DeviceOrientationEvent interface extension
interface DeviceOrientationEventIOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
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
 * iOS 13+ uyumlu, memory leak safe
 */
export const useMotionSensor = (): UseMotionSensorResult => {
  const [motionData, setMotionData] = useState<MotionData | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [sensitivity, setSensitivity] = useState<MotionSensitivity>('medium');
  
  // useRef ile callback'leri yönet - re-render'larda kaybolmasın
  const forwardCallback = useRef<MotionCallback | null>(null);
  const backwardCallback = useRef<MotionCallback | null>(null);
  const leftCallback = useRef<MotionCallback | null>(null);
  const rightCallback = useRef<MotionCallback | null>(null);

  // Veri yumuşatma için buffer
  const [motionBuffer, setMotionBuffer] = useState<MotionData[]>([]);
  const [lastTriggerTime, setLastTriggerTime] = useState(0);
  
  // Event listener referansı - cleanup için
  const deviceOrientationHandler = useRef<((event: DeviceOrientationEvent) => void) | null>(null);
  
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

  // İlk yükleme: cihaz desteği ve kaydedilen ayarları kontrol et
  useEffect(() => {
    // Cihaz desteğini kontrol et
    const supported = 'DeviceOrientationEvent' in window;
    setIsSupported(supported);
    
    // Kaydedilen ayarları yükle
    const settings = loadSettings();
    setSensitivity(settings.motionSensitivity || 'medium');
    
    // Önceki permission durumunu yükle
    if (supported && settings.motionPermissionStatus === 'granted') {
      setHasPermission(true);
    }
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

  // Device orientation handler - memoized
  const createDeviceOrientationHandler = useCallback(() => {
    return (event: DeviceOrientationEvent) => {
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
        if (beta > TILT_THRESHOLD && forwardCallback.current) {
          forwardCallback.current();
          actionTriggered = true;
        }
        
        // Geri eğilme (ekran yukarı)
        else if (beta < -TILT_THRESHOLD && backwardCallback.current) {
          backwardCallback.current();
          actionTriggered = true;
        }
        
        // Sağa eğilme
        else if (gamma > TILT_THRESHOLD && rightCallback.current) {
          rightCallback.current();
          actionTriggered = true;
        }
        
        // Sola eğilme  
        else if (gamma < -TILT_THRESHOLD && leftCallback.current) {
          leftCallback.current();
          actionTriggered = true;
        }

        if (actionTriggered) {
          setLastTriggerTime(now);
          triggerHapticFeedback();
        }
      }
    };
  }, [lastTriggerTime, TILT_THRESHOLD, DEAD_ZONE, COOLDOWN_TIME, smoothMotionData, triggerHapticFeedback]);

  // İzin isteme fonksiyonu - kritik düzeltme: kullanıcı eylemi kontekstinde çağrılmalı
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      // Ayarları güncelle - desteklenmiyor
      const settings = loadSettings();
      saveSettings({ ...settings, motionPermissionStatus: 'unsupported' });
      
      toast({
        title: "Hareket Sensörü Desteklenmiyor",
        description: "Bu cihaz hareket sensörünü desteklemiyor. Buton kontrolü kullanılacak.",
        variant: "destructive"
      });
      
      return false;
    }

    // Eğer zaten izin varsa event listener'ı başlat
    if (hasPermission && !deviceOrientationHandler.current) {
      const handler = createDeviceOrientationHandler();
      deviceOrientationHandler.current = handler;
      window.addEventListener('deviceorientation', handler);
      return true;
    }

    try {
      // iOS 13+ için özel izin isteği
      const deviceOrientationEvent = DeviceOrientationEvent as unknown as DeviceOrientationEventIOS;
      if (typeof deviceOrientationEvent.requestPermission === 'function') {
        const permission = await deviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          setHasPermission(true);
          
          // Event listener'ı ekle
          const handler = createDeviceOrientationHandler();
          deviceOrientationHandler.current = handler;
          window.addEventListener('deviceorientation', handler);
          
          // Ayarları güncelle
          const settings = loadSettings();
          saveSettings({ ...settings, motionPermissionStatus: 'granted' });
          
          toast({
            title: "Hareket Kontrolü Aktif",
            description: "Telefonu eğerek oyunu kontrol edebilirsiniz.",
          });
          
          return true;
        } else {
          // Ayarları güncelle - reddedildi
          const settings = loadSettings();
          saveSettings({ ...settings, motionPermissionStatus: 'denied' });
          
          toast({
            title: "İzin Reddedildi",
            description: "Hareket sensörü izni reddedildi. Ayarlardan manuel olarak izin verebilirsiniz.",
            variant: "destructive"
          });
          
          return false;
        }
      } else {
        // Android ve eski tarayıcılar için
        setHasPermission(true);
        
        // Event listener'ı ekle
        const handler = createDeviceOrientationHandler();
        deviceOrientationHandler.current = handler;
        window.addEventListener('deviceorientation', handler);
        
        // Ayarları güncelle
        const settings = loadSettings();
        saveSettings({ ...settings, motionPermissionStatus: 'granted' });
        
        toast({
          title: "Hareket Kontrolü Aktif",
          description: "Telefonu eğerek oyunu kontrol edebilirsiniz.",
        });
        
        return true;
      }
    } catch (error) {
      console.error('Motion sensor permission error:', error);
      
      // Ayarları güncelle - hata
      const settings = loadSettings();
      saveSettings({ ...settings, motionPermissionStatus: 'denied' });
      
      toast({
        title: "Hareket Sensörü Hatası",
        description: "Hareket sensörü etkinleştirilemedi. Buton kontrolü kullanılacak.",
        variant: "destructive"
      });
      
      return false;
    }
  }, [isSupported, hasPermission, createDeviceOrientationHandler]);

  // Callback ayarlama fonksiyonları - useRef kullanarak memory safe
  const onTiltForward = useCallback((callback: MotionCallback) => {
    forwardCallback.current = callback;
  }, []);

  const onTiltBackward = useCallback((callback: MotionCallback) => {
    backwardCallback.current = callback;
  }, []);

  const onTiltLeft = useCallback((callback: MotionCallback) => {
    leftCallback.current = callback;
  }, []);

  const onTiltRight = useCallback((callback: MotionCallback) => {
    rightCallback.current = callback;
  }, []);

  // Hassasiyet güncelleme
  const updateSensitivity = useCallback((newSensitivity: MotionSensitivity) => {
    setSensitivity(newSensitivity);
    
    // Ayarları kaydet
    const settings = loadSettings();
    saveSettings({ ...settings, motionSensitivity: newSensitivity });
  }, []);

  // Temizlik fonksiyonu - memory leak'leri önle
  const cleanup = useCallback(() => {
    if (deviceOrientationHandler.current) {
      window.removeEventListener('deviceorientation', deviceOrientationHandler.current);
      deviceOrientationHandler.current = null;
    }
    
    // Callback'leri temizle
    forwardCallback.current = null;
    backwardCallback.current = null;
    leftCallback.current = null;
    rightCallback.current = null;
    
    setHasPermission(false);
  }, []);

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