import { useCallback, useContext } from "react";

import { DialogOsContext, DialogOsOptions } from ".";

export default function useOsDialog() {
  const { handleDialogOpen } = useContext(DialogOsContext);

  const viewOsDialog = useCallback(
    (orderId: number, onClose?: (success?: boolean) => void) => {
      handleDialogOpen(1, { orderId }, onClose);
    },
    [handleDialogOpen]
  );

  const addOsDialog = useCallback(
    (options?: DialogOsOptions, onClose?: (success?: boolean) => void) => {
      handleDialogOpen(2, options, onClose);
    },
    [handleDialogOpen]
  );

  const closeOsDialog = useCallback(
    (orderId: number, onClose?: (success?: boolean) => void) => {
      handleDialogOpen(3, { orderId }, onClose);
    },
    [handleDialogOpen]
  );

  const rescheduleOsDialog = useCallback(
    (orderId: number, onClose?: (success?: boolean) => void) => {
      handleDialogOpen(4, { orderId }, onClose);
    },
    [handleDialogOpen]
  );

  const cancelDialog = useCallback(
    (orderId: number, onClose?: (success?: boolean) => void) => {
      handleDialogOpen(5, { orderId }, onClose);
    },
    [handleDialogOpen]
  );

  const searchOsDialog = useCallback(
    (onClose?: (success?: boolean) => void) => {
      handleDialogOpen(6, {}, onClose);
    },
    [handleDialogOpen]
  );

  return {
    viewOsDialog,
    addOsDialog,
    searchOsDialog,
    closeOsDialog,
    rescheduleOsDialog,
    cancelDialog,
  };
}
