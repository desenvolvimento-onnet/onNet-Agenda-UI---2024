import React, { createContext, useCallback, useMemo, useState } from "react";
import System from "../../../../models/System";

import { SystemContractParams } from "../../../../services/SystemService";

import AddContractDialog from "../AddContractDialog";
import DeleteContractDialog from "../DeleteContractDialog";
import FixContractDialog from "../FixContractDialog";
import PrintContractDialog from "../PrintContractDialog";
import ProductContractDialog from "../ProductContractDialog";
import RenewContractDialog from "../RenewContractDialog";
import ViewContractDialog from "../ViewContractDialog";

export interface CloseStatus {
  index: number;
  success?: boolean;
}

export interface DialogContractOptions {
  contractId?: number;
  system?: System;
  contractParams?: SystemContractParams;
}

interface OpenedDialog {
  index: number;
  onClose?: (success?: boolean) => void;
}

export interface DialogContractContextProps {
  handleDialogOpen: (
    index: number,
    options?: DialogContractOptions,
    onClose?: (success?: boolean) => void
  ) => void;
}

export const DialogContractContext = createContext<DialogContractContextProps>(
  {} as DialogContractContextProps
);

const DialogContractProvider: React.FC = ({ children }) => {
  const [dialogOpened, setDialogOpened] = useState<OpenedDialog[]>([]);

  const [selectedContractId, setSelectedContractId] = useState<number>();
  const [selectedSystem, setSelectedSystem] = useState<System>();
  const [contractParams, setContractParams] = useState<SystemContractParams>();

  const handleDialogOpen = useCallback(
    (
      index: number,
      options?: DialogContractOptions,
      onClose?: (success?: boolean) => void
    ) => {
      if (options) {
        const { contractId, system, contractParams } = options;

        setSelectedContractId(contractId);
        setSelectedSystem(system);
        setContractParams(contractParams);
      } else setSelectedContractId(undefined);

      setDialogOpened((prev) => [...prev, { index, onClose }]);
    },
    [
      setSelectedSystem,
      setContractParams,
      setSelectedContractId,
      setDialogOpened,
    ]
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
    <DialogContractContext.Provider
      value={{
        handleDialogOpen,
      }}
    >
      {children}

      {/* View Contract Dialog - INDEX 1 */}
      <ViewContractDialog
        index={1}
        open={useMemo(
          () => Boolean(dialogOpened.find((dialog) => dialog.index === 1)),
          [dialogOpened]
        )}
        onClose={handleDialogClose}
        contractId={selectedContractId}
      />

      {/* Add Contract Dialog - INDEX 2 */}
      <AddContractDialog
        index={2}
        open={useMemo(
          () => Boolean(dialogOpened.find((dialog) => dialog.index === 2)),
          [dialogOpened]
        )}
        onClose={handleDialogClose}
        contractId={selectedContractId}
      />

      {/* Fix Contract Dialog - INDEX 3*/}
      <FixContractDialog
        index={3}
        open={useMemo(
          () => Boolean(dialogOpened.find((dialog) => dialog.index === 3)),
          [dialogOpened]
        )}
        onClose={handleDialogClose}
        contractId={selectedContractId}
        contractParams={contractParams}
        system={selectedSystem}
      />

      {/* Product Contract Dialog - INDEX 4 */}
      <ProductContractDialog
        index={4}
        open={useMemo(
          () => Boolean(dialogOpened.find((dialog) => dialog.index === 4)),
          [dialogOpened]
        )}
        onClose={handleDialogClose}
        contractId={selectedContractId}
      />

      {/* Renew Contract Dialog - INDEX 5 */}
      <RenewContractDialog
        index={5}
        open={useMemo(
          () => Boolean(dialogOpened.find((dialog) => dialog.index === 5)),
          [dialogOpened]
        )}
        onClose={handleDialogClose}
        contractId={selectedContractId}
      />

      {/* Delete Contract Dialog - INDEX 6 */}
      <DeleteContractDialog
        index={6}
        open={useMemo(
          () => Boolean(dialogOpened.find((dialog) => dialog.index === 6)),
          [dialogOpened]
        )}
        onClose={handleDialogClose}
        contractId={selectedContractId}
      />

      {/* Print Contract Dialog - INDEX 7 */}
      <PrintContractDialog
        index={7}
        open={useMemo(
          () => Boolean(dialogOpened.find((dialog) => dialog.index === 7)),
          [dialogOpened]
        )}
        onClose={handleDialogClose}
        contractId={selectedContractId}
      />
    </DialogContractContext.Provider>
  );
};

export default DialogContractProvider;
