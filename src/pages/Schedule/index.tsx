import React, {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { MdSearch } from "react-icons/md";
import { CircularProgress } from "@material-ui/core";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { padronize } from "../../global/globalFunctions";
import { notificate } from "../../global/notificate";
import { AuthContext } from "../../global/context/AuthContext";

import Filter, { FilterValueProps } from "./Filter";
import ShiftItem, { VacancyForm } from "./ShiftItem";
import ShiftCityService, {
  FreeVacancies,
} from "../../services/ShiftCityService";
import Calendar from "../../components/Calendar";
import Button from "../../components/Button";
import ShiftCity from "../../models/ShiftCity";
import MessageInfo from "../../components/MessageInfo";
import ConfirmDialog from "../../components/ConfirmDialog";
import OrderList from "../../components/OrderList";
import Order from "../../models/Order";
import OrderService from "../../services/OrderService";
import Pagination from "../../models/Pagination";
import useOsDialog from "../../components/Dialogs/OrderDialogs/context/useOsDialog";

import { Container, ShiftList, DialogContainer } from "./styles";
import { capitalize } from "lodash";

const Schedule: React.FC = () => {
  const { searchOsDialog, addOsDialog } = useOsDialog();
  const { userPermissions } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dialogOpened, setDialogOpened] = useState<number | null>(null);
  const [dialogIsLoading, setDialogIsLoading] = useState<boolean>(false);

  const [vacancyForm, setVacancyForm] = useState<VacancyForm>();
  const [selectedShiftCity, setSelectedShiftCity] = useState<ShiftCity>(
    {} as ShiftCity
  );
  const [freeVacancies, setFreeVacancies] = useState<FreeVacancies[]>();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [shiftCityFilter, setShiftCityFilter] = useState<FilterValueProps>(
    {} as FilterValueProps
  );

  const [shiftCities, setShiftCities] = useState<ShiftCity[]>();
  const [orders, setOrders] = useState<Pagination<Order>>();

  const changeVacancyPermission = useMemo(
    () => userPermissions?.schedule.shift.change_vacancy,
    [userPermissions]
  );




  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");



  
  const handleSortToggle = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const shiftCitiesFiltered = useMemo<ShiftCity[]>(() => {
    if (!shiftCities) return [];

    const { query, shift_type_id, tecnology_id } = shiftCityFilter;

    const value = padronize(query || "");

    return shiftCities.filter(
      (shiftCity) =>
        padronize(shiftCity.shift?.name || "").indexOf(value) > -1 &&
        (!shift_type_id || shiftCity.shift?.shift_type_id === shift_type_id) &&
        (!tecnology_id ||
          !shiftCity.shift?.tecnology_id ||
          shiftCity.shift?.tecnology_id === tecnology_id)
    );
  }, [shiftCities, shiftCityFilter]);

  async function getData(cityId: number, date: Date) {
    const parsedDate = format(new Date(date || ""), "yyyy-MM-dd");

    const shiftCities = (
      await ShiftCityService.getByCityByDate(cityId, parsedDate)
    ).data;

    return { shiftCities };
  }

  async function getShiftCityOrders(
    shiftCityId: number,
    date: Date | string,
    page: number,
    per_page: number
  ) {
    const parsedDate = format(new Date(date || ""), "yyyy-MM-dd");

    const shiftCity = (await ShiftCityService.show(shiftCityId)).data;
    const orders = (
      await OrderService.index({
        page,
        per_page,
        shift_id: shiftCity.shift_id,
        city_id: shiftCity.city_id,
        date: parsedDate,
        order_by: "created_at",
        order_basis: "DESC",
      })
    ).data;

    return { shiftCity, orders };
  }

  async function changeShiftCityVacancy(
    shiftCity: ShiftCity,
    vacancy: VacancyForm
  ) {
    const { id, vacancies, rural_vacancies } = shiftCity;

    const amount = vacancy.type === "increment" ? 1 : -1;
    const data: ShiftCity = {} as ShiftCity;

    if (Boolean(vacancy.rural))
      data.rural_vacancies = Math.max(0, rural_vacancies + amount);
    else data.vacancies = Math.max(0, vacancies + amount);

    await ShiftCityService.update(Number(id), data);
  }

  function refresh(cityId: number, date: Date) {
    setIsLoading(true);

    getData(cityId, date)
      .then((response) => setShiftCities(response.shiftCities))
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar os turnos",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => {
        setTimeout(() => {
          setIsLoading(false);
        }, 200);
      });
  }

  const handleInputChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement | { name?: string; value: any }>) => {
      const { name, value } = ev.target;

      setShiftCityFilter((prev) => ({ ...prev, [name || ""]: value }));
    },
    [setShiftCityFilter]
  );

  function reloadOrders(
    shiftCityId: number,
    date: Date | string,
    page: number,
    perPage: number
  ) {
    setDialogIsLoading(true);

    getShiftCityOrders(shiftCityId, date, page, perPage)
      .then((response) => setOrders(response.orders))
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar as O.S",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setDialogIsLoading(false));
  }

  const handleDialogOpen = useCallback(
    (index, shiftCityId: number, vacancy?: VacancyForm) => {
      setSelectedShiftCity({} as ShiftCity);

      setOrders(undefined);
      setFreeVacancies(undefined);
      setVacancyForm(vacancy);

      setDialogOpened(index);
      setDialogIsLoading(true);

      ShiftCityService.show(shiftCityId)
        .then((response) => {
          setSelectedShiftCity(response.data);

          if (index === 1) {
            ShiftCityService.getFreeVacancies(shiftCityId)
              .then((response) => setFreeVacancies(response.data))
              .catch((err) => {
                notificate({
                  title: `Erro ${err.response?.status || ""}`,
                  message: "Ocorreu um erro ao carregar as vagas",
                  type: "danger",
                });

                setDialogOpened(null);

                console.log(err);
              })
              .finally(() => setDialogIsLoading(false));
          } else if (index === 3 && selectedDate)
            reloadOrders(shiftCityId, selectedDate, 1, 20);
          else setDialogIsLoading(false);
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
          setDialogIsLoading(false);
          console.log(err);
        });
    },
    [
      selectedDate,
      setSelectedShiftCity,
      setOrders,
      setFreeVacancies,
      setVacancyForm,
      setDialogOpened,
      setDialogIsLoading,
    ]
  );

  const handleDialogClose = useCallback(
    (success?: boolean) => {
      if (success) {
        if (!selectedDate) return;

        if (dialogOpened === 2 && vacancyForm) {
          setDialogIsLoading(true);

          changeShiftCityVacancy(selectedShiftCity, vacancyForm)
            .then(() => {
              selectedDate &&
                refresh(Number(shiftCityFilter.city_id), selectedDate);

              setDialogOpened(null);
            })
            .catch((err) => {
              notificate({
                title: `Erro ${err.response?.status || ""}`,
                message: "Ocorreu um erro ao tentar alterar as vagas",
                type: "danger",
              });

              console.log(err);
            })
            .finally(() => setDialogIsLoading(false));
        } else {
          selectedDate &&
            refresh(Number(shiftCityFilter.city_id), selectedDate);

          setDialogOpened(null);
        }
      } else setDialogOpened(null);
    },
    [
      dialogOpened,
      vacancyForm,
      selectedDate,
      selectedShiftCity,
      shiftCityFilter.city_id,
      setDialogOpened,
    ]
  );

  const sortedShiftCitiesFiltered = useMemo(() => {
    if (!shiftCitiesFiltered) return [];

    const sortedCities = [...shiftCitiesFiltered];
    

    // Ordenar o array com base no nome do turno
    sortedCities.sort((a, b) => {
      const nameA = a.shift?.name || "";
      const nameB = b.shift?.name || "";

      if (sortOrder === "asc") {
        return nameA.localeCompare(nameB, "en", { sensitivity: "base" });
      } else {
        return nameB.localeCompare(nameA, "en", { sensitivity: "base" });
      }
    });

    return sortedCities;
  }, [shiftCitiesFiltered, sortOrder]);

  useEffect(() => {
    if (shiftCityFilter.city_id && selectedDate)
      refresh(shiftCityFilter.city_id, selectedDate);
  }, [selectedDate, shiftCityFilter.city_id]);

  return (
    <>
      <Container>
        <Filter
          filterValue={shiftCityFilter}
          onFilterChange={handleInputChange}
          inputProps={{ placeholder: "Nome do Turno" }}
        />

        <Button
          title="Buscar por O.S agendada"
          className="small-width"
          icon={<MdSearch />}
          background="var(--secondary)"
          onClick={() => searchOsDialog()}
        >
          Buscar O.S
        </Button>

        <ShiftList>
          {isLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : shiftCityFilter.city_id && selectedDate ? (
            sortedShiftCitiesFiltered.length ? (
              sortedShiftCitiesFiltered.map((shiftCity) => (
                <ShiftItem
                  key={shiftCity.id}
                  shiftCity={shiftCity}
                  selectedDate={selectedDate}
                  canChangeVacancy={changeVacancyPermission}
                  onAddOsClick={(isRural) => {
                    addOsDialog(
                      {
                        shiftId: shiftCity.shift_id,
                        cityId: shiftCity.city_id,
                        date: selectedDate,
                        isRural,
                      },
                      (success) =>
                        success &&
                        shiftCityFilter.city_id &&
                        selectedDate &&
                        refresh(shiftCityFilter.city_id, selectedDate)
                    );
                  }}
                  onInfoClick={() =>
                    handleDialogOpen(1, Number(shiftCity.id))
                  }
                  onVacancyClick={(vacancy) =>
                    handleDialogOpen(2, Number(shiftCity.id), vacancy)
                  }
                  onOrderClick={() =>
                    handleDialogOpen(3, Number(shiftCity.id))
                  }
                />
              ))
            ) : (
              <MessageInfo>Nenhum turno encontrado</MessageInfo>
            )
          ) : !shiftCityFilter.city_id ? (
            <MessageInfo>Selecione uma cidade</MessageInfo>
          ) : (
            !selectedDate && <MessageInfo>Selecione uma data</MessageInfo>
          )}
        </ShiftList>

        <Calendar
          value={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          cityId={shiftCityFilter.city_id}
          enablePast={userPermissions?.schedule.calendar.select_past}
        />
      </Container>

      {/* Avaliable dialog - INDEX 1 */}
      <ConfirmDialog
        title="Disponibilidade"
        open={useMemo(() => dialogOpened === 1, [dialogOpened])}
        onClose={handleDialogClose}
        okLabel=""
        maxWidth="xs"
        fullWidth
        cancelLabel="Fechar"
      >
        <DialogContainer>
          {dialogIsLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : freeVacancies ? (
            <div className="info">
              <strong>
                {selectedShiftCity.city?.name} - {selectedShiftCity.shift?.name}
              </strong>

              {freeVacancies.length ? (
                <>
                  <h4>
                    Exibindo os próximos 5 dias disponíveis em{" "}
                    {capitalize(
                      format(new Date(), "MMMM", {
                        locale: ptBR,
                      })
                    )}
                  </h4>

                  <ul>
                    {freeVacancies.map((freeVacancy, i) => (
                      <li key={i}>
                        <div>
                          {format(
                            new Date(freeVacancy.date || ""),
                            "dd/MM - EEEE",
                            {
                              locale: ptBR,
                            }
                          )}{" "}
                          <span>{freeVacancy.free} vaga(s)</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <MessageInfo>Nenhuma vaga disponível esse mês</MessageInfo>
              )}
            </div>
          ) : (
            <MessageInfo>Não foi possível carregar os dias livres</MessageInfo>
          )}
        </DialogContainer>
      </ConfirmDialog>

      {/* Vacancy dialog - INDEX 2 */}
      <ConfirmDialog
        title={
          vacancyForm?.type
            ? `${
                vacancyForm?.type === "increment" ? "Acrecentar" : "Diminuir"
              } o número de vagas`
            : ""
        }
        open={useMemo(() => dialogOpened === 2, [dialogOpened])}
        onClose={handleDialogClose}
        okButtonProps={{
          disabled: dialogIsLoading || !selectedShiftCity || !vacancyForm,
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogContainer>
          {dialogIsLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : (
            <>
              <strong>{selectedShiftCity.shift?.name}</strong>

              <p>
                Deseja realmente{" "}
                {vacancyForm?.type === "increment" ? "aumentar" : "diminuir"} 1
                vaga{Boolean(vacancyForm?.rural) && " rural"}?
              </p>
            </>
          )}
        </DialogContainer>
      </ConfirmDialog>

      {/* Shift orders dialog - INDEX 3 */}
      <ConfirmDialog
        title={`Ordens de Serviço ${
          selectedShiftCity.city?.name
            ? `- ${selectedShiftCity.city?.name}`
            : ""
        }`}
        open={useMemo(() => dialogOpened === 3, [dialogOpened])}
        onClose={handleDialogClose}
        okLabel=""
        cancelLabel="Fechar"
        fullWidth
        maxWidth={orders && orders.data.length ? "xl" : "sm"}
      >
        <DialogContainer>
          {dialogIsLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : orders ? (
            <>
              <strong>
                {selectedShiftCity.shift?.name} -{" "}
                {selectedDate &&
                  format(new Date(selectedDate || ""), "dd/MM/yyyy")}
              </strong>

              {orders.data.length ? (
                <OrderList
                  orders={orders}
                  onReload={(page, perPage) =>
                    reloadOrders(
                      Number(selectedShiftCity.id),
                      new Date(selectedDate || ""),
                      page,
                      perPage
                    )
                  }
                />
              ) : (
                <MessageInfo>Nenhuma O.S encontrada</MessageInfo>
              )}
            </>
          ) : (
            <MessageInfo>
              Não foi possível carregar as ordens de serviço
            </MessageInfo>
          )}
        </DialogContainer>
      </ConfirmDialog>
    </>
  );
};

export default Schedule;
