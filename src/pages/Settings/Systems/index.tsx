import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";

import { CircularProgress, TextField } from "@material-ui/core";
import { MdBlock, MdCheck, MdEdit } from "react-icons/md";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
} from "react-icons/io5";

import { padronize } from "../../../global/globalFunctions";
import { notificate } from "../../../global/notificate";
import { Table, TBody, Td, Th, THead } from "../../../components/Table";

import ConfirmDialog from "../../../components/ConfirmDialog";
import MessageInfo from "../../../components/MessageInfo";
import Button from "../../../components/Button";
import Divider from "../../../components/Divider";
import SettingsChildren from "../SettingsChildren";
import System from "../../../models/System";
import SystemService from "../../../services/SystemService";

import { Container, DialogContainer } from "./styles";

const Systems: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [dialogOpened, setDialogOpened] = useState<number | null>(null);
  const [dialogIsLoading, setDialogIsLoading] = useState<boolean>(false);

  const [selectedSystem, setSelectedSystem] = useState<System | null>(null);
  const [systemForm, setSystemForm] = useState<System>({} as System);

  const [systems, setSystems] = useState<System[]>();

  const systemsFiltered = useMemo(() => {
    const value = padronize(query);

    const data =
      systems?.filter(
        (system) =>
          padronize(system.name).indexOf(value) > -1 ||
          padronize(system.short_name).indexOf(value) > -1 ||
          padronize(system.identifier).indexOf(value) > -1
      ) || [];

    return { ...systems, data };
  }, [systems, query]);

  async function onSubmit(system: System, id?: number) {
    if (!id && (!system.name || !system.short_name || !system.identifier)) {
      notificate({
        title: "Atenção",
        message: "Preencha todos os campos!",
        type: "info",
      });

      throw new Error("Missing data form");
    }

    if (id) await SystemService.update(id, { ...system });
    else await SystemService.store(system);
  }

  async function onInactivateSystem(id: number, active: boolean) {
    await SystemService.update(id, { active } as System);
  }

  function refresh() {
    setIsLoading(true);

    SystemService.index({ order_by: "name" })
      .then((response) => setSystems(response.data))
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar os sistemas",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  function submitDialog() {
    setDialogIsLoading(true);

    onSubmit(systemForm, selectedSystem?.id)
      .then(() => {
        setDialogOpened(null);
        refresh();
      })
      .catch((err) => {
        if (err.response?.status === 409)
          notificate({
            title: "Aviso",
            message: "Este sistema já está cadastrado",
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

    onInactivateSystem(
      Number(selectedSystem?.id),
      !Boolean(selectedSystem?.active)
    )
      .then(() => {
        setDialogOpened(null);
        refresh();
      })
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao tentar remover o sistema",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setDialogIsLoading(false));
  }

  const handleFormInputChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement | { name?: string; value: any }>) => {
      var { name, value } = ev.target;

      setSystemForm((prev) => ({ ...prev, [name || ""]: value }));
    },
    [setSystemForm]
  );

  const handleDialogOpen = useCallback(
    (index: number, systemId?: number) => {
      setSystemForm({} as System);
      setDialogOpened(index);

      if (systemId) {
        setDialogIsLoading(true);

        SystemService.show(systemId)
          .then((response) => {
            setSelectedSystem(response.data);
            setSystemForm(response.data);
          })
          .catch((err) => {
            if (err.response?.status === 404)
              notificate({
                title: "Aviso",
                message: "Este sistema não foi encontrado",
                type: "warning",
              });
            else
              notificate({
                title: `Erro ${err.response?.status || ""}`,
                message: "Ocorreu um erro ao carregar o sistema",
                type: "danger",
              });

            setDialogOpened(null);

            console.log(err);
          })
          .finally(() => setDialogIsLoading(false));
      } else setSelectedSystem(null);
    },
    [setDialogIsLoading, setSelectedSystem, setSystemForm]
  );

  const handleDialogClose = useCallback(
    (success: boolean) => {
      if (success) {
        if (dialogOpened === 1) submitDialog();
        if (dialogOpened === 2) inactivateDialog();
      } else setDialogOpened(null);
    },
    [systemForm, selectedSystem]
  );

  useEffect(() => {
    refresh();
  }, []);

  return (
    <>
      <SettingsChildren
        inputProps={{
          value: query,
          onChange: useCallback((ev) => setQuery(ev.target.value), [setQuery]),
          disabled: !systems,
        }}
        onAddClick={() => handleDialogOpen(1)}
      >
        <Container>
          {isLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : systems ? (
            systems.length ? (
              <Table>
                <THead>
                  <tr>
                    <Th short>ID</Th>
                    <Th>Sistema</Th>
                    <Th>Abreviação</Th>
                    <Th>Status</Th>
                    <Th>Identificador</Th>
                    <Th></Th>
                    <Th></Th>
                  </tr>
                </THead>
                <TBody>
                  {systemsFiltered.data.map((system) => (
                    <tr key={system.id}>
                      <Td>{system.id} </Td>
                      <Td>{system.name}</Td>
                      <Td>{system.short_name}</Td>
                      {Boolean(system.active) ? (
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
                      <Td>{system.identifier}</Td>
                      <Td noBackground short>
                        <Button
                          title="Editar"
                          className="centralize"
                          icon={<MdEdit />}
                          background={"var(--info)"}
                          onClick={() => handleDialogOpen(1, system.id)}
                        />
                      </Td>
                      <Td noBackground short>
                        {Boolean(system.active) ? (
                          <Button
                            title="Inativar"
                            className="centralize"
                            icon={<MdBlock />}
                            background="var(--danger)"
                            onClick={() => handleDialogOpen(2, system.id)}
                          />
                        ) : (
                          <Button
                            title="Ativar"
                            className="centralize"
                            icon={<MdCheck />}
                            background="var(--primary)"
                            onClick={() => handleDialogOpen(2, system.id)}
                          />
                        )}
                      </Td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            ) : (
              <MessageInfo>Nenhum sistema encontrado</MessageInfo>
            )
          ) : (
            <MessageInfo>Não foi possível carregar os sistemas</MessageInfo>
          )}
        </Container>
      </SettingsChildren>

      {/* Add system dialog */}
      <ConfirmDialog
        title={`${selectedSystem?.id ? "Editar" : "Adicionar"} sistema`}
        okLabel="Salvar"
        okButtonProps={{ disabled: dialogIsLoading }}
        open={dialogOpened === 1}
        onClose={handleDialogClose}
        maxWidth="xs"
        fullWidth
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
              <div className="line">
                <TextField
                  label="Nome"
                  variant="outlined"
                  name="name"
                  value={systemForm.name || selectedSystem?.name || ""}
                  onChange={handleFormInputChange}
                  autoComplete="off"
                  required
                />

                <TextField
                  label="Abreviação"
                  variant="outlined"
                  name="short_name"
                  value={
                    systemForm.short_name || selectedSystem?.short_name || ""
                  }
                  onChange={handleFormInputChange}
                  autoComplete="off"
                  required
                />
              </div>

              <Divider />

              <div className="line">
                <TextField
                  label="Identificador"
                  variant="outlined"
                  name="identifier"
                  value={
                    systemForm.identifier || selectedSystem?.identifier || ""
                  }
                  onChange={handleFormInputChange}
                  helperText="Parâmetro a ser usado na rota da API"
                  autoComplete="off"
                  required
                />
              </div>
            </form>
          )}
        </DialogContainer>
      </ConfirmDialog>

      {/* Inactivate system dialog */}
      <ConfirmDialog
        title={`${selectedSystem?.active ? "Inativar" : "Ativar"} sistema`}
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
              {selectedSystem?.active ? (
                <IoCloseCircleOutline size={75} color="var(--danger)" />
              ) : (
                <IoCheckmarkCircleOutline size={75} color="var(--success)" />
              )}

              <h2>Deseja continuar?</h2>

              <div>
                <p>
                  Tem certeza que deseja{" "}
                  {selectedSystem?.active ? (
                    <strong>INATIVAR</strong>
                  ) : (
                    <strong>ATIVAR</strong>
                  )}{" "}
                  o sistema
                </p>
              </div>

              <strong>{selectedSystem?.name}</strong>
            </div>
          )}
        </DialogContainer>
      </ConfirmDialog>
    </>
  );
};

export default Systems;
