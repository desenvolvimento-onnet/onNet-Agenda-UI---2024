import React, { createContext, useCallback, useMemo, useState } from "react";
import { useEffect } from "react";

import AddNumberDialog from "../AddNumberDialog";
import BindNumberDialog from "../BindNumberDialog";
import DeleteNumberDialog from "../DeleteNumberDialog";
import ReserveNumberDialog from "../ReserveNumberDialog";
import UnbindNumberDialog from "../UnbindNumberDialog";
import ViewNumberDialog from "../ViewNumberDialog";

export interface CloseStatus {
  index: number;
  success?: boolean;
}

export interface DialogNumberOptions {
  phoneNumberId?: number;
  phoneNumberIds?: number[];
  cityId?: number;
}

interface OpenedDialog {
  index: number;
  onClose?: (success?: boolean) => void;
}

export interface DialogNumberContextProps {
  handleDialogOpen: (
    index: number,
    options?: DialogNumberOptions,
    onClose?: (success?: boolean) => void
  ) => void;
}

export const DialogNumberContext = createContext<DialogNumberContextProps>(
  {} as DialogNumberContextProps
);

const DialogNumberProvider: React.FC = ({ children }) => {
  const [dialogOpened, setDialogOpened] = useState<OpenedDialog[]>([]);

  const [selectedCityId, setSelectedCityId] = useState<number>();
  const [selectedPhoneNumberId, setSelectedPhoneNumberId] = useState<number>();
  const [selectedPhoneNumberIds, setSelectedPhoneNumberIds] = useState<
    number[]
  >([]);

  const handleDialogOpen = useCallback(
    (
      index: number,
      options?: DialogNumberOptions,
      onClose?: (success?: boolean) => void
    ) => {
      if (options) {
        const { phoneNumberId, phoneNumberIds, cityId } = options;

        setSelectedPhoneNumberId(phoneNumberId);
        setSelectedPhoneNumberIds(phoneNumberIds || []);
        setSelectedCityId(cityId);
      } else {
        setSelectedPhoneNumberId(undefined);
        setSelectedPhoneNumberIds([]);
      }

      setDialogOpened((prev) => [...prev, { index, onClose }]);
    },
    [setSelectedPhoneNumberId, setDialogOpened]
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
    <DialogNumberContext.Provider
      value={{
        handleDialogOpen,
      }}
    >
      {children}

      {/* View Number Dialog - INDEX 1 */}
      <ViewNumberDialog
        index={1}
        open={useMemo(
          () => Boolean(dialogOpened.find((dialog) => dialog.index === 1)),
          [dialogOpened]
        )}
        onClose={handleDialogClose}
        phoneNumberId={selectedPhoneNumberId}
      />

      {/* Add Number Dialog - INDEX 2 */}
      <AddNumberDialog
        index={2}
        open={useMemo(
          () => Boolean(dialogOpened.find((dialog) => dialog.index === 2)),
          [dialogOpened]
        )}
        onClose={handleDialogClose}
        phoneNumberId={selectedPhoneNumberId}
      />

      {/* Bind Number Dialog - INDEX 3*/}
      <BindNumberDialog
        index={3}
        open={useMemo(
          () => Boolean(dialogOpened.find((dialog) => dialog.index === 3)),
          [dialogOpened]
        )}
        onClose={handleDialogClose}
        phoneNumberIds={selectedPhoneNumberIds}
        cityId={Number(selectedCityId)}
      />

      {/* Unbind Number Dialog - INDEX 4 */}
      <UnbindNumberDialog
        index={4}
        open={useMemo(
          () => Boolean(dialogOpened.find((dialog) => dialog.index === 4)),
          [dialogOpened]
        )}
        onClose={handleDialogClose}
        phoneNumberId={selectedPhoneNumberId}
      />

      {/* Reserve Number Dialog - INDEX 5 */}
      <ReserveNumberDialog
        index={5}
        open={useMemo(
          () => Boolean(dialogOpened.find((dialog) => dialog.index === 5)),
          [dialogOpened]
        )}
        onClose={handleDialogClose}
        phoneNumberId={selectedPhoneNumberId}
      />

      {/* Cancel Number Dialog - INDEX 6 */}
      <DeleteNumberDialog
        index={6}
        open={useMemo(
          () => Boolean(dialogOpened.find((dialog) => dialog.index === 6)),
          [dialogOpened]
        )}
        onClose={handleDialogClose}
        phoneNumberId={selectedPhoneNumberId}
      />
    </DialogNumberContext.Provider>
  );
};

export default DialogNumberProvider;
