// hooks/useModal.ts
import { useState, useCallback } from 'react';

export const useModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  const showModal = useCallback((data?: any) => {
    setModalData(data);
    setIsVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsVisible(false);
    setModalData(null);
  }, []);

  return {
    isVisible,
    modalData,
    showModal,
    hideModal,
  };
};