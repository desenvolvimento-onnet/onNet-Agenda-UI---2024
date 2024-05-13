import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { CircularProgress, TextField } from "@material-ui/core";
import { MdEdit } from "react-icons/md";

import { padronize } from "../../../global/globalFunctions";
import { Table, THead, TBody, Th, Td } from "../../../components/Table";

import { Container, DialogContainer } from "../Cities/styles";

import ShiftType from "../../../models/ShiftType";
import ShiftTypeService from "../../../services/ShiftTypeService";
import Button from "../../../components/Button";
import ConfirmDialog from "../../../components/ConfirmDialog";
import MessageInfo from "../../../components/MessageInfo";
import SettingsChildren from "../SettingsChildren";
import { notificate } from "../../../global/notificate";

const ShiftTypes: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);
  const [dialogIsLoading, setDialogIsLoading] = useState<boolean>(false);

  const [selectedShiftType, setSelectedShiftType] = useState<ShiftType | null>(
    null
  );
  const [shiftTypeForm, setShiftTypeForm] = useState<ShiftType>(
    {} as ShiftType
  );

  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>();

  // Filter shiftTypes
  const shiftTypesFiltered = useMemo<ShiftType[]>(() => {
    if (!shiftTypes) return [];

    const value = padronize(query);

    const data = shiftTypes.filter(
      (shiftType) => padronize(shiftType.name).indexOf(value) > -1
    );

    return data;
  }, [query, shiftTypes]);

  function refresh() {
    setIsLoading(true);

    ShiftTypeService.index({ order_by: "created_at", order_basis: "DESC" })
      .then((response) => setShiftTypes(response.data))
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar os tipos de turnos",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  async function onSubmit(shiftType: ShiftType, id?: number) {
    if (!id && !shiftType.name) {
      notificate({
        title: "Atenção",
        message: "Preencha todos os campos!",
        type: "info",
      });

      throw new Error("Missing data form");
    }

    if (id) await ShiftTypeService.update(id, shiftType);
    else await ShiftTypeService.store(shiftType);
  }

  const handleDialogOpen = useCallback((shiftTypeId?: number) => {
    setShiftTypeForm({} as ShiftType);
    setDialogIsOpen(true);

    if (shiftTypeId) {
      setDialogIsLoading(true);

      ShiftTypeService.show(shiftTypeId)
        .then((response) => setSelectedShiftType(response.data))
        .catch((err) => {
          if (err.response?.status === 404)
            notificate({
              title: "Aviso",
              message: "Este tipo de turno não foi encontrado",
              type: "warning",
            });
          else
            notificate({
              title: `Erro ${err.response?.status || ""}`,
              message: "Ocorreu um erro ao carregar o tipo de turno",
              type: "danger",
            });

          setDialogIsOpen(false);

          console.log(err);
        })
        .finally(() => setDialogIsLoading(false));
    } else setSelectedShiftType(null);
  }, []);

  const handleDialogClose = useCallback(
    (success: boolean) => {
      if (success) {
        setDialogIsLoading(true);

        onSubmit(shiftTypeForm, selectedShiftType?.id)
          .then(() => {
            setDialogIsOpen(false);
            refresh();
          })
          .catch((err) => {
            if (err.response?.status === 409)
              notificate({
                title: "Aviso",
                message: "Já existe um tipo de turno com este nome",
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
    [shiftTypeForm, selectedShiftType]
  );

  const handleInputChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = ev.target;

    setShiftTypeForm((prev) => ({ ...prev, [name]: value }));
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
          disabled: !shiftTypes,
        }}
        onAddClick={useCallback(() => handleDialogOpen(), [])}
      >
        <Container>
          {isLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : shiftTypes ? (
            shiftTypes.length ? (
              <Table>
                <THead>
                  <tr>
                    <Th short>ID</Th>
                    <Th>Tipo de turno</Th>
                    <Th></Th>
                  </tr>
                </THead>
                <TBody>
                  {shiftTypesFiltered.map((shiftType) => (
                    <tr key={shiftType.id}>
                      <Td>{shiftType.id}</Td>
                      <Td>{shiftType.name}</Td>
                      <Td noBackground short>
                        <Button
                          title="Editar"
                          className="centralize"
                          icon={<MdEdit />}
                          background={"var(--info)"}
                          onClick={() => handleDialogOpen(shiftType.id)}
                        />
                      </Td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            ) : (
              <MessageInfo>Nenhum tipo de turno encontrado</MessageInfo>
            )
          ) : (
            <MessageInfo>
              Não foi possível carregar os tipos de turno
            </MessageInfo>
          )}
        </Container>
      </SettingsChildren>

      <ConfirmDialog
        title={`${
          selectedShiftType?.id ? "Editar" : "Adicionar"
        } tipo de turno`}
        okLabel="Salvar"
        open={dialogIsOpen}
        onClose={handleDialogClose}
        okButtonProps={{
          disabled: dialogIsLoading || JSON.stringify(shiftTypeForm) === "{}",
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
                value={shiftTypeForm?.name || selectedShiftType?.name || ""}
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

export default ShiftTypes;
