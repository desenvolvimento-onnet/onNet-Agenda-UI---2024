import { useCallback, useContext } from "react";

import { DialogNumberContext, DialogNumberOptions } from ".";

export default function useNumberDialog() {
  const { handleDialogOpen } = useContext(DialogNumberContext);

  const viewNumberDialog = useCallback(
    (phoneNumberId: number, onClose?: (success?: boolean) => void) => {
      handleDialogOpen(1, { phoneNumberId }, onClose);
    },
    [handleDialogOpen]
  );

  const addNumberDialog = useCallback(
    (options?: DialogNumberOptions, onClose?: (success?: boolean) => void) => {
      handleDialogOpen(2, options, onClose);
    },
    [handleDialogOpen]
  );

  const bindNumberDialog = useCallback(
    (
      phoneNumberIds: number[],
      cityId: number,
      onClose?: (success?: boolean) => void
    ) => {
      handleDialogOpen(3, { phoneNumberIds, cityId }, onClose);
    },
    [handleDialogOpen]
  );

  const unbindNumberDialog = useCallback(
    (phoneNumberId: number, onClose?: (success?: boolean) => void) => {
      handleDialogOpen(4, { phoneNumberId }, onClose);
    },
    [handleDialogOpen]
  );

  const reserveNumberDialog = useCallback(
    (phoneNumberId: number, onClose?: (success?: boolean) => void) => {
      handleDialogOpen(5, { phoneNumberId }, onClose);
    },
    [handleDialogOpen]
  );

  const deleteNumberDialog = useCallback(
    (phoneNumberId: number, onClose?: (success?: boolean) => void) => {
      handleDialogOpen(6, { phoneNumberId }, onClose);
    },
    [handleDialogOpen]
  );

  return {
    viewNumberDialog,
    addNumberDialog,
    bindNumberDialog,
    unbindNumberDialog,
    reserveNumberDialog,
    deleteNumberDialog,
  };
}
