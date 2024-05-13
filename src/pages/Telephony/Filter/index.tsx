import { ChangeEvent, FormEvent, MouseEvent, useMemo, useState } from "react";

import { BsPlusCircleFill } from "react-icons/bs";
import { MdSearch } from "react-icons/md";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";

import { useContext } from "react";
import { AuthContext } from "../../../global/context/AuthContext";

import Button from "../../../components/Button";
import SelectMultiple from "../../../components/SelectMultiple";
import City from "../../../models/City";

import { Container, InputGroup, ButtonGroup } from "./styles";
import { useEffect } from "react";
import { PhoneNumberFilterProps } from "../../../services/PhoneNumberService";
import SelectFilter from "../../../components/SelectFilter";
import { useCallback } from "react";
import CityService from "../../../services/CityService";
import { notificate } from "../../../global/notificate";

export interface FilterProps {
  value: PhoneNumberFilterProps;
  onFilterChange: (
    ev: ChangeEvent<HTMLInputElement | { name?: string; value: any }>
  ) => void;
  onSubmit?: (
    ev?: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>
  ) => void;
  onAddClick?: (ev: MouseEvent<HTMLButtonElement>) => void;
  onCityChange?: (city: City) => void;
}

const Filter: React.FC<FilterProps> = ({
  value,
  onFilterChange,
  onSubmit,
  onAddClick,
  onCityChange,
}) => {
  const { user, userPermissions } = useContext(AuthContext);

  const [cities, setCities] = useState<City[]>([]);

  const statuses = useMemo(() => {
    return [
      { id: "normal", name: "Normal" },
      { id: "gold", name: "Gold" },
      { id: "portability", name: "Portabilidade" },
    ];
  }, []);

  const citiesFiltered = useMemo(() => {
    return cities.filter(
      (city) =>
        city.prefix &&
        (user?.cities as City[] | undefined)?.some(
          (userCity) => city.id === userCity.id
        )
    );
  }, [user?.cities, cities]);

  const refresh = useCallback(() => {
    CityService.index({ order_by: "name" })
      .then((response) => setCities(response.data))
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status}`,
          message: "Não foi possível carregar as cidades",
          type: "danger",
        });

        console.log(err);
      });
  }, []);

  useEffect(() => {
    if (citiesFiltered.length === 1) {
      onFilterChange({
        target: { name: "city_id", value: citiesFiltered[0].id || "" },
      } as ChangeEvent<{ name: string; value: string }>);
    }
  }, [citiesFiltered]);

  useEffect(() => {
    const city = cities.find((city) => city.id === value.city_id);

    if (city) onCityChange && onCityChange(city);
  }, [cities, value.city_id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <Container onSubmit={onSubmit}>
      <InputGroup>
        <TextField
          placeholder="Buscar"
          type="search"
          name="query"
          autoComplete="off"
          value={value.query}
          onChange={onFilterChange}
        />

        <SelectFilter
          label="Cidade"
          options={citiesFiltered}
          identifierAttr="id"
          nameAttr="name"
          name="city_id"
          value={value.city_id || ""}
          onChange={onFilterChange}
          required
        />

        <SelectMultiple
          label="Tipo"
          identifierAttr="id"
          nameAttr="name"
          options={statuses}
          name="statuses"
          value={value.statuses || []}
          onChange={onFilterChange}
        />
      </InputGroup>

      <ButtonGroup>
        <Button
          title="Buscar alocado"
          background="var(--secondary)"
          icon={<MdSearch />}
          type="submit"
          onClick={onSubmit}
        />

        {userPermissions?.telephony.add_portability &&
          userPermissions.phone_number.add.allow && (
            <Button
              title="Adicionar portabilidade"
              background="var(--success)"
              icon={<BsPlusCircleFill />}
              type="button"
              onClick={onAddClick}
              disabled={!value.city_id}
            >
              Adicionar
            </Button>
          )}
      </ButtonGroup>
    </Container>
  );
};

export default Filter;
