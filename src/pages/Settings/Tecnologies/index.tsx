import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { MdEdit } from "react-icons/md";
import { CircularProgress, TextField } from "@material-ui/core";

import { padronize } from "../../../global/globalFunctions";
import { notificate } from "../../../global/notificate";
import { Table, THead, TBody, Th, Td } from "../../../components/Table";

import { Container, DialogContainer } from "./styles";

import Tecnology from "../../../models/Tecnology";
import TecnologyService from "../../../services/TecnologyService";
import Button from "../../../components/Button";
import ConfirmDialog from "../../../components/ConfirmDialog";
import MessageInfo from "../../../components/MessageInfo";
import SettingsChildren from "../SettingsChildren";

const Tecnologies: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);
  const [dialogIsLoading, setDialogIsLoading] = useState<boolean>(false);

  const [selectedTecnology, setSelectedTecnology] = useState<Tecnology | null>(
    null
  );
  const [tecnologyForm, setTecnologyForm] = useState<Tecnology>(
    {} as Tecnology
  );

  const [tecnologies, setTecnologies] = useState<Tecnology[]>();

  // Filter tecnologies
  const tecnologiesFiltered = useMemo<Tecnology[]>(() => {
    if (!tecnologies) return [];

    const value = padronize(query);

    const data = tecnologies.filter(
      (tecnology) => padronize(tecnology.name).indexOf(value) > -1
    );

    return data;
  }, [query, tecnologies]);

  function refresh() {
    setIsLoading(true);

    TecnologyService.index({ order_by: "created_at", order_basis: "DESC" })
      .then((response) => setTecnologies(response.data))
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar as tecnologias",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  async function onSubmit(tecnology: Tecnology, id?: number) {
    if (!id && !tecnology.name) {
      notificate({
        title: "Atenção",
        message: "Preencha todos os campos!",
        type: "info",
      });

      throw new Error("Missing data form");
    }

    if (id) await TecnologyService.update(id, tecnology);
    else await TecnologyService.store(tecnology);
  }

  const handleDialogOpen = useCallback((tecnologyId?: number) => {
    setTecnologyForm({} as Tecnology);

    setDialogIsOpen(true);

    if (tecnologyId) {
      setDialogIsLoading(true);

      TecnologyService.show(tecnologyId)
        .then((response) => setSelectedTecnology(response.data))
        .catch((err) => {
          if (err.response?.status === 404)
            notificate({
              title: "Aviso",
              message: "Esta tecnologia não foi encontrada",
              type: "warning",
            });
          else
            notificate({
              title: `Erro ${err.response?.status || ""}`,
              message: "Ocorreu um erro ao carregar a tecnologia",
              type: "danger",
            });

          setDialogIsOpen(false);

          console.log(err);
        })
        .finally(() => setDialogIsLoading(false));
    } else setSelectedTecnology(null);
  }, []);

  const handleDialogClose = useCallback(
    (success: boolean) => {
      if (success) {
        setDialogIsLoading(true);

        onSubmit(tecnologyForm, selectedTecnology?.id)
          .then(() => {
            setDialogIsOpen(false);
            refresh();
          })
          .catch((err) => {
            if (err.response?.status === 409)
              notificate({
                title: "Aviso",
                message: "Já existe uma tecnologia com este nome",
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
      } else setDialogIsOpen(false);
    },
    [tecnologyForm, selectedTecnology]
  );

  const handleInputChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = ev.target;

    setTecnologyForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  // First loading
  useEffect(() => {
    refresh();
  }, []);

  return (
    <>
      <SettingsChildren
        inputProps={{
          value: query,
          onChange: useCallback((ev) => setQuery(ev.target.value), []),
          disabled: !tecnologies,
        }}
        onAddClick={useCallback(() => handleDialogOpen(), [])}
      >
        <Container>
          {isLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : tecnologies ? (
            tecnologies.length ? (
              <Table>
                <THead>
                  <tr>
                    <Th short>ID</Th>
                    <Th>Tecnologia</Th>
                    <Th></Th>
                  </tr>
                </THead>
                <TBody>
                  {tecnologiesFiltered.map((tecnology) => (
                    <tr key={tecnology.id}>
                      <Td>{tecnology.id}</Td>
                      <Td>{tecnology.name}</Td>
                      <Td noBackground short>
                        <Button
                          title="Editar"
                          className="centralize"
                          icon={<MdEdit />}
                          background={"var(--info)"}
                          onClick={() => handleDialogOpen(tecnology.id)}
                        />
                      </Td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            ) : (
              <MessageInfo>Nenhuma tecnologia encontrada</MessageInfo>
            )
          ) : (
            <MessageInfo>Não foi possível carregar as tecnologias</MessageInfo>
          )}
        </Container>
      </SettingsChildren>

      <ConfirmDialog
        title={`${selectedTecnology?.id ? "Editar" : "Adicionar"} tecnologia`}
        okLabel="Salvar"
        open={dialogIsOpen}
        onClose={handleDialogClose}
        okButtonProps={{
          disabled: dialogIsLoading || JSON.stringify(tecnologyForm) === "{}",
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
                variant="filled"
                autoComplete="off"
                name="name"
                value={tecnologyForm?.name || selectedTecnology?.name || ""}
                onChange={handleInputChange}
                required
              />
            </form>
          )}
        </DialogContainer>
      </ConfirmDialog>
    </>
  );
};

export default Tecnologies;
