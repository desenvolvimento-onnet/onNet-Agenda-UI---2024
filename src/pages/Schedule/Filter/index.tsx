import React, {
  ChangeEvent,
  memo,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  TextFieldProps,
} from "@material-ui/core";

import Shift from "../../../models/Shift";

import { Container } from "./styles";
import CityService from "../../../services/CityService";
import TecnologyService from "../../../services/TecnologyService";
import ShiftTypeService from "../../../services/ShiftTypeService";
import City from "../../../models/City";
import ShiftType from "../../../models/ShiftType";
import Tecnology from "../../../models/Tecnology";
import { notificate } from "../../../global/notificate";
import { AuthContext } from "../../../global/context/AuthContext";
import SelectFilter from "../../../components/SelectFilter";

export interface FilterValueProps extends Shift {
  query?: string;
  city_id?: number;
}

interface FilterProps {
  filterValue: FilterValueProps;
  onFilterChange: (
    ev: ChangeEvent<HTMLInputElement | { name?: string; value: any }>
  ) => void;
  inputProps?: TextFieldProps;
}

const Filter: React.FC<FilterProps> = ({
  filterValue,
  onFilterChange,
  inputProps,
}) => {
  const { user } = useContext(AuthContext);

  const [cities, setCities] = useState<City[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [tecnologies, setTecnologies] = useState<Tecnology[]>([]);

  async function getData() {
    const userCities = (user?.cities as City[]) || [];

    const shiftTypes = (await ShiftTypeService.index({ order_by: "name" }))
      .data;
    const tecnologies = (await TecnologyService.index({ order_by: "name" }))
      .data;
    const cities = (await CityService.index({ order_by: "name" })).data.filter(
      (city) => userCities.map((city) => city.id).includes(city.id)
    );

    return { cities, shiftTypes, tecnologies };
  }

  function refresh() {
    getData()
      .then((response) => {
        setCities(response.cities);
        setShiftTypes(response.shiftTypes);
        setTecnologies(response.tecnologies);

        if (response.cities.length === 1)
          onFilterChange({
            target: { name: "city_id", value: response.cities[0].id || "" },
          } as ChangeEvent<{ name: string; value: string }>);
      })
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar o filtro",
          type: "danger",
        });

        console.log(err);
      });
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <Container>
      <TextField
        label="Buscar"
        type="search"
        name="query"
        autoComplete="off"
        value={filterValue.query || ""}
        onChange={onFilterChange}
        {...inputProps}
      />

      <SelectFilter
        label="Cidade"
        options={cities}
        identifierAttr="id"
        nameAttr="name"
        name="city_id"
        value={filterValue.city_id || ""}
        onChange={onFilterChange}
        required
      />

      <SelectFilter
        label="Tipo de turno"
        options={shiftTypes}
        identifierAttr="id"
        nameAttr="name"
        name="shift_type_id"
        value={filterValue.shift_type_id || ""}
        onChange={onFilterChange}
      />

      <SelectFilter
        label="Tecnologia"
        options={tecnologies}
        identifierAttr="id"
        nameAttr="name"
        name="tecnology_id"
        value={filterValue.tecnology_id || ""}
        onChange={onFilterChange}
      />
    </Container>
  );
};

export default memo(Filter);
