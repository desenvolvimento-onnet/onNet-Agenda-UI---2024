import React, {
  ChangeEvent,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

import { CircularProgress, TextField } from "@material-ui/core";
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { parse, isValid } from "date-fns";

import { notificate } from "../../global/notificate";
import { Table, TBody, Td, Th, THead } from "../../components/Table";

import Filter from "./Filter";
import ConfirmDialog from "../../components/ConfirmDialog";
import Holiday from "../../models/Holiday";
import MessageInfo from "../../components/MessageInfo";
import HolidayService from "../../services/HolidayService";
import CityService from "../../services/CityService";
import City from "../../models/City";
import SelectFilter from "../../components/SelectFilter";
import Button from "../../components/Button";

import { Container, Content, DialogContainer } from "./styles";

const Holidays: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [dialogOpened, setDialogOpened] = useState<number | null>(null);
  const [dialogIsLoading, setDialogIsLoading] = useState<boolean>(false);

  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [holidayForm, setHolidayForm] = useState<Holiday>({} as Holiday);
  const [holidayFilter, setHolidayFilter] = useState<Holiday>({} as Holiday);

  const [holidays, setHolidays] = useState<Holiday[]>();
  const [cities, setCities] = useState<City[]>();

  function validateDate(
    day: number | string,
    month: number | string,
    year?: number | string
  ) {
    day = Number(day) < 10 ? `0${day}` : String(day);
    month = Number(month) < 10 ? `0${month}` : String(month);
    year = String(year || new Date().getFullYear());

    if (!day || !month || !year) return false;

    const parsedDate = parse(`${month}/${day}/${year}`, "P", new Date());

    return isValid(parsedDate);
  }

  async function getData(filter: Holiday) {
    const { day, month, year, ...params } = filter;

    const data = params as Holiday;

    if (day) data.day = day;
    if (month) data.month = month;
    if (year) data.year = year;

    const holidays = (
      await HolidayService.index({
        ...data,
        order_by: "created_at",
        order_basis: "DESC",
      })
    ).data;
    const cities = (await CityService.index({ order_by: "name" })).data;

    return { holidays, cities };
  }

  async function onSubmit(holiday: Holiday, id?: number) {
    if (!id && (!holiday.day || !holiday.month || !holiday.description)) {
      notificate({
        title: "Atenção",
        message: "Preencha todos os campos!",
        type: "info",
      });

      throw new Error("Missing data form");
    }

    if (
      !validateDate(
        holiday.day || selectedHoliday?.day || 0,
        holiday.month || selectedHoliday?.month || 0,
        Number(holiday.year || selectedHoliday?.year)
      )
    ) {
      notificate({
        title: "Atenção",
        message: "Esta data não é válida",
        type: "info",
      });

      throw new Error("Date is out of range");
    }

    if (id) await HolidayService.update(id, { ...holiday });
    else await HolidayService.store(holiday);
  }

  async function onRemoveHoliday(id: number) {
    await HolidayService.delete(id);
  }

  function refresh() {
    setIsLoading(true);

    getData(holidayFilter)
      .then((response) => {
        setHolidays(response.holidays);
        setCities(response.cities);
      })
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar os feriados",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  function submitDialog() {
    setDialogIsLoading(true);

    onSubmit(holidayForm, selectedHoliday?.id)
      .then(() => {
        setDialogOpened(null);
        refresh();
      })
      .catch((err) => {
        if (err.response?.status === 409)
          notificate({
            title: "Aviso",
            message: "Este feriado já está cadastrado",
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

  function removeHolidayDialog() {
    setDialogIsLoading(true);

    onRemoveHoliday(Number(selectedHoliday?.id))
      .then(() => {
        setDialogOpened(null);
        refresh();
      })
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao tentar remover o feriado",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setDialogIsLoading(false));
  }

  const handleInputChange = useCallback(
    (
      ev: ChangeEvent<HTMLInputElement | { name?: string; value: any }>,
      setStateAction: React.Dispatch<SetStateAction<Holiday>>
    ) => {
      var { name, value } = ev.target;

      if (name !== "description" && value !== "")
        value = Math.abs(Number(value));

      setStateAction((prev) => ({ ...prev, [name || ""]: value }));
    },
    []
  );

  const handleDialogOpened = useCallback(
    (index: number, holidayId?: number) => {
      setHolidayForm({} as Holiday);
      setDialogOpened(index);

      if (holidayId) {
        setDialogIsLoading(true);

        HolidayService.show(holidayId)
          .then((response) => setSelectedHoliday(response.data))
          .catch((err) => {
            if (err.response?.status === 404)
              notificate({
                title: "Aviso",
                message: "Este feriado não foi encontrado",
                type: "warning",
              });
            else
              notificate({
                title: `Erro ${err.response?.status || ""}`,
                message: "Ocorreu um erro ao carregar o feriado",
                type: "danger",
              });

            setDialogOpened(null);

            console.log(err);
          })
          .finally(() => setDialogIsLoading(false));
      } else setSelectedHoliday(null);
    },
    []
  );

  const handleDialogClose = useCallback(
    (success: boolean) => {
      if (success) {
        if (dialogOpened === 1) submitDialog();
        if (dialogOpened === 2) removeHolidayDialog();
      } else setDialogOpened(null);
    },
    [holidayForm, selectedHoliday]
  );

  useEffect(() => {
    refresh();
  }, []);

  return (
    <>
      <Container>
        <Filter
          value={holidayFilter}
          onChange={(ev) => handleInputChange(ev, setHolidayFilter)}
          onAddClick={() => handleDialogOpened(1)}
          onSearchClick={() => refresh()}
        />

        {isLoading ? (
          <CircularProgress size={100} className="centralize" />
        ) : holidays ? (
          holidays.length ? (
            <Content>
              <Table>
                <THead>
                  <tr>
                    <Th>Dia</Th>
                    <Th>Mês</Th>
                    <Th>Ano</Th>
                    <Th>Descrição</Th>
                    <Th>Cidade</Th>
                    <Th></Th>
                    <Th></Th>
                  </tr>
                </THead>

                <TBody>
                  {holidays.map((holiday) => (
                    <tr key={holiday.id}>
                      <Td>{holiday.day}</Td>
                      <Td>{holiday.month}</Td>
                      <Td>{holiday.year}</Td>
                      <Td>{holiday.description}</Td>
                      <Td>{holiday.city?.name}</Td>
                      <Td noBackground short>
                        <Button
                          title="Editar"
                          onClick={() => handleDialogOpened(1, holiday.id)}
                          background="var(--info)"
                          icon={<MdEdit />}
                        />
                      </Td>
                      <Td noBackground short>
                        <Button
                          title="Remover"
                          onClick={() => handleDialogOpened(2, holiday.id)}
                          background="var(--danger)"
                          icon={<FaTrash />}
                        />
                      </Td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            </Content>
          ) : (
            <MessageInfo>Nenhum bloqueio encontrado</MessageInfo>
          )
        ) : (
          <MessageInfo>Não foi possível carregar os bloqueios</MessageInfo>
        )}
      </Container>

      {/* Add block dialog */}
      <ConfirmDialog
        title="Adicionar bloqueio"
        okLabel="Salvar"
        okButtonProps={{
          disabled: dialogIsLoading || JSON.stringify(holidayForm) === "{}",
        }}
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
                  type="number"
                  label="Dia"
                  name="day"
                  error={holidayForm.day > 31}
                  value={holidayForm.day || selectedHoliday?.day || ""}
                  onChange={(ev) => handleInputChange(ev, setHolidayForm)}
                  required
                />
                <TextField
                  type="number"
                  label="Mês"
                  name="month"
                  error={holidayForm.month > 12}
                  value={holidayForm.month || selectedHoliday?.month || ""}
                  onChange={(ev) => handleInputChange(ev, setHolidayForm)}
                  required
                />
              </div>

              <div className="line">
                <TextField
                  type="number"
                  name="year"
                  value={holidayForm.year || selectedHoliday?.year || ""}
                  onChange={(ev) => handleInputChange(ev, setHolidayForm)}
                  label="Ano"
                />

                <SelectFilter
                  label="Cidade"
                  options={cities || []}
                  identifierAttr="id"
                  nameAttr="name"
                  name="city_id"
                  value={holidayForm.city_id || selectedHoliday?.city_id || ""}
                  onChange={(ev) => handleInputChange(ev, setHolidayForm)}
                />
              </div>

              <div className="line spaced">
                <TextField
                  label="Descrição"
                  name="description"
                  value={
                    holidayForm.description ||
                    selectedHoliday?.description ||
                    ""
                  }
                  onChange={(ev) => handleInputChange(ev, setHolidayForm)}
                  autoComplete="off"
                  required
                />
              </div>
            </form>
          )}
        </DialogContainer>
      </ConfirmDialog>

      {/* Remove block dialog */}
      <ConfirmDialog
        title="Remover bloqueio?"
        open={dialogOpened === 2}
        onClose={handleDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogContainer>
          {dialogIsLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : (
            <>
              <p>
                <strong>Data:</strong>{" "}
                {`${
                  Number(selectedHoliday?.day) < 10
                    ? "0" + selectedHoliday?.day
                    : selectedHoliday?.day
                }/${
                  Number(selectedHoliday?.month) < 10
                    ? "0" + selectedHoliday?.month
                    : selectedHoliday?.month
                }${selectedHoliday?.year ? "/" + selectedHoliday?.year : ""}`}
              </p>

              {Boolean(selectedHoliday?.city_id) && (
                <p>
                  <strong>Cidade:</strong> {selectedHoliday?.city?.name}
                </p>
              )}

              <p>
                <strong>Descrição:</strong> {selectedHoliday?.description}
              </p>
            </>
          )}
        </DialogContainer>
      </ConfirmDialog>
    </>
  );
};

export default Holidays;
