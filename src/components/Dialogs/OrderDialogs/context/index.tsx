import React, { createContext, useCallback, useMemo, useState } from "react";

import AddOsDialog from "../AddOsDialog";
import CancelOsDialog from "../CancelOsDialog";
import CloseOsDialog from "../CloseOsDialog";
import RescheduleOsDialog from "../RescheduleOsDialog";
import SearchOsDialog from "../SearchOsDialog";
import ViewOsDialog from "../ViewOsDialog";

export interface CloseStatus {
  index: number;
  success?: boolean;
}

export interface DialogOsOptions {
  orderId?: number;
  shiftId?: number;
  cityId?: number;
  date?: Date;
  isRural?: boolean;
}

interface AddOsData {
  date?: Date | null;
  shiftId?: number;
  cityId?: number;
  isRural?: boolean;
}

interface OpenedDialog {
  index: number;
  onClose?: (success?: boolean) => void;
}

export interface DialogOsContextProps {
  handleDialogOpen: (
    index: number,
    options?: DialogOsOptions,
    onClose?: (success?: boolean) => void
  ) => void;
}

export const DialogOsContext = createContext<DialogOsContextProps>(
  {} as DialogOsContextProps
);

const DialogOsProvider: React.FC = ({ children }) => {
  const currentDate = useMemo(() => new Date(), []);

  const [dialogOpened, setDialogOpened] = useState<OpenedDialog[]>([]);

  const [selectedOrderId, setSelectedOrderId] = useState<number>();

  const [addOsData, setAddOsData] = useState<AddOsData>({});

  const handleDialogOpen = useCallback(
    (
      index: number,
      options?: DialogOsOptions,
      onClose?: (success?: boolean) => void
    ) => {
      if (options) {
        const { orderId, cityId, shiftId, date, isRural } = options;

        setSelectedOrderId(orderId);
        setAddOsData({ date, cityId, shiftId, isRural });
      } else {
        setSelectedOrderId(undefined);
        setAddOsData({});
      }

      setDialogOpened((prev) => [...prev, { index, onClose }]);
    },
    [setSelectedOrderId, setAddOsData, setDialogOpened]
  );

  const handleDialogClose = useCallback(
    ({ index, success }: CloseStatus) => {
      var func: ((success?: boolean) => void) | undefined;

      setDialogOpened((prev) => {
        func = prev.find((dialog) => dialog.index === index)?.onClose;

        return prev.filter((dialog) => dialog.index !== index);
      });

      // Await the dialogOpen stop change
      setTimeout(() => {
        func && func(success);
      }, 50);
    },
    [setDialogOpened]
  );

  return (
    <DialogOsContext.Provider
      value={{
        handleDialogOpen,
      }}
    >
      {children}

      {/* View OS Dialog - INDEX 1 */}
      <ViewOsDialog
        index={1}
        open={Boolean(dialogOpened.find((dialog) => dialog.index === 1))}
        onClose={handleDialogClose}
        orderId={selectedOrderId}
      />

      {/* Add OS Dialog - INDEX 2 */}
      <AddOsDialog
        index={2}
        open={useMemo(
          () => Boolean(dialogOpened.find((dialog) => dialog.index === 2)),
          [dialogOpened]
        )}
        onClose={handleDialogClose}
        orderId={selectedOrderId}
        date={addOsData.date || currentDate}
        shiftId={addOsData.shiftId}
        cityId={addOsData.cityId}
        isRural={addOsData.isRural}
      />

      {/* Close OS Dialog - INDEX 3*/}
      <CloseOsDialog
        index={3}
        open={useMemo(
          () => Boolean(dialogOpened.find((dialog) => dialog.index === 3)),
          [dialogOpened]
        )}
        onClose={handleDialogClose}
        orderId={selectedOrderId}
      />

      {/* Reschedule OS Dialog - INDEX 4 */}
      <RescheduleOsDialog
        index={4}
        open={useMemo(
          () => Boolean(dialogOpened.find((dialog) => dialog.index === 4)),
          [dialogOpened]
        )}
        onClose={handleDialogClose}
        orderId={selectedOrderId}
      />

      {/* Cancel OS Dialog - INDEX 5 */}
      <CancelOsDialog
        index={5}
        open={useMemo(
          () => Boolean(dialogOpened.find((dialog) => dialog.index === 5)),
          [dialogOpened]
        )}
        onClose={handleDialogClose}
        orderId={selectedOrderId}
      />

      {/* Search OS Dialog - INDEX 6 */}
      <SearchOsDialog
        index={6}
        open={useMemo(
          () => Boolean(dialogOpened.find((dialog) => dialog.index === 6)),
          [dialogOpened]
        )}
        onClose={handleDialogClose}
      />
    </DialogOsContext.Provider>
  );
};

export default DialogOsProvider;
