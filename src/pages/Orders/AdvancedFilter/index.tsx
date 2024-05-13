import React, {
  ChangeEvent,
  FormEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { FiArrowDown, FiArrowUp } from "react-icons/fi";
import { KeyboardDatePicker } from "@material-ui/pickers";
import { IoReload } from "react-icons/io5";
import { OrderFilterProps } from "../../../services/OrderService";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { CircularProgress, TextField } from "@material-ui/core";

import UserService from "../../../services/UserService";
import ShiftService from "../../../services/ShiftService";
import CityService from "../../../services/CityService";
import User from "../../../models/User";
import City from "../../../models/City";
import Shift from "../../../models/Shift";
import MessageInfo from "../../../components/MessageInfo";
import Button from "../../../components/Button";

import { Container, Header, Content } from "./styles";
import { notificate } from "../../../global/notificate";

import SelectMultiple from "../../../components/SelectMultiple";
import SelectFilter from "../../../components/SelectFilter";
import Pagination from "../../../models/Pagination";

interface AdvancedFilterProps {
  value: OrderFilterProps;
  onChange: (ev: ChangeEvent<{ name?: string; value: any }>) => void;
  onDateChange: (date: MaterialUiPickersDate, name: string) => void;
  onSubmit: () => void;
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  value,
  onChange,
  onDateChange,
  onSubmit,
}) => {
  const [isHidden, setIsHidden] = useState(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [users, setUsers] = useState<Pagination<User>>();
  const [cities, setCities] = useState<City[]>();
  const [shifts, setShifts] = useState<Shift[]>();

  const statuses = useMemo(() => {
    return [
      { id: "opened", name: "Aberto" },
      { id: "closed", name: "Fechado" },
      { id: "rural", name: "Rural" },
      { id: "rescheduled", name: "Reagendado" },
      { id: "canceled", name: "Cancelado" },
    ];
  }, []);

  const searchTypes = useMemo(() => {
    return [
      { id: "os", name: "Por agendamento" },
      { id: "open", name: "Por abertura" },
      { id: "closing", name: "Por fechamento" },
      { id: "cancellation", name: "Por cancelamento" },
    ];
  }, []);

  const handleIsHidden = useCallback(() => {
    setIsHidden((prev) => !prev);
  }, [setIsHidden]);

  const handleSubmit = useCallback(
    (ev?: FormEvent) => {
      ev?.preventDefault();

      setIsHidden(true);

      setTimeout(() => {
        onSubmit();
      }, 100);
    },
    [onSubmit, setIsHidden]
  );

  const refreshUsers = useCallback(
    (page?: number, per_page?: number, query?: string) => {
      UserService.index({ order_by: "name", page, per_page, query })
        .then((response) => setUsers(response.data))
        .catch((err) => {
          notificate({
            title: `Erro ${err.response?.status || ""}`,
            message: "Ocorreu um erro ao carregar os usuários",
            type: "danger",
          });

          console.log(err);
        });
    },
    [setUsers, setIsLoading]
  );

  async function getData() {
    const users = (await UserService.index({ order_by: "name" })).data;
    const cities = (await CityService.index({ order_by: "name" })).data;
    const shifts = (await ShiftService.index({ order_by: "name" })).data;

    return {
      users,
      cities,
      shifts,
    };
  }

  function refresh() {
    setIsLoading(true);

    getData()
      .then((response) => {
        setUsers(response.users);
        setCities(response.cities);
        setShifts(response.shifts);
      })
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao os filtros",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <Container onSubmit={handleSubmit} className={isHidden ? "hidden" : ""}>
      <Header>
        <div className="input-group">
          <TextField
            label="Código da O.S"
            type="number"
            variant="outlined"
            margin="dense"
            autoComplete="off"
            name="os"
            value={value.os}
            onChange={onChange}
          />

          <TextField
            className="large"
            label="Nome do cliente"
            variant="outlined"
            margin="dense"
            autoComplete="off"
            name="client"
            value={value.client}
            onChange={onChange}
          />
        </div>

        <Button
          title="Filtros avançados"
          background="var(--info)"
          icon={isHidden ? <FiArrowDown /> : <FiArrowUp />}
          height={2}
          onClick={handleIsHidden}
          type="button"
        >
          Avançado
        </Button>

        <Button
          title="Filtros avançados"
          background="var(--success)"
          icon={<IoReload />}
          height={2}
          type="submit"
        >
          Recarregar
        </Button>
      </Header>

      <Content className={isHidden ? "hidden" : ""}>
        {isLoading ? (
          <CircularProgress size={60} className="centralize" />
        ) : users && cities && shifts ? (
          <>
            <div className="line">
              <SelectFilter
                label="Tipo de busca"
                options={searchTypes}
                identifierAttr="id"
                nameAttr="name"
                name="search_type"
                value={value.search_type || ""}
                onChange={onChange}
              />

              <KeyboardDatePicker
                autoOk
                name="begin_date"
                label="Data de início"
                disableToolbar
                autoComplete="off"
                variant="inline"
                invalidDateMessage="Data inválida"
                format="dd/MM/yyyy"
                value={value.begin_date}
                onChange={(date) => onDateChange(date, "begin_date")}
                disabled={!Boolean(value.search_type)}
              />

              <KeyboardDatePicker
                autoOk
                name="end_date"
                label="Data de fim"
                disableToolbar
                autoComplete="off"
                variant="inline"
                invalidDateMessage="Data inválida"
                format="dd/MM/yyyy"
                value={value.end_date}
                onChange={(date) => onDateChange(date, "end_date")}
                disabled={!Boolean(value.search_type)}
              />

              <SelectMultiple
                label="Usuários"
                identifierAttr="id"
                nameAttr="name"
                options={users.data}
                name="users"
                value={value.users || []}
                onChange={onChange}
                disabled={!Boolean(value.search_type)}
                onSubmitFilter={(query) =>
                  refreshUsers(1, users.perPage, query)
                }
              />
            </div>

            <div className="line">
              <SelectMultiple
                label="Cidades"
                identifierAttr="id"
                nameAttr="name"
                options={cities}
                name="cities"
                value={value.cities || []}
                onChange={onChange}
              />

              <SelectMultiple
                label="Turnos"
                identifierAttr="id"
                nameAttr="name"
                options={shifts}
                name="shifts"
                value={value.shifts || []}
                onChange={onChange}
              />

              <SelectMultiple
                label="Status"
                identifierAttr="id"
                nameAttr="name"
                options={statuses}
                name="statuses"
                value={value.statuses || []}
                onChange={onChange}
              />
            </div>
          </>
        ) : (
          <MessageInfo>Não foi possível carregar o filtro</MessageInfo>
        )}
      </Content>
    </Container>
  );
};

export default memo(AdvancedFilter);
