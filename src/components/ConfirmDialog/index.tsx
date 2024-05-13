import React, { memo } from "react";

import {
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
} from "@material-ui/core";

interface ConfirmDialogProps extends DialogProps {
  title: string;
  okLabel?: string;
  cancelLabel?: string;
  canOutClose?: boolean;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  onClose?: (success: boolean) => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  okLabel = "Ok",
  cancelLabel = "Cancelar",
  canOutClose = true,
  okButtonProps,
  cancelButtonProps,
  onClose,
  children,
  ...props
}) => {
  return (
    <Dialog
      {...props}
      open={open}
      onClose={() => canOutClose && onClose && onClose(false)}
      BackdropProps={{ style: { background: "var(--backdrop)" } }}
    >
      <DialogTitle
        style={{
          background: "var(--tertiary)",
          color: "var(--white)",
          marginBottom: "1rem",
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent
        style={{
          padding: "1rem",
          color: "rgba(0, 0, 0, 0.54)",
          fontSize: "1rem",
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          fontWeight: 400,
          lineHeight: 1.5,
          letterSpacing: "0.00938em",
        }}
      >
        {children}
      </DialogContent>
      <DialogActions style={{ background: "var(--background)" }}>
        {cancelLabel.trim() && (
          <Button
            color="primary"
            {...cancelButtonProps}
            onClick={() => onClose && onClose(false)}
          >
            {cancelLabel}
          </Button>
        )}

        {okLabel.trim() && (
          <Button
            color="primary"
            variant="outlined"
            {...okButtonProps}
            onClick={() => onClose && onClose(true)}
            autoFocus
          >
            {okLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default memo(ConfirmDialog);
