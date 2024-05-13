import { useState, useCallback, useMemo, useEffect, ChangeEvent } from "react";

import { CircularProgress, TextField } from "@material-ui/core";
import { MdBlock, MdCheck, MdEdit } from "react-icons/md";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoDocumentText,
} from "react-icons/io5";

import { padronize } from "../../../global/globalFunctions";
import { notificate } from "../../../global/notificate";
import { Table, TBody, Td, Th, THead } from "../../../components/Table";

import ConfirmDialog from "../../../components/ConfirmDialog";
import Button from "../../../components/Button";
import MessageInfo from "../../../components/MessageInfo";
import ContractType from "../../../models/ContractType";
import SettingsChildren from "../SettingsChildren";
import ContractTypeService from "../../../services/ContractTypeService";

import { Container, DialogContainer } from "./styles";
import { useHistory } from "react-router-dom";
import { format } from "date-fns";

const ContractTypes: React.FC = () => {
  const { push } = useHistory();

  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [dialogOpened, setDialogOpened] = useState<number | null>(null);
  const [dialogIsLoading, setDialogIsLoading] = useState<boolean>(false);

  const [selectedContractType, setSelectedContractType] =
    useState<ContractType | null>(null);
  const [contractTypeForm, setContractTypeForm] = useState<ContractType>(
    {} as ContractType
  );

  const [contractTypes, setContractTypes] = useState<ContractType[]>();

  function refresh() {
    setIsLoading(true);

    ContractTypeService.index({ order_by: "name" })
      .then((response) => setContractTypes(response.data))
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar os tipos de contrato",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  async function onSubmit(contractType: ContractType, id?: number) {
    if (!id && !contractType.name) {
      notificate({
        title: "Atenção",
        message: "Preencha todos os campos!",
        type: "info",
      });

      throw new Error("Missing data form");
    }

    if (id) await ContractTypeService.update(id, contractType);
    else await ContractTypeService.store(contractType);
  }

  async function onInactivateContractType(id: number, active: boolean) {
    await ContractTypeService.update(id, { active } as ContractType);
  }

  function submitDialog() {
    setDialogIsLoading(true);

    onSubmit(contractTypeForm, selectedContractType?.id)
      .then(() => {
        setDialogOpened(null);
        refresh();
      })
      .catch((err) => {
        if (err.response?.status === 409)
          notificate({
            title: "Aviso",
            message: "Este tipo de contrato já está cadastrado",
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
      .finally(() => setDialogIsLoading(false));
  }

  function inactivateDialog() {
    setDialogIsLoading(true);

    onInactivateContractType(
      Number(selectedContractType?.id),
      !Boolean(selectedContractType?.active)
    )
      .then(() => {
        setDialogOpened(null);
        refresh();
      })
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao tentar ativar/inativar o plano",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setDialogIsLoading(false));
  }

  const handleDialogOpen = useCallback(
    (index: number, contractTypeId?: number) => {
      setContractTypeForm({} as ContractType);
      setDialogOpened(index);

      if (contractTypeId) {
        setDialogIsLoading(true);

        ContractTypeService.show(contractTypeId)
          .then((response) => setSelectedContractType(response.data))
          .catch((err) => {
            if (err.response?.status === 404)
              notificate({
                title: "Aviso",
                message: "Este tipo de contrato não foi encontrado",
                type: "warning",
              });
            else
              notificate({
                title: `Erro ${err.response?.status || ""}`,
                message: "Ocorreu um erro ao carregar o tipo de contrato",
                type: "danger",
              });

            setDialogOpened(null);

            console.log(err);
          })
          .finally(() => setDialogIsLoading(false));
      } else setSelectedContractType(null);
    },
    [
      setDialogIsLoading,
      setContractTypeForm,
      setDialogOpened,
      setSelectedContractType,
    ]
  );

  const handleDialogClose = useCallback(
    (success: boolean) => {
      if (success) {
        if (dialogOpened === 1) submitDialog();
        if (dialogOpened === 2) inactivateDialog();
      } else setDialogOpened(null);
    },
    [contractTypeForm, selectedContractType, setDialogOpened]
  );

  const handleInputChange = useCallback(
    (
      ev: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | { name?: string; value?: any }
      >
    ) => {
      const { name, value } = ev.target;

      setContractTypeForm((prev) => ({ ...prev, [name || ""]: value }));
    },
    [setContractTypeForm]
  );

  // First loading
  useEffect(() => {
    refresh();
  }, []);

  // Filter contractTypes
  const contractTypesFiltered = useMemo<ContractType[]>(() => {
    if (!contractTypes) return [];

    const value = padronize(query);

    const data = contractTypes.filter(
      (contractType) => padronize(contractType.name).indexOf(value) > -1
    );

    return data;
  }, [query, contractTypes]);

  return (
    <>
      <SettingsChildren
        inputProps={{
          value: query,
          onChange: useCallback((ev) => setQuery(ev.target.value), [setQuery]),
          disabled: !contractTypes,
        }}
        onAddClick={() => handleDialogOpen(1)}
      >
        <Container>
          {isLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : contractTypes ? (
            contractTypes.length ? (
              <Table>
                <THead>
                  <tr>
                    <Th short>ID</Th>
                    <Th>Tipo de contrato</Th>
                    <Th>Status</Th>
                    <Th>Última alteração</Th>
                    <Th></Th>
                    <Th></Th>
                    <Th></Th>
                  </tr>
                </THead>
                <TBody>
                  {contractTypesFiltered.map((contractType) => (
                    <tr key={contractType.id}>
                      <Td>{contractType.id}</Td>
                      <Td>{contractType.name}</Td>
                      {Boolean(contractType.active) ? (
                        <Td
                          style={{
                            background: "var(--success)",
                            color: "var(--white)",
                          }}
                        >
                          Ativo
                        </Td>
                      ) : (
                        <Td
                          style={{
                            background: "var(--danger)",
                            color: "var(--white)",
                          }}
                        >
                          Inativo
                        </Td>
                      )}
                      <Td>
                        {format(
                          new Date(contractType.updated_at || ""),
                          "dd/MM/yyyy 'às' hh:mm'h'"
                        )}
                      </Td>
                      <Td noBackground short>
                        <Button
                          title="Editar"
                          className="centralize"
                          icon={<MdEdit />}
                          background={"var(--info)"}
                          onClick={() => handleDialogOpen(1, contractType.id)}
                        />
                      </Td>
                      <Td noBackground short>
                        {Boolean(contractType.active) ? (
                          <Button
                            title="Inativar"
                            className="centralize"
                            icon={<MdBlock />}
                            background="var(--danger)"
                            onClick={() => handleDialogOpen(2, contractType.id)}
                          />
                        ) : (
                          <Button
                            title="Ativar"
                            className="centralize"
                            icon={<MdCheck />}
                            background="var(--primary)"
                            onClick={() => handleDialogOpen(2, contractType.id)}
                          />
                        )}
                      </Td>
                      <Td noBackground short>
                        <Button
                          title="Editar template"
                          className="centralize"
                          icon={<IoDocumentText />}
                          background={"var(--secondary-dark)"}
                          onClick={() =>
                            push(`/settings/contract_types/${contractType.id}`)
                          }
                        />
                      </Td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            ) : (
              <MessageInfo>Nenhum tipo de contrato encontrado</MessageInfo>
            )
          ) : (
            <MessageInfo>
              Não foi possível carregar os tipos de contrato
            </MessageInfo>
          )}
        </Container>
      </SettingsChildren>

      {/* Add ContractType Dialog - INDEX 1 */}
      <ConfirmDialog
        title={`${
          selectedContractType?.id ? "Editar" : "Adicionar"
        } tipo de contrato`}
        okLabel="Salvar"
        open={dialogOpened === 1}
        onClose={handleDialogClose}
        okButtonProps={{
          disabled:
            dialogIsLoading || JSON.stringify(contractTypeForm) === "{}",
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogContainer>
          {dialogIsLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : (
            <form
              onSubmit={(ev) => {
                ev.preventDefault();

                handleDialogClose(true);
              }}
            >
              <TextField
                label="Nome"
                variant="outlined"
                autoComplete="off"
                name="name"
                value={
                  contractTypeForm?.name || selectedContractType?.name || ""
                }
                onChange={handleInputChange}
                required
              />
            </form>
          )}
        </DialogContainer>
      </ConfirmDialog>

      {/* Inactivate ContractType Dialog - INDEX 2 */}
      <ConfirmDialog
        title={`${
          selectedContractType?.active ? "Inativar" : "Ativar"
        } Tipo de Contrato`}
        open={dialogOpened === 2}
        onClose={handleDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogContainer>
          {dialogIsLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : (
            <div className="alert">
              {selectedContractType?.active ? (
                <IoCloseCircleOutline size={75} color="var(--danger)" />
              ) : (
                <IoCheckmarkCircleOutline size={75} color="var(--success)" />
              )}

              <h2>Deseja continuar?</h2>

              <div>
                <p>
                  Tem certeza que deseja{" "}
                  {selectedContractType?.active ? (
                    <strong>INATIVAR</strong>
                  ) : (
                    <strong>ATIVAR</strong>
                  )}{" "}
                  o tipo de contrato
                </p>
              </div>

              <strong>{selectedContractType?.name}</strong>
            </div>
          )}
        </DialogContainer>
      </ConfirmDialog>
    </>
  );
};

export default ContractTypes;
