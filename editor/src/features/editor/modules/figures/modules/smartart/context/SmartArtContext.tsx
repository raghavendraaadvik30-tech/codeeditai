/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useMemo, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { SmartArtModel } from '../types/smartart.types';
import { SMARTART_LAYOUTS } from '../constants/smartart.constants';

export interface SmartArtContextValue {
  activeSmartArt: SmartArtModel | null;
  activeSmartArtId: string | null;
  setActiveSmartArt: (smartArt: SmartArtModel | null) => void;
  updateActiveSmartArt: (patch: Partial<SmartArtModel>) => void;
  deleteActiveSmartArt: () => void;
  addNode: (text?: string, subtitle?: string) => void;
  deleteNode: (nodeId: string) => void;
  updateNodeText: (nodeId: string, text: string, subtitle?: string) => void;
  changeColorScheme: (schemeId: string) => void;
  changeLayout: (layoutId: string) => void;
  isSmartArtModalOpen: boolean;
  setIsSmartArtModalOpen: (open: boolean) => void;
  registerSyncHandler: (
    handler: (smartArtId: string, updated: SmartArtModel | null) => void
  ) => () => void;
}

const SmartArtContext = createContext<SmartArtContextValue | null>(null);

export const SmartArtProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeSmartArt, setActiveSmartArtState] = useState<SmartArtModel | null>(null);
  const [isSmartArtModalOpen, setIsSmartArtModalOpen] = useState(false);

  const syncHandlerRef = useRef<
    ((smartArtId: string, updated: SmartArtModel | null) => void) | null
  >(null);

  const registerSyncHandler = useCallback(
    (handler: (smartArtId: string, updated: SmartArtModel | null) => void) => {
      syncHandlerRef.current = handler;
      return () => {
        if (syncHandlerRef.current === handler) {
          syncHandlerRef.current = null;
        }
      };
    },
    []
  );

  const setActiveSmartArt = useCallback((smartArt: SmartArtModel | null) => {
    setActiveSmartArtState(smartArt);
  }, []);

  const updateActiveSmartArt = useCallback(
    (patch: Partial<SmartArtModel>) => {
      if (!activeSmartArt) return;
      const updated: SmartArtModel = {
        ...activeSmartArt,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      setActiveSmartArtState(updated);
      if (syncHandlerRef.current) {
        syncHandlerRef.current(updated.id, updated);
      }
    },
    [activeSmartArt]
  );

  const deleteActiveSmartArt = useCallback(() => {
    if (!activeSmartArt) return;
    const smartArtId = activeSmartArt.id;
    setActiveSmartArtState(null);
    if (syncHandlerRef.current) {
      syncHandlerRef.current(smartArtId, null);
    }
  }, [activeSmartArt]);

  const addNode = useCallback(
    (text?: string, subtitle?: string) => {
      if (!activeSmartArt) return;
      const nextNum = activeSmartArt.nodes.length + 1;
      const newNode = {
        id: `node-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        text: text || `New Item ${nextNum}`,
        subtitle: subtitle || (activeSmartArt.nodes[0]?.subtitle ? `Description for item ${nextNum}` : undefined),
        level: 1,
      };
      updateActiveSmartArt({
        nodes: [...activeSmartArt.nodes, newNode],
      });
    },
    [activeSmartArt, updateActiveSmartArt]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      if (!activeSmartArt || activeSmartArt.nodes.length <= 1) return;
      updateActiveSmartArt({
        nodes: activeSmartArt.nodes.filter((n) => n.id !== nodeId),
      });
    },
    [activeSmartArt, updateActiveSmartArt]
  );

  const updateNodeText = useCallback(
    (nodeId: string, text: string, subtitle?: string) => {
      if (!activeSmartArt) return;
      updateActiveSmartArt({
        nodes: activeSmartArt.nodes.map((n) =>
          n.id === nodeId ? { ...n, text, ...(subtitle !== undefined ? { subtitle } : {}) } : n
        ),
      });
    },
    [activeSmartArt, updateActiveSmartArt]
  );

  const changeColorScheme = useCallback(
    (schemeId: string) => {
      if (!activeSmartArt) return;
      updateActiveSmartArt({ colorScheme: schemeId });
    },
    [activeSmartArt, updateActiveSmartArt]
  );

  const changeLayout = useCallback(
    (layoutId: string) => {
      if (!activeSmartArt) return;
      const layoutsForCat = SMARTART_LAYOUTS[activeSmartArt.category] || [];
      const layoutObj = layoutsForCat.find((l) => l.id === layoutId);
      if (!layoutObj) return;

      updateActiveSmartArt({
        layout: layoutId,
        title: layoutObj.name,
      });
    },
    [activeSmartArt, updateActiveSmartArt]
  );

  const value = useMemo(
    () => ({
      activeSmartArt,
      activeSmartArtId: activeSmartArt?.id || null,
      setActiveSmartArt,
      updateActiveSmartArt,
      deleteActiveSmartArt,
      addNode,
      deleteNode,
      updateNodeText,
      changeColorScheme,
      changeLayout,
      isSmartArtModalOpen,
      setIsSmartArtModalOpen,
      registerSyncHandler,
    }),
    [
      activeSmartArt,
      setActiveSmartArt,
      updateActiveSmartArt,
      deleteActiveSmartArt,
      addNode,
      deleteNode,
      updateNodeText,
      changeColorScheme,
      changeLayout,
      isSmartArtModalOpen,
      registerSyncHandler,
    ]
  );

  return <SmartArtContext.Provider value={value}>{children}</SmartArtContext.Provider>;
};

export function useSmartArtContext() {
  const context = useContext(SmartArtContext);
  if (!context) {
    throw new Error('useSmartArtContext must be used within SmartArtProvider');
  }
  return context;
}
