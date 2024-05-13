import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { MdBlock, MdCheck, MdEdit } from "react-icons/md";
import {
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";

import { padronize } from "../../../global/globalFunctions";
import { Table, THead, TBody, Th, Td } from "../../../components/Table";

import { Container, DialogContainer, List } from "./styles";

import Shift from "../../../models/Shift";
import ShiftType from "../../../models/ShiftType";
import Tecnology from "../../../models/Tecnology";
import ShiftService from "../../../services/ShiftService";
import ShiftTypeService from "../../../services/ShiftTypeService";
import TecnologyService from "../../../services/TecnologyService";
import Button from "../../../components/Button";
import ConfirmDialog from "../../../components/ConfirmDialog";
import MessageInfo from "../../../components/MessageInfo";
import SettingsChildren from "../SettingsChildren";
import ShiftCityList from "./ShiftCityList";
import ShiftCity from "../../../models/ShiftCity";
import ShiftCityService from "../../../services/ShiftCityService";
import { notificate } from "../../../global/notificate";
import { GiModernCity } from "react-icons/gi";
import SelectFilter from "../../../components/SelectFilter";

const Shifts: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [dialogOpened, setDialogOpened] = useState<number | null>(null);
  const [dialogIsLoading, setDialogIsLoading] = useState<boolean>(false);

  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [shiftForm, setShiftForm] = useState<Shift>({} as Shift);
  const [shiftCities, setShiftCities] = useState<ShiftCity[]>([]);

  const [shifts, setShifts] = useState<Shift[]>();
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>();
  const [tecnologies, setTecnologies] = useState<Tecnology[]>();

  // Filter shifts
  const shiftsFiltered = useMemo<Shift[]>(() => {
    if (!shifts) return [];

    const value = padronize(query);

    const data = shifts.filter(
      (shift) => padronize(shift.name).indexOf(value) > -1
    );

    return data;
  }, [query, shifts]);

  async function getData() {
    const shifts = (await ShiftService.index({ order_by: "name" })).data;
    const shiftTypes = (await ShiftTypeService.index({ order_by: "name" }))
      .data;
    const tecnologies = (await TecnologyService.index({ order_by: "name" }))
      .data;

    shifts.map((shift) => {
      shift.shiftType = shiftTypes.find(
        (shiftType) => shiftType.id === shift.shift_type_id
      );

      shift.tecnology = tecnologies.find(
        (tecnology) => tecnology.id === shift.tecnology_id
      );
    });

    return { shifts, shiftTypes, tecnologies };
  }

  function refresh() {
    setIsLoading(true);

    getData()
      .then((response) => {
        setShifts(response.shifts);
        setShiftTypes(response.shiftTypes);
        setTecnologies(response.tecnologies);
      })
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar os dados",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  async function onSubmit(shift: Shift, id?: number) {
    if (!id && (!shift.name || !shift.shift_type_id)) {
      notificate({
        title: "Atenção",
        message: "Preencha todos os campos!",
        type: "info",
      });

      throw new Error("Missing data form");
    }

    if (id) await ShiftService.update(id, shift);
    else await ShiftService.store(shift);
  }

  async function updateShiftCities(shiftId: number, shiftCities: ShiftCity[]) {
    await ShiftCityService.updateCities(shiftId, shiftCities);
  }

  async function inactivate(shiftId: number, active: boolean) {
    await ShiftService.update(shiftId, { active } as Shift);
  }

  const handleDialogOpen = useCallback((index: number, shiftId?: number) => {
    setShiftForm({} as Shift);
    setDialogOpened(index);

    if (shiftId) {
      setDialogIsLoading(true);

      ShiftService.show(shiftId)
        .then((response) => {
          if (index === 2 && !response.data.active) {
            notificate({
              title: "Aviso",
              message: "Este turno está inativo",
              type: "warning",
            });

            setDialogOpened(null);
          } else setSelectedShift(response.data);
        })
        .catch((err) => {
          if (err.response?.status === 404)
            notificate({
              title: "Aviso",
              message: "Este turno não foi encontrado",
              type: "warning",
            });
          else
            notificate({
              title: `Erro ${err.response?.status || ""}`,
              message: "Ocorreu um erro ao carregar o turno",
              type: "danger",
            });

          setDialogOpened(null);

          console.log(err);
        })
        .finally(() => setDialogIsLoading(false));
    } else setSelectedShift(null);
  }, []);

  function submitDialog() {
    setDialogIsLoading(true);

    onSubmit(shiftForm, selectedShift?.id)
      .then(() => {
        setDialogOpened(null);
        refresh();
      })
      .catch((err) => {
        if (err.response?.status === 409)
          notificate({
            title: "Aviso",
            message: "Já existe um turno com este nome",
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

  function shiftCitiesDialog() {
    setDialogIsLoading(true);

    updateShiftCities(Number(selectedShift?.id), shiftCities)
      .then(() => {
        setDialogOpened(null);
        refresh();
      })
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar as vagas",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setDialogIsLoading(false));
  }

  function inactivateDialog() {
    setDialogIsLoading(true);

    inactivate(Number(selectedShift?.id), !Boolean(selectedShift?.active))
      .then(() => {
        setDialogOpened(null);
        refresh();
      })
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro inativar/ativar o turno",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setDialogIsLoading(false));
  }

  const handleDialogClose = useCallback(
    (success: boolean) => {
      if (success) {
        if (dialogOpened === 1) submitDialog();
        else if (dialogOpened === 2) shiftCitiesDialog();
        else if (dialogOpened === 3) inactivateDialog();
      } else setDialogOpened(null);
    },
    [shiftCities, shiftForm, selectedShift]
  );

  const handleInputChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement | { name?: string; value: any }>) => {
      const { name, value } = ev.target;

      setShiftForm((prev) => ({ ...prev, [name || ""]: value }));
    },
    []
  );

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
          disabled: !shifts,
        }}
        onAddClick={useCallback(() => handleDialogOpen(1), [handleDialogOpen])}
      >
        <Container>
          {isLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : shifts ? (
            shifts.length ? (
              <Table>
                <THead>
                  <tr>
                    <Th short>ID</Th>
                    <Th>Turno</Th>
                    <Th>Status</Th>
                    <Th>Tipo</Th>
                    <Th>Tecnologia</Th>
                    <Th></Th>
                    <Th></Th>
                    <Th></Th>
                  </tr>
                </THead>
                <TBody>
                  {shiftsFiltered.map((shift) => (
                    <tr key={shift.id}>
                      <Td>{shift.id}</Td>
                      <Td>{shift.name}</Td>
                      {Boolean(shift.active) ? (
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
                      <Td>{shift.shiftType?.name}</Td>
                      <Td>{shift.tecnology?.name}</Td>
                      <Td noBackground short>
                        <Button
                          title="Editar"
                          className="centralize"
                          icon={<MdEdit />}
                          background={"var(--info)"}
                          onClick={() => handleDialogOpen(1, Number(shift?.id))}
                        />
                      </Td>
                      <Td noBackground short>
                        <Button
                          title="Cidades e vagas"
                          className="centralize"
                          icon={<GiModernCity />}
                          iconSize={16}
                          background={"var(--secondary-dark)"}
                          onClick={() => handleDialogOpen(2, Number(shift?.id))}
                          disabled={!shift.active}
                        />
                      </Td>
                      <Td noBackground short>
                        {Boolean(shift.active) ? (
                          <Button
                            title="Inativar"
                            className="centralize"
                            icon={<MdBlock />}
                            background="var(--danger)"
                            onClick={() => handleDialogOpen(3, shift.id)}
                          />
                        ) : (
                          <Button
                            title="Ativar"
                            className="centralize"
                            icon={<MdCheck />}
                            background="var(--primary)"
                            onClick={() => handleDialogOpen(3, shift.id)}
                          />
                        )}
                      </Td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            ) : (
              <MessageInfo>Nenhum turno encontrado</MessageInfo>
            )
          ) : (
            <MessageInfo>Não foi possível carregar os turnos</MessageInfo>
          )}
        </Container>
      </SettingsChildren>

      {/* Add shift dialog - INDEX 1 */}
      <ConfirmDialog
        title={`${selectedShift?.id ? "Editar" : "Adicionar"} turno`}
        okLabel="Salvar"
        open={dialogOpened === 1}
        onClose={handleDialogClose}
        okButtonProps={{
          disabled: dialogIsLoading || JSON.stringify(shiftForm) === "{}",
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
                autoComplete="off"
                name="name"
                value={shiftForm?.name || selectedShift?.name || ""}
                onChange={handleInputChange}
                required
              />

              <SelectFilter
                label="Tipo de turno"
                options={shiftTypes || []}
                identifierAttr="id"
                nameAttr="name"
                name="shift_type_id"
                value={
                  shiftForm.shift_type_id || selectedShift?.shift_type_id || ""
                }
                onChange={handleInputChange}
                required
              />

              <SelectFilter
                label="Tecnologia"
                options={tecnologies || []}
                identifierAttr="id"
                nameAttr="name"
                name="tecnology_id"
                value={
                  shiftForm.tecnology_id || selectedShift?.tecnology_id || ""
                }
                onChange={handleInputChange}
              />
            </form>
          )}
        </DialogContainer>
      </ConfirmDialog>

      {/* Shift cities dialog - INDEX 2 */}
      <ConfirmDialog
        title="Cidades e vagas do turno"
        okLabel="Salvar"
        open={dialogOpened === 2}
        onClose={handleDialogClose}
        okButtonProps={{ disabled: dialogIsLoading }}
        fullWidth
        maxWidth="sm"
      >
        <DialogContainer>
          {dialogIsLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : (
            <List>
              <p className="info">{selectedShift?.name}</p>

              {selectedShift && (
                <ShiftCityList
                  shiftId={Number(selectedShift?.id)}
                  onChange={(data) => {
                    setShiftCities(data);
                  }}
                />
              )}
            </List>
          )}
        </DialogContainer>
      </ConfirmDialog>

      {/* Inactivate shift dialog - INDEX 3 */}
      <ConfirmDialog
        title={`${
          Boolean(selectedShift?.active) ? "Inativar" : "Ativar"
        } turno`}
        open={dialogOpened === 3}
        onClose={handleDialogClose}
        okButtonProps={{ disabled: dialogIsLoading }}
        fullWidth
        maxWidth="xs"
      >
        <DialogContainer>
          {dialogIsLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : (
            <p className="info">{selectedShift?.name}</p>
          )}
        </DialogContainer>
      </ConfirmDialog>
    </>
  );
};

export default Shifts;
