import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { CircularProgress, DialogProps } from "@material-ui/core";

import { CloseStatus } from "../context";
import { AuthContext } from "../../../../global/context/AuthContext";
import { notificate } from "../../../../global/notificate";

import PhoneNumber from "../../../../models/PhoneNumber";
import PhoneNumberService from "../../../../services/PhoneNumberService";
import ConfirmDialog from "../../../ConfirmDialog";

import { Container } from "./styles";
import { GiBreakingChain } from "react-icons/gi";
import useNumberDialog from "../context/useNumberDialog";

interface UnbindNumberDialogProps extends DialogProps {
  index: number;
  open: boolean;
  phoneNumberId?: number;
  onClose: (options: CloseStatus) => void;
}

const UnbindNumberDialog: React.FC<UnbindNumberDialogProps> = ({
  index,
  open,
  onClose,
  phoneNumberId,
  ...props
}) => {
  const { userPermissions } = useContext(AuthContext);
  const { reserveNumberDialog } = useNumberDialog();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<PhoneNumber>();

  useEffect(() => {
    if (open && !userPermissions?.phone_number.unbind) {
      notificate({
        title: "Erro",
        message: "Você não tem permissão para desvincular o número",
        type: "danger",
      });

      onClose({ index, success: false });
    }
  }, [open, userPermissions]);

  const onSubmit = useCallback(async (id: number) => {
    await PhoneNumberService.unbind(id);
  }, []);

  const handleClose = useCallback(
    (success?: boolean) => {
      if (success) {
        setIsLoading(true);

        onSubmit(Number(selectedPhoneNumber?.id))
          .then(() => {
            notificate({
              title: "Sucesso",
              message: "Número desvinculado com sucesso!",
              type: "success",
            });

            if (userPermissions?.phone_number.reserve)
              reserveNumberDialog(Number(selectedPhoneNumber?.id), () =>
                onClose({ index, success })
              );
            else onClose({ index, success });
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
    [
      index,
      setIsLoading,
      onSubmit,
      onClose,
      selectedPhoneNumber,
      reserveNumberDialog,
      userPermissions
    ]
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
          if (!response.phoneNumber.alocated) {
            notificate({
              title: "Aviso",
              message: "Este número não está vinculado a um contrato",
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
      title="Desalocar número"
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
            <GiBreakingChain size={75} color="var(--warning)" />

            <h2>Desvincular do contrato?</h2>

            <div>
              <p>
                Tem certeza que deseja desvincular esse número do contrato{" "}
                <strong>{selectedPhoneNumber?.contract?.client}</strong>?
              </p>
            </div>

            <strong>{selectedPhoneNumber?.number}</strong>
          </>
        )}
      </Container>
    </ConfirmDialog>
  );
};

export default memo(UnbindNumberDialog);
