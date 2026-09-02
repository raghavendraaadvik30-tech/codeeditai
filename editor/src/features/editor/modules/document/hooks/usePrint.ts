/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: usePrint React Hook
 * Description:
 * Browser window.print() dispatch hook with active printing lifecycle tracking.
 * --------------------------------------------------------
 */

import { useState, useCallback } from "react";

export function usePrint() {
  const [isPrinting, setIsPrinting] = useState(false);

  const printDocument = useCallback(() => {
    setIsPrinting(true);
    try {
      window.print();
    } finally {
      setIsPrinting(false);
    }
  }, []);

  return {
    isPrinting,
    printDocument,
  };
}
