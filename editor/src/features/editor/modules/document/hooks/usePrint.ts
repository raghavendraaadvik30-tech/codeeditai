/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: usePrint React Hook
 * Description:
 * Browser window.print() dispatch hook with active printing lifecycle tracking.
 * --------------------------------------------------------
 */

import { useState, useCallback } from "react";
import { printService } from "../../../services/printService";

export function usePrint() {
  const [isPrinting, setIsPrinting] = useState(false);

  const printDocument = useCallback(async () => {
    setIsPrinting(true);
    try {
      await printService.printDocument();
    } finally {
      setIsPrinting(false);
    }
  }, []);

  return {
    isPrinting,
    printDocument,
  };
}
