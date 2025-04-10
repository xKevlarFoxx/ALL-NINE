// hooks/useModal.ts
import { useState, useCallback } from 'react';

/**
 * useModal hook
 *
 * Provides a generic modal state management useful for showing/hiding modal dialogs along with any related data.
 *
 * @template T - Type of the modal data.
 * @returns An object with modal visibility state, modal data, and functions to show and hide the modal.
 */
export const useModal = <T = unknown>() => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [modalData, setModalData] = useState<T | null>(null);

  /**
   * Show the modal and optionally set the modal data.
   *
   * @param data - Data to be provided to the modal.
   */
  const showModal = useCallback((data?: T) => {
    setModalData(data ?? null);
    setIsVisible(true);
  }, []);

  /**
   * Hide the modal and clear the modal data.
   */
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
