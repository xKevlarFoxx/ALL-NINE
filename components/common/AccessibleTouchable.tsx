// components/common/AccessibleTouchable.tsx
import React from 'react';
import { 
  TouchableOpacity, 
  AccessibilityRole, 
  AccessibilityState,
  StyleSheet,
} from 'react-native';

interface AccessibleTouchableProps {
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  children: React.ReactNode;
}

export const AccessibleTouchable: React.FC<AccessibleTouchableProps> = ({
  onPress,
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityState,
  children,
  ...props
}) => (
  <TouchableOpacity
    onPress={onPress}
    accessible={true}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole={accessibilityRole}
    accessibilityState={accessibilityState}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    {...props}
  >
    {children}
  </TouchableOpacity>
);

// hooks/useAccessibility.ts
import { useCallback } from 'react';
import { AccessibilityInfo, findNodeHandle } from 'react-native';

export const useAccessibility = () => {
  const announceForAccessibility = useCallback((message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  }, []);

  const focusOnElement = useCallback((ref: React.RefObject<any>) => {
    const node = findNodeHandle(ref.current);
    if (node) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
  }, []);

  return {
    announceForAccessibility,
    focusOnElement,
  };
};