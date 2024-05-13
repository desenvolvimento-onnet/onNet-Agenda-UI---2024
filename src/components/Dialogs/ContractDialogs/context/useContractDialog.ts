import { useCallback, useContext } from "react";

import { DialogContractContext, DialogContractOptions } from ".";
import System from "../../../../models/System";
import { SystemContractParams } from "../../../../services/SystemService";

export default function useContractDialog() {
  const { handleDialogOpen } = useContext(DialogContractContext);

  const viewContractDialog = useCallback(
    (contractId: number, onClose?: (success?: boolean) => void) => {
      handleDialogOpen(1, { contractId }, onClose);
    },
    [handleDialogOpen]
  );

  const addContractDialog = useCallback(
    (
      options?: DialogContractOptions,
      onClose?: (success?: boolean) => void
    ) => {
      handleDialogOpen(2, options, onClose);
    },
    [handleDialogOpen]
  );

  const fixContractDialog = useCallback(
    (
      system: System,
      contractParams: SystemContractParams,
      contractId?: number,
      onClose?: (success?: boolean) => void
    ) => {
      handleDialogOpen(3, { contractId, system, contractParams }, onClose);
    },
    [handleDialogOpen]
  );

  const productContractDialog = useCallback(
    (contractId: number, onClose?: (success?: boolean) => void) => {
      handleDialogOpen(4, { contractId }, onClose);
    },
    [handleDialogOpen]
  );

  const renewContractDialog = useCallback(
    (contractId?: number, onClose?: (success?: boolean) => void) => {
      handleDialogOpen(5, { contractId }, onClose);
    },
    [handleDialogOpen]
  );

  const deleteContractDialog = useCallback(
    (contractId: number, onClose?: (success?: boolean) => void) => {
      handleDialogOpen(6, { contractId }, onClose);
    },
    [handleDialogOpen]
  );

  const printContractDialog = useCallback(
    (contractId: number, onClose?: () => void) => {
      handleDialogOpen(7, { contractId }, onClose);
    },
    [handleDialogOpen]
  );

  return {
    viewContractDialog,
    addContractDialog,
    fixContractDialog,
    productContractDialog,
    renewContractDialog,
    deleteContractDialog,
    printContractDialog,
  };
}
