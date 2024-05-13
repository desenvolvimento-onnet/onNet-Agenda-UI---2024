import React, {
  ChangeEvent,
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { CircularProgress, DialogProps, TextField } from "@material-ui/core";

import { CloseStatus } from "../context";
import { AuthContext } from "../../../../global/context/AuthContext";
import { notificate } from "../../../../global/notificate";

import PhoneNumber from "../../../../models/PhoneNumber";
import PhoneNumberService from "../../../../services/PhoneNumberService";
import ConfirmDialog from "../../../ConfirmDialog";

import { Container } from "./styles";
import Divider from "../../../Divider";
import format from "date-fns/format";
import { IoIosUnlock } from "react-icons/io";

interface ReserveNumberDialogProps extends DialogProps {
  index: number;
  open: boolean;
  phoneNumberId?: number;
  onClose: (options: CloseStatus) => void;
}

const ReserveNumberDialog: React.FC<ReserveNumberDialogProps> = ({
  index,
  open,
  onClose,
  phoneNumberId,
  ...props
}) => {
  const { userPermissions } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [days, setDays] = useState<number | string>();
  const [selectedDate, setSelectedDate] = useState<Date>();

  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<PhoneNumber>();

  useEffect(() => {
    if (open && selectedPhoneNumber?.id === phoneNumberId) {
      if (
        !selectedPhoneNumber?.reserved &&
        !userPermissions?.phone_number.reserve
      ) {
        notificate({
          title: "Erro",
          message: "Você não tem permissão para reservar o número",
          type: "danger",
        });

        onClose({ index, success: false });
      } else if (
        selectedPhoneNumber?.reserved &&
        !userPermissions?.phone_number.release
      ) {
        notificate({
          title: "Erro",
          message: "Você não tem permissão para liberar o número",
          type: "danger",
        });

        onClose({ index, success: false });
      }
    }
  }, [
    open,
    phoneNumberId,
    selectedPhoneNumber?.id,
    selectedPhoneNumber?.reserved,
    userPermissions,
  ]);

  const onSubmit = useCallback(
    async (phoneNumber: PhoneNumber, reserved_until?: Date) => {
      if (phoneNumber.reserved)
        await PhoneNumberService.release(Number(phoneNumber.id));
      else {
        if (!reserved_until) {
          notificate({
            title: "Atenção",
            message: "Preencha todos os campos",
            type: "info",
          });

          throw new Error("reserved_until is missing");
        }

        await PhoneNumberService.reserve(
          Number(phoneNumber.id),
          reserved_until
        );
      }
    },
    []
  );

  const handleClose = useCallback(
    (success?: boolean) => {
      if (success && selectedPhoneNumber) {
        setIsLoading(true);

        onSubmit(selectedPhoneNumber, selectedDate)
          .then(() => {
            notificate({
              title: "Sucesso",
              message: `Número ${
                selectedPhoneNumber.reserved ? "liberado" : "reservado"
              } com sucesso!`,
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
    [index, setIsLoading, onSubmit, onClose, selectedPhoneNumber, selectedDate]
  );

  const handleInputChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      var value = ev.target.value
        .replace(/\D/g, "")
        .replace(/(\d{0,3}).*/g, "$1");

      if (value && Number(ev.target.value) < 1) value = "1";

      setDays(value);
    },
    [setDays]
  );

  const getData = useCallback(async (phoneNumberId: number) => {
    const phoneNumber = (await PhoneNumberService.show(phoneNumberId)).data;

    return { phoneNumber };
  }, []);

  function refresh(phoneNumberId?: number) {
    setSelectedPhoneNumber(undefined);
    setDays(180);

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
    if (days) {
      const date = new Date();

      date.setDate(date.getDate() + Number(days));

      setSelectedDate(date);
    } else setSelectedDate(undefined);
  }, [days, setSelectedDate]);

  useEffect(() => {
    if (open) refresh(phoneNumberId);
  }, [open, phoneNumberId]);

  return (
    <ConfirmDialog
      open={open}
      title={`${selectedPhoneNumber?.reserved ? "Liberar" : "Reservar"} número`}
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
        ) : selectedPhoneNumber?.reserved ? (
          <>
            <IoIosUnlock
              className="centralize"
              size={75}
              color="var(--primary)"
            />

            <h2>Liberar número?</h2>

            <div>
              <p>Ao liberar o número ele ficará disponível para ser alocado!</p>
            </div>

            <strong>{selectedPhoneNumber?.number}</strong>
          </>
        ) : (
          <>
            <h2>Deseja reservar o número?</h2>

            <strong>{selectedPhoneNumber?.number}</strong>

            <form
              onSubmit={(ev) => {
                ev.preventDefault();

                handleClose(true);
              }}
            >
              <span>Selecione por quantos dias o número ficará reservado!</span>

              <TextField
                label="Duração (dias)"
                variant="outlined"
                type="number"
                value={days}
                onChange={handleInputChange}
                required
              />

              {selectedDate && (
                <span>
                  Reservado até:{" "}
                  <strong>{format(selectedDate, "dd/MM/yyyy")}</strong>
                </span>
              )}
            </form>

            <Divider />

            <ul>
              <li>
                Ao atingir a data de liberação, números portabilidade serão
                excluídos, os demais ficarão disponíveis!
              </li>
              <li>Um número reservado não pode ser alocado em um contrato!</li>
            </ul>
          </>
        )}
      </Container>
    </ConfirmDialog>
  );
};

export default memo(ReserveNumberDialog);
