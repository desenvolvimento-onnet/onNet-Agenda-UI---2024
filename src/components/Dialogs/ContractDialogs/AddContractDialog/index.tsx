import React, {
  ChangeEvent,
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  CircularProgress,
  DialogProps,
  Step,
  StepLabel,
  Stepper,
} from "@material-ui/core";

import { CloseStatus } from "../context";
import { notificate } from "../../../../global/notificate";
import { AuthContext } from "../../../../global/context/AuthContext";

import Contract from "../../../../models/Contract";
import ConfirmDialog from "../../../ConfirmDialog";
import ContractService from "../../../../services/ContractService";
import InformationStep from "./InfomationStep";
import ContractStep from "./ContractStep";
import ContactStep from "./ContactStep";
import AddressStep from "./AddressStep";

import { Container, Content } from "./styles";
import format from "date-fns/format";

interface AddContractDialogProps extends DialogProps {
  index: number;
  open: boolean;
  contractId?: number;
  onClose: (options: CloseStatus) => void;
}

const steps = ["Informações", "Contrato", "Contato", "Endereço"];

const AddContractDialog: React.FC<AddContractDialogProps> = ({
  index,
  open,
  onClose,
  contractId,
  ...props
}) => {
  const { userPermissions } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);

  const [selectedContract, setSelectedContract] = useState<Contract>();
  const [contractForm, setContractForm] = useState<Contract>({} as Contract);

  useEffect(() => {
    if (open) {
      if (!contractId && !userPermissions?.contract.add) {
        notificate({
          title: "Erro",
          message: "Você não tem permissão para adicionar um contrato",
          type: "danger",
        });

        onClose({ index, success: false });
      } else if (contractId && !userPermissions?.contract.edit) {
        notificate({
          title: "Erro",
          message: "Você não tem permissão para editar o contrato",
          type: "danger",
        });

        onClose({ index, success: false });
      }
    }
  }, [open, userPermissions]);

  const handleStepSubmit = useCallback(() => {
    setActiveStep((prev) => prev + 1);
  }, [setActiveStep]);

  const handleBackStep = useCallback(() => {
    setActiveStep((prev) => prev - 1);
  }, [setActiveStep]);

  const onSubmit = useCallback(async (contract: Contract, id?: number) => {
    if (contract.canceled) {
      notificate({
        title: "Aviso",
        message: "Este contrato já está cancelado!",
        type: "warning",
      });

      throw new Error("Contract already canceled");
    }

    if (
      !id &&
      (!contract.contract_number ||
        !contract.client ||
        !contract.cpf_cnpj ||
        !contract.cellphone ||
        !contract.city_id ||
        !contract.zip_code ||
        !contract.district ||
        !contract.street ||
        !contract.number ||
        !contract.contract_type_id ||
        !contract.accession_date ||
        !contract.conclusion_date ||
        !contract.expiration_day ||
        !contract.month_amount)
    ) {
      notificate({
        title: "Atenção",
        message: "Preencha todos os campos!",
        type: "info",
      });
      throw new Error("Missing data form");
    }

    if (contract.birthday_foundation)
      contract.birthday_foundation = format(
        new Date(contract.birthday_foundation),
        "yyyy-MM-dd 00:00:00"
      );

    if (contract.accession_date)
      contract.accession_date = format(
        new Date(contract.accession_date),
        "yyyy-MM-dd 00:00:00"
      );

    if (contract.conclusion_date)
      contract.conclusion_date = format(
        new Date(contract.conclusion_date),
        "yyyy-MM-dd 00:00:00"
      );

    if (id) await ContractService.update(id, contract);
    else await ContractService.store(contract);
  }, []);

  const handleClose = useCallback(
    (success?: boolean) => {
      if (success) {
        setIsLoading(true);

        onSubmit(contractForm, contractId)
          .then(() => onClose({ index, success }))
          .catch((err) => {
            if (err.response?.status === 409)
              notificate({
                title: "Aviso",
                message: "Este contrato já foi importado",
                type: "warning",
              });
            else if (err.response?.status)
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
    [setIsLoading, onSubmit, contractForm, onClose, contractId]
  );

  const handleInputChange = useCallback(
    (
      ev: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | { name?: string; value?: any }
      >,
      checked?: boolean
    ) => {
      const { name, value } = ev.target;

      const switchButton: Array<keyof Contract> = [
        "legal_person",
        "free_installation_tax",
        "canceled",
        "ddr",
      ];

      var data = {
        [name || ""]: switchButton.includes(name as keyof Contract)
          ? checked
          : value,
      };

      setContractForm((prev) => ({ ...prev, ...data }));
    },
    [setContractForm]
  );

  const getContract = useCallback(async (contractId: number) => {
    const contract: Contract = (await ContractService.show(contractId)).data;

    return { contract };
  }, []);

  function refresh() {
    setContractForm({
      accession_date: null,
      conclusion_date: null,
      birthday_foundation: null,
    } as Contract);
    setActiveStep(0);

    if (contractId) {
      setIsLoading(true);

      getContract(contractId)
        .then((response) => {
          if (response.contract.canceled) {
            notificate({
              title: "Aviso",
              message: "Este contrato já está cancelado!",
              type: "warning",
            });

            handleClose();
          } else {
            setSelectedContract(response.contract);
            setContractForm(new Contract(response.contract));
          }
        })
        .catch((err) => {
          if (err.response?.status === 404)
            notificate({
              title: "Aviso",
              message: "Este contrato não foi encontrado",
              type: "warning",
            });
          else
            notificate({
              title: `Erro ${err.response?.status || ""}`,
              message: "Ocorreu um erro ao carregar o contrato",
              type: "danger",
            });

          handleClose(false);

          console.log(err);
        })
        .finally(() => setIsLoading(false));
    }
  }

  useEffect(() => {
    if (open) refresh();
  }, [open]);

  return (
    <ConfirmDialog
      open={open}
      title={`${selectedContract?.id ? "Editar" : "Adicionar"} contrato`}
      okLabel=""
      cancelLabel="Sair"
      onClose={handleClose}
      okButtonProps={{
        disabled: isLoading || activeStep < steps.length - 1,
      }}
      fullWidth
      maxWidth="md"
      {...props}
    >
      <Container>
        {isLoading ? (
          <CircularProgress size={100} className="centralize" />
        ) : (
          <>
            <Stepper activeStep={activeStep}>
              {steps.map((label) => (
                <Step key={label} completed={false}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Content>
              <InformationStep
                active={activeStep === 0}
                value={contractForm}
                onChange={handleInputChange}
                onSubmit={handleStepSubmit}
              />

              <ContractStep
                active={activeStep === 1}
                value={{ ...contractForm, plan: selectedContract?.plan }}
                onChange={handleInputChange}
                onBackStep={handleBackStep}
                onSubmit={handleStepSubmit}
              />

              <ContactStep
                active={activeStep === 2}
                value={contractForm}
                onChange={handleInputChange}
                onBackStep={handleBackStep}
                onSubmit={handleStepSubmit}
              />

              <AddressStep
                active={activeStep === 3}
                value={contractForm}
                onChange={handleInputChange}
                onBackStep={handleBackStep}
                onSubmit={() => handleClose(true)}
                submitTitle="Salvar"
              />
            </Content>
          </>
        )}
      </Container>
    </ConfirmDialog>
  );
};

export default memo(AddContractDialog);
