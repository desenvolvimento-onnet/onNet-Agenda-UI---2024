import React, {
  ChangeEvent,
  FormEvent,
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  CircularProgress,
  DialogProps,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@material-ui/core";
import { IoCloseCircleOutline } from "react-icons/io5";

import { CloseStatus } from "../context";
import { AuthContext } from "../../../../global/context/AuthContext";
import { notificate } from "../../../../global/notificate";

import PhoneNumber from "../../../../models/PhoneNumber";
import PhoneNumberService, {
  PhoneNumberFilterProps,
} from "../../../../services/PhoneNumberService";
import ConfirmDialog from "../../../ConfirmDialog";

import { Container } from "./styles";
import Contract from "../../../../models/Contract";
import Button from "../../../Button";
import { padronize } from "../../../../global/globalFunctions";
import ContractService, {
  ContractFilterProps,
} from "../../../../services/ContractService";
import Divider from "../../../Divider";
import City from "../../../../models/City";
import MessageInfo from "../../../MessageInfo";

interface BindNumberDialogProps extends DialogProps {
  index: number;
  open: boolean;
  phoneNumberIds: number[];
  cityId: number;
  onClose: (options: CloseStatus) => void;
}

interface SearchForm {
  query: string;
  contract_id?: number;
}

const BindNumberDialog: React.FC<BindNumberDialogProps> = ({
  index,
  open,
  phoneNumberIds,
  cityId,
  onClose,
  ...props
}) => {
  const { userPermissions, user } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>();
  const [contracts, setContracts] = useState<Contract[]>();

  const [searchForm, setSearchForm] = useState<SearchForm>({ query: "" });

  useEffect(() => {
    if (open && !userPermissions?.phone_number.bind.allow) {
      notificate({
        title: "Erro",
        message: "Você não tem permissão para alocar o(s) número(s)",
        type: "danger",
      });

      onClose({ index, success: false });
    }
  }, [open, userPermissions]);

  useEffect(() => {
    const contract = contracts?.find(
      (contract) => contract.id ==  searchForm.contract_id
    );

    if (open && contract && contract.city_id != cityId) {
      if (userPermissions?.phone_number.bind.another_city)
        notificate({
          title: "Atenção",
          message:
            "O contrato selecionado possui uma cidade diferente do(s) número(s) a serem alocados",
          type: "info",
        });
      else {
        notificate({
          title: "Erro",
          message:
            "Você não tem permissão para alocar um número em um contrato com cidades diferente",
          type: "danger",
        });

        setSearchForm((prev) => ({ ...prev, contract_id: undefined }));
      }
    }
  }, [
    open,
    userPermissions,
    cityId,
    searchForm.contract_id,
    setSearchForm,
    contracts,
  ]);

  const onSubmit = useCallback(
    async (phoneNumberIds: number[], contractId: number) => {
      if (!phoneNumberIds.length) {
        notificate({
          title: "Atenção",
          message: "Nenhum número foi selecionado",
          type: "info",
        });

        throw new Error("phone_numbers is missing");
      }

      const phoneNumbers = await PhoneNumberService.bindMultiple(
        contractId,
        phoneNumberIds
      );

      return phoneNumbers.data;
    },
    []
  );

  const handleClose = useCallback(
    (success?: boolean) => {
      if (success && phoneNumbers && searchForm.contract_id) {
        setIsLoading(true);

        onSubmit(
          phoneNumbers.map((phoneNumber) => Number(phoneNumber.id)),
          searchForm.contract_id
        )
          .then((amount) => {
            notificate({
              title: "Sucesso",
              message: `${amount} número(s) alocado(s) com sucesso!`,
              type: "success",
            });

            onClose({ index, success });
          })
          .catch((err) => {
            if (err.response?.status === 409)
              notificate({
                title: "Aviso",
                message: "Este número de telefone já foi cadastrado",
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
    [
      index,
      setIsLoading,
      onSubmit,
      onClose,
      phoneNumbers,
      searchForm.contract_id,
    ]
  );

  const getData = useCallback(async (phoneNumberIds: number[]) => {
    const phoneNumbers = (
      await PhoneNumberService.filter({
        phoneNumberIds,
      } as PhoneNumberFilterProps)
    ).data.data;

    return { phoneNumbers };
  }, []);

  const getContracts = useCallback(
    async (query: string) => {
      if (!query) {
        notificate({
          title: "Atenção",
          message: "Preencha o campo de busca",
          type: "info",
        });

        throw new Error("query is missing");
      }

      const pagination = (
        await ContractService.filter(
          {
            query,
            city_id: userPermissions?.phone_number.bind.another_city
              ? undefined
              : cityId,
          } as ContractFilterProps,
          { per_page: 20 }
        )
      ).data;

      const contracts = pagination.data.filter(
        (contract) =>
          !contract.canceled &&
          (user?.cities as City[] | undefined)?.find(
            (city) => city.id === cityId
          )
      );

      return { contracts };
    },
    [user?.cities, cityId]
  );

  const handleFormSubmit = useCallback(
    (ev: FormEvent) => {
      ev.preventDefault();

      const value = padronize(searchForm.query);

      setSearchForm((prev) => ({ ...prev, contract_id: undefined }));
      setIsLoading(true);

      getContracts(value)
        .then((response) => setContracts(response.contracts))
        .catch((err) => {
          if (err.response?.status)
            notificate({
              title: `Erro ${err.response.status}`,
              message: "Ocorreu um erro ao carregar os contratos",
              type: "danger",
            });

          console.log(err);
        })
        .finally(() => setIsLoading(false));
    },

    [searchForm.query, setSearchForm, setIsLoading, setContracts, getContracts]
  );

  const handleInputChange = useCallback(
    (ev: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const { name, value } = ev.target;

      setSearchForm((prev) => ({ ...prev, [name]: value }));
    },
    [setSearchForm]
  );

  function refresh(phoneNumberIds: number[]) {
    setPhoneNumbers(undefined);
    setContracts(undefined);

    if (phoneNumberIds.length) {
      setIsLoading(true);

      getData(phoneNumberIds)
        .then((response) => {
          var hasNumberInactive = false;
          var hasNumberAlocated = false;
          var hasNumberReserved = false;

          response.phoneNumbers.forEach((phoneNumber) => {
            if (!phoneNumber.active) {
              notificate({
                title: "Aviso",
                message: `O número ${phoneNumber.number} está inativo`,
                type: "warning",
              });

              hasNumberInactive = true;
            } else if (phoneNumber.alocated) {
              notificate({
                title: "Aviso",
                message: `O número ${phoneNumber.number} já está vinculado em um contrato`,
                type: "warning",
              });

              hasNumberAlocated = true;
            } else if (phoneNumber.reserved) {
              notificate({
                title: "Aviso",
                message: `O número ${phoneNumber.number} está reservado`,
                type: "warning",
              });

              hasNumberReserved = true;
            }
          });

          if (hasNumberAlocated || hasNumberReserved || hasNumberInactive)
            handleClose(false);
          else setPhoneNumbers(response.phoneNumbers);
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
    setSearchForm({ query: "" });

    if (open) refresh(phoneNumberIds);
  }, [open, phoneNumberIds, setSearchForm]);

  return (
    <ConfirmDialog
      open={open}
      title="Alocar números"
      okLabel="Ok"
      cancelLabel="Voltar"
      onClose={handleClose}
      okButtonProps={{
        disabled:
          isLoading || !searchForm.contract_id || !phoneNumberIds.length,
      }}
      fullWidth
      maxWidth="sm"
      {...props}
    >
      <Container>
        {isLoading ? (
          <CircularProgress size={100} className="centralize" />
        ) : (
          <>
            <form onSubmit={handleFormSubmit}>
              <TextField
                label="Buscar contrato"
                placeholder="Cód. contrato ou Nome do cliente"
                name="query"
                value={searchForm.query}
                onChange={handleInputChange}
                autoComplete="off"
              />

              <Button
                title="Buscar contrato"
                background="var(--info)"
                type="submit"
              >
                Buscar
              </Button>
            </form>

            <Divider />

            {contracts && contracts.length ? (
              <RadioGroup
                className="radio-group"
                name="contract_id"
                value={searchForm.contract_id || ""}
                onChange={handleInputChange}
              >
                {contracts.map((contract) => (
                  <FormControlLabel
                    key={contract.id}
                    className={`radio-item${
                      searchForm.contract_id == contract.id ? " selected" : ""
                    }`}
                    value={String(contract.id)}
                    control={<Radio color="primary" />}
                    label={
                      <div className="radio-item-content">
                        <p>
                          {contract.client_number
                            ? `${contract.client_number} (${contract.contract_number})`
                            : contract.contract_number}{" "}
                          - {contract.client}
                        </p>
                        <span>
                          {contract.street}, {contract.district},{" "}
                          {contract.number}{" "}
                          {contract.complement && `- ${contract.complement}`} -{" "}
                          {contract.city?.name}/{contract.city?.state}
                        </span>
                        <br />
                        <span>
                          <strong>{contract.plan?.name}</strong>
                        </span>
                      </div>
                    }
                  />
                ))}
              </RadioGroup>
            ) : (
              <MessageInfo>Nenhum contrato encontrado</MessageInfo>
            )}
          </>
        )}
      </Container>
    </ConfirmDialog>
  );
};

export default memo(BindNumberDialog);
