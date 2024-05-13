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
import ContractService from "../../../../services/ContractService";
import Contract from "../../../../models/Contract";
import MessageInfo from "../../../MessageInfo";
import Divider from "../../../Divider";

import { Container } from "./styles";
import { IoCloseCircleOutline } from "react-icons/io5";

interface DeleteContractDialogProps extends DialogProps {
  index: number;
  open: boolean;
  contractId?: number;
  onClose: (options: CloseStatus) => void;
}

const DeleteContractDialog: React.FC<DeleteContractDialogProps> = ({
  index,
  open,
  onClose,
  contractId,
  ...props
}) => {
  const { userPermissions } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [contract, setContract] = useState<Contract>();

  useEffect(() => {
    if (open && !userPermissions?.contract.delete) {
      notificate({
        title: "Erro",
        message: "Você não tem permissão para deletar o contrato",
        type: "danger",
      });

      onClose({ index, success: false });
    }
  }, [open, userPermissions]);

  const onSubmit = useCallback(async (contract: Contract) => {
    await ContractService.delete(Number(contract.id));
  }, []);

  const handleClose = useCallback(
    (success?: boolean) => {
      if (success && contract) {
        setIsLoading(true);

        onSubmit(contract)
          .then(() => {
            notificate({
              title: "Sucesso",
              message: "Contrato deletado com sucesso!",
              type: "success",
            });

            onClose({ index, success });
          })
          .catch((err) => {
            notificate({
              title: `Erro ${err.response?.status || ""}`,
              message: "Ocorreu um erro ao deletar o contrato",
              type: "danger",
            });

            console.log(err);
          })
          .finally(() => setIsLoading(false));
      } else onClose({ index, success });
    },
    [onClose, index, onSubmit, contract]
  );

  async function getData(id: number) {
    const contract = (await ContractService.show(id)).data;

    return { contract };
  }

  function refresh() {
    setContract(undefined);

    if (!contractId) {
      handleClose();

      return;
    }

    setIsLoading(true);

    getData(contractId)
      .then((response) => {
        if (response.contract.phoneNumbers?.length) {
          notificate({
            title: "Aviso",
            message:
              "Esse contrato possui números de telefone vinculados a ele",
            type: "warning",
          });

          handleClose();
        } else if (response.contract.orders?.length) {
          notificate({
            title: "Aviso",
            message: "Esse contrato possui O.S vinculada a ele",
            type: "warning",
          });

          handleClose();
        } else setContract(response.contract);
      })
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar o contrato",
          type: "danger",
        });

        handleClose();

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if (open) refresh();
  }, [open, contractId]);

  return (
    <ConfirmDialog
      open={open}
      title="Deletar contrato"
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
        ) : contract ? (
          <>
            <IoCloseCircleOutline size={75} color="var(--danger)" />
            <h2>Confirmar exclusão?</h2>

            <div>
              <p>
                <strong>
                  {contract.client_number
                    ? `${contract.client_number} (${contract.contract_number})`
                    : contract.contract_number}{" "}
                  - {contract.client}
                </strong>
              </p>
              <span>
                {contract.street}, {contract.district}, {contract.number}{" "}
                {contract.complement && `- ${contract.complement}`} -{" "}
                {contract.city?.name}/{contract.city?.state}
              </span>
            </div>

            <Divider />

            <div>
              <p>Tem certeza que deseja deletar o contrato?</p>
              <p>Este processedimento é irreversível!</p>
            </div>
          </>
        ) : (
          open && (
            <MessageInfo>Não foi possível carregar o contrato</MessageInfo>
          )
        )}
      </Container>
    </ConfirmDialog>
  );
};

export default memo(DeleteContractDialog);
