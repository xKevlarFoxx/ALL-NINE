import { useEffect } from 'react';
import { AccessibilityInfo, findNodeHandle, View } from 'react-native';

export const useAccessibility = (ref: React.RefObject<View>, message: string) => {
  useEffect(() => {
    if (ref.current) {
      const node = findNodeHandle(ref.current);
      if (node) {
        AccessibilityInfo.announceForAccessibility(message);
      }
    }
  }, [ref, message]);
};