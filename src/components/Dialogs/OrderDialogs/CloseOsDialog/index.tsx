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
import Order from "../../../../models/Order";
import OrderService from "../../../../services/OrderService";
import MessageInfo from "../../../MessageInfo";

import { Container } from "./styles";

interface CloseOsDialogProps extends DialogProps {
  index: number;
  open: boolean;
  onClose: (options: CloseStatus) => void;
  orderId?: number;
}

const CloseOsDialog: React.FC<CloseOsDialogProps> = ({
  index,
  open,
  onClose,
  orderId,
  ...props
}) => {
  const { userPermissions } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [closingNote, setClosingNote] = useState<string>("");

  const [order, setOrder] = useState<Order>();

  useEffect(() => {
    if (open && !userPermissions?.order.close) {
      notificate({
        title: "Erro",
        message: "Você não tem permissão para fechar a O.S",
        type: "danger",
      });

      onClose({ index, success: false });
    }
  }, [open, userPermissions]);

  const onSubmit = useCallback(async (order: Order, note?: string) => {
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

    await OrderService.close(Number(order.id), note);
  }, []);

  const handleClose = useCallback(
    (success?: boolean) => {
      if (success && order) {
        setIsLoading(true);

        onSubmit(order, closingNote)
          .then(() => onClose({ index, success }))
          .catch((err) => {
            notificate({
              title: `Erro ${err.response?.status || ""}`,
              message: "Ocorreu um erro ao fechar a O.S",
              type: "danger",
            });

            console.log(err);
          })
          .finally(() => setIsLoading(false));
      } else onClose({ index, success });
    },
    [onClose, order, closingNote, index, onSubmit]
  );

  async function getData(id: number) {
    const order = (await OrderService.show(id)).data;

    return { order };
  }

  function refresh() {
    setOrder(undefined);
    setClosingNote("");

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
      title="Encerrar O.S"
      cancelLabel="Voltar"
      onClose={handleClose}
      okButtonProps={{ disabled: isLoading }}
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
              label="Descrição de fechamento (opcional)"
              name="closing_note"
              value={closingNote}
              onChange={(ev) => setClosingNote(ev.target.value)}
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

export default memo(CloseOsDialog);
