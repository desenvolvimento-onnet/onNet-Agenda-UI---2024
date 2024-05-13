import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { CircularProgress, DialogProps, TextField } from "@material-ui/core";

import { CloseStatus } from "../context";
import { notificate } from "../../../../global/notificate";
import { AuthContext } from "../../../../global/context/AuthContext";

import ConfirmDialog from "../../../ConfirmDialog";
import OrderService from "../../../../services/OrderService";
import Order from "../../../../models/Order";
import MessageInfo from "../../../MessageInfo";

import { Container } from "./styles";

interface CancelOsDialogProps extends DialogProps {
  index: number;
  open: boolean;
  orderId?: number;
  onClose: (options: CloseStatus) => void;
}

const CancelOsDialog: React.FC<CancelOsDialogProps> = ({
  index,
  open,
  onClose,
  orderId,
  ...props
}) => {
  const { userPermissions } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cancellationReason, setCancellationReason] = useState<string>("");

  const [order, setOrder] = useState<Order>();

  useEffect(() => {
    if (open && !userPermissions?.order.cancel) {
      notificate({
        title: "Erro",
        message: "Você não tem permissão para cancelar a O.S",
        type: "danger",
      });

      onClose({ index, success: false });
    }
  }, [open, userPermissions]);

  const onSubmit = useCallback(async (order: Order, reason: string) => {
    if (!reason) {
      notificate({
        title: "Atenção",
        message: "Preencha todos os campos!",
        type: "info",
      });

      throw new Error("Missing data");
    }

    if (order?.canceled) {
      notificate({
        title: "Aviso",
        message: "Esta O.S já está cancelada!",
        type: "warning",
      });

      throw new Error("Order already canceled");
    }

    if (order?.closed) {
      notificate({
        title: "Aviso",
        message: "Esta O.S já está fechada!",
        type: "warning",
      });

      throw new Error("Order already closed");
    }

    await OrderService.cancel(Number(order.id), reason);
  }, []);

  const handleClose = useCallback(
    (success?: boolean) => {
      if (success && order) {
        setIsLoading(true);

        onSubmit(order, cancellationReason)
          .then(() => onClose({ index, success }))
          .catch((err) => {
            notificate({
              title: `Erro ${err.response?.status || ""}`,
              message: "Ocorreu um erro ao cancelar a O.S",
              type: "danger",
            });

            console.log(err);
          })
          .finally(() => setIsLoading(false));
      } else onClose({ index, success });
    },
    [onClose, cancellationReason, index, onSubmit, order]
  );

  async function getData(id: number) {
    const order = (await OrderService.show(id)).data;

    return { order };
  }

  function refresh() {
    setOrder(undefined);
    setCancellationReason("");

    if (!orderId) {
      handleClose();

      return;
    }

    setIsLoading(true);

    getData(orderId)
      .then((response) => {
        if (response.order.canceled) {
          notificate({
            title: "Aviso",
            message: "Esta O.S já está cancelada!",
            type: "warning",
          });

          handleClose();
        } else if (response.order.closed) {
          notificate({
            title: "Aviso",
            message: "Esta O.S já está fechada!",
            type: "warning",
          });

          handleClose();
        } else setOrder(response.order);
      })
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar a O.S",
          type: "danger",
        });

        handleClose();

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if (open) refresh();
  }, [open, orderId]);

  return (
    <ConfirmDialog
      open={open}
      title="Cancelar O.S"
      cancelLabel="Voltar"
      onClose={handleClose}
      okButtonProps={{ disabled: isLoading || !cancellationReason }}
      fullWidth
      maxWidth="xs"
      {...props}
    >
      <Container>
        {isLoading ? (
          <CircularProgress size={100} className="centralize" />
        ) : order ? (
          <form
            onSubmit={(ev) => {
              ev.preventDefault();

              handleClose(true);
            }}
          >
            <strong>
              {order.os} - {order.client}
            </strong>

            <TextField
              label="Motivo"
              name="cancellation_reason"
              value={cancellationReason}
              onChange={(ev) => setCancellationReason(ev.target.value)}
              multiline
              rows={3}
              variant="outlined"
              fullWidth
              margin="normal"
            />
          </form>
        ) : (
          open && (
            <MessageInfo>
              Não foi possível carregar a ordem de serviço
            </MessageInfo>
          )
        )}
      </Container>
    </ConfirmDialog>
  );
};

export default memo(CancelOsDialog);
