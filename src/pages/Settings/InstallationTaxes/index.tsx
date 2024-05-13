import { useState, useCallback, useMemo, useEffect, ChangeEvent } from "react";

import { CircularProgress, TextField } from "@material-ui/core";
import { MdBlock, MdCheck, MdEdit } from "react-icons/md";

import { padronize } from "../../../global/globalFunctions";
import { notificate } from "../../../global/notificate";
import { Table, TBody, Td, Th, THead } from "../../../components/Table";

import ConfirmDialog from "../../../components/ConfirmDialog";
import Button from "../../../components/Button";
import MessageInfo from "../../../components/MessageInfo";
import SettingsChildren from "../SettingsChildren";
import InstallationTaxService from "../../../services/InstallationTaxService";
import InstallationTax from "../../../models/InstallationTax";

import { Container, DialogContainer } from "./styles";

const InstallationTaxes: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [dialogOpened, setDialogOpened] = useState<number | null>(null);
  const [dialogIsLoading, setDialogIsLoading] = useState<boolean>(false);

  const [selectedInstallationTax, setSelectedInstallationTax] =
    useState<InstallationTax | null>(null);
  const [installationTaxForm, setInstallationTaxForm] =
    useState<InstallationTax>({} as InstallationTax);

  const [installationTaxes, setInstallationTaxes] =
    useState<InstallationTax[]>();

  function refresh() {
    setIsLoading(true);

    InstallationTaxService.index({ order_by: "name" })
      .then((response) => setInstallationTaxes(response.data))
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar as taxas de instalação",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  async function onSubmit(installationTax: InstallationTax, id?: number) {
    if (!id && (!installationTax.name || !installationTax.base_value)) {
      notificate({
        title: "Atenção",
        message: "Preencha todos os campos!",
        type: "info",
      });

      throw new Error("Missing data form");
    }

    if (id) await InstallationTaxService.update(id, installationTax);
    else await InstallationTaxService.store(installationTax);
  }

  async function inactivate(installationTaxId: number, active: boolean) {
    await InstallationTaxService.update(installationTaxId, {
      active,
    } as InstallationTax);
  }

  const handleDialogOpen = useCallback(
    (index: number, installationTaxId?: number) => {
      setInstallationTaxForm({} as InstallationTax);
      setDialogOpened(index);

      if (installationTaxId) {
        setDialogIsLoading(true);

        InstallationTaxService.show(installationTaxId)
          .then((response) => {
            setSelectedInstallationTax(response.data);
            setInstallationTaxForm({
              active: response.data.active,
            } as InstallationTax);
          })
          .catch((err) => {
            if (err.response?.status === 404)
              notificate({
                title: "Aviso",
                message: "Esta taxa de instalação não foi encontrada",
                type: "warning",
              });
            else
              notificate({
                title: `Erro ${err.response?.status || ""}`,
                message: "Ocorreu um erro ao carregar a taxa de instalação",
                type: "danger",
              });

            setDialogOpened(null);

            console.log(err);
          })
          .finally(() => setDialogIsLoading(false));
      } else setSelectedInstallationTax(null);
    },
    [
      setInstallationTaxForm,
      setDialogOpened,
      setSelectedInstallationTax,
      setDialogIsLoading,
    ]
  );

  const submitDialog = useCallback(() => {
    setDialogIsLoading(true);

    onSubmit(installationTaxForm, selectedInstallationTax?.id)
      .then(() => {
        setDialogOpened(null);
        refresh();
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
      .finally(() => setDialogIsLoading(false));
  }, [
    installationTaxForm,
    selectedInstallationTax,
    setDialogIsLoading,
    setDialogOpened,
  ]);

  const inactivateDialog = useCallback(() => {
    setDialogIsLoading(true);
    inactivate(
      Number(selectedInstallationTax?.id),
      !Boolean(selectedInstallationTax?.active)
    )
      .then(() => {
        setDialogOpened(null);
        refresh();
      })
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro inativar/ativar a taxa de instalação",
          type: "danger",
        });
        console.log(err);
      })
      .finally(() => setDialogIsLoading(false));
  }, [setDialogIsLoading, setDialogOpened, refresh]);

  const handleDialogClose = useCallback(
    (success: boolean) => {
      if (success) {
        if (dialogOpened === 1) submitDialog();
        else if (dialogOpened === 2) inactivateDialog();
      } else setDialogOpened(null);
    },
    [dialogOpened, submitDialog, inactivateDialog, setDialogOpened]
  );

  const handleInputChange = useCallback(
    (
      ev: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | { name?: string; value?: any }
      >
    ) => {
      const { name, value } = ev.target;

      setInstallationTaxForm((prev) => ({ ...prev, [name || ""]: value }));
    },
    [setInstallationTaxForm]
  );

  // First loading
  useEffect(() => {
    refresh();
  }, []);

  // Filter installationTax
  const installationTaxesFiltered = useMemo<InstallationTax[]>(() => {
    if (!installationTaxes) return [];

    const value = padronize(query);

    const data = installationTaxes.filter(
      (installationTax) => padronize(installationTax.name).indexOf(value) > -1
    );

    return data;
  }, [query, installationTaxes]);

  return (
    <>
      <SettingsChildren
        inputProps={{
          value: query,
          onChange: useCallback((ev) => setQuery(ev.target.value), [setQuery]),
          disabled: !installationTaxes,
        }}
        onAddClick={() => handleDialogOpen(1)}
      >
        <Container>
          {isLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : installationTaxes ? (
            installationTaxes.length ? (
              <Table>
                <THead>
                  <tr>
                    <Th short>ID</Th>
                    <Th>Taxa de instalação</Th>
                    <Th>Status</Th>
                    <Th>Valor</Th>
                    <Th></Th>
                  </tr>
                </THead>
                <TBody>
                  {installationTaxesFiltered.map((installationTax) => (
                    <tr key={installationTax.id}>
                      <Td>{installationTax.id}</Td>
                      <Td>{installationTax.name}</Td>
                      {Boolean(installationTax.active) ? (
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
                      <Td>R$ {installationTax.base_value.toFixed(2)}</Td>
                      <Td noBackground short>
                        <Button
                          title="Editar"
                          className="centralize"
                          icon={<MdEdit />}
                          background={"var(--info)"}
                          onClick={() =>
                            handleDialogOpen(1, installationTax.id)
                          }
                        />
                      </Td>
                      <Td noBackground short>
                        {Boolean(installationTax.active) ? (
                          <Button
                            title="Inativar"
                            className="centralize"
                            icon={<MdBlock />}
                            background="var(--danger)"
                            onClick={() =>
                              handleDialogOpen(2, installationTax.id)
                            }
                          />
                        ) : (
                          <Button
                            title="Ativar"
                            className="centralize"
                            icon={<MdCheck />}
                            background="var(--primary)"
                            onClick={() =>
                              handleDialogOpen(2, installationTax.id)
                            }
                          />
                        )}
                      </Td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            ) : (
              <MessageInfo>Nenhuma taxa de instalação encontrada</MessageInfo>
            )
          ) : (
            <MessageInfo>
              Não foi possível carregar as taxas de instalação
            </MessageInfo>
          )}
        </Container>
      </SettingsChildren>

      {/* Add Installation Tax Dialog - INDEX 1 */}
      <ConfirmDialog
        title={`${
          selectedInstallationTax?.id ? "Editar" : "Adicionar"
        } taxa de instalação`}
        okLabel="Salvar"
        open={dialogOpened === 1}
        onClose={handleDialogClose}
        okButtonProps={{
          disabled:
            dialogIsLoading || JSON.stringify(installationTaxForm) === "{}",
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
                  installationTaxForm?.name ||
                  selectedInstallationTax?.name ||
                  ""
                }
                onChange={handleInputChange}
                required
              />

              <TextField
                label="Valor (R$)"
                variant="outlined"
                autoComplete="off"
                name="base_value"
                value={
                  installationTaxForm?.base_value ||
                  selectedInstallationTax?.base_value ||
                  ""
                }
                type="number"
                onChange={(ev) => {
                  ev.target.value =
                    Number(ev.target.value) < 0 ? "0" : ev.target.value;

                  handleInputChange(ev);
                }}
                required
              />
            </form>
          )}
        </DialogContainer>
      </ConfirmDialog>

      {/* Inactivate Installation Tax Dialog - INDEX 2 */}
      <ConfirmDialog
        title={`${
          Boolean(selectedInstallationTax?.active) ? "Inativar" : "Ativar"
        } taxa de instalação`}
        open={dialogOpened === 2}
        onClose={handleDialogClose}
        okButtonProps={{ disabled: dialogIsLoading }}
        fullWidth
        maxWidth="xs"
      >
        <DialogContainer>
          {dialogIsLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : (
            <p className="info">
              {selectedInstallationTax?.name} - R${" "}
              {selectedInstallationTax?.base_value.toFixed(2)}
            </p>
          )}
        </DialogContainer>
      </ConfirmDialog>
    </>
  );
};

export default InstallationTaxes;
