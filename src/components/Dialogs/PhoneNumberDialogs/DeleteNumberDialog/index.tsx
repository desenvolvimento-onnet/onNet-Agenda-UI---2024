import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { CircularProgress, DialogProps } from "@material-ui/core";
import { IoCloseCircleOutline } from "react-icons/io5";

import { CloseStatus } from "../context";
import { AuthContext } from "../../../../global/context/AuthContext";
import { notificate } from "../../../../global/notificate";

import PhoneNumber from "../../../../models/PhoneNumber";
import PhoneNumberService from "../../../../services/PhoneNumberService";
import ConfirmDialog from "../../../ConfirmDialog";

import { Container } from "./styles";

interface DeleteNumberDialogProps extends DialogProps {
  index: number;
  open: boolean;
  phoneNumberId?: number;
  onClose: (options: CloseStatus) => void;
}

const DeleteNumberDialog: React.FC<DeleteNumberDialogProps> = ({
  index,
  open,
  onClose,
  phoneNumberId,
  ...props
}) => {
  const { userPermissions } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<PhoneNumber>();

  useEffect(() => {
    if (open && !userPermissions?.phone_number.delete) {
      notificate({
        title: "Erro",
        message: "Você não tem permissão para deletar o número",
        type: "danger",
      });

      onClose({ index, success: false });
    }
  }, [open, userPermissions]);

  const onSubmit = useCallback(async (id: number) => {
    await PhoneNumberService.delete(id);
  }, []);

  const handleClose = useCallback(
    (success?: boolean) => {
      if (success) {
        setIsLoading(true);

        onSubmit(Number(selectedPhoneNumber?.id))
          .then(() => {
            notificate({
              title: "Sucesso",
              message: "Número deletado com sucesso!",
              type: "success",
            });

            onClose({ index, success });
          })
          .catch((err) => {
            if (err.response?.status)
              notificate({
                title: `Erro ${err.response?.status || ""}`,
                message: "Ocorreu um erro ao salvar os dados",
                type: "danger",
              });

            console.log(err);
          })
          .finally(() => setIsLoading(false));
      } else onClose({ index, success });
    },
    [index, setIsLoading, onSubmit, onClose, selectedPhoneNumber]
  );

  const getData = useCallback(async (phoneNumberId: number) => {
    const phoneNumber = (await PhoneNumberService.show(phoneNumberId)).data;

    return { phoneNumber };
  }, []);

  function refresh(phoneNumberId?: number) {
    setSelectedPhoneNumber(undefined);

    if (phoneNumberId) {
      setIsLoading(true);

      getData(phoneNumberId)
        .then((response) => {
          if (response.phoneNumber.alocated) {
            notificate({
              title: "Aviso",
              message: "Este número está vinculado a um contrato",
              type: "warning",
            });

            handleClose(false);

            return;
          } else setSelectedPhoneNumber(response.phoneNumber);
        })
        .catch((err) => {
          if (err.response?.status === 404)
            notificate({
              title: "Aviso",
              message: "Este número de telefone não foi encontrado",
              type: "warning",
            });
          else
            notificate({
              title: `Erro ${err.response?.status || ""}`,
              message: "Ocorreu um erro ao carregar o número de telefone",
              type: "danger",
            });

          handleClose(false);

          console.log(err);
        })
        .finally(() => setIsLoading(false));
    }
  }

  useEffect(() => {
    if (open) refresh(phoneNumberId);
  }, [open, phoneNumberId]);

  return (
    <ConfirmDialog
      open={open}
      title="Deletar número"
      okLabel="Ok"
      cancelLabel="Voltar"
      onClose={handleClose}
      okButtonProps={{
        disabled: isLoading,
      }}
      fullWidth
      maxWidth="xs"
      {...props}
    >
      <Container>
        {isLoading ? (
          <CircularProgress size={100} className="centralize" />
        ) : (
          <>
            <IoCloseCircleOutline size={75} color="var(--danger)" />

            <h2>Confirmar exclusão?</h2>

            <div>
              <p>Tem certeza que deseja deletar o número?</p>
              <p>Este processedimento é irreversível!</p>
            </div>

            <strong>{selectedPhoneNumber?.number}</strong>
          </>
        )}
      </Container>
    </ConfirmDialog>
  );
};

export default memo(DeleteNumberDialog);
