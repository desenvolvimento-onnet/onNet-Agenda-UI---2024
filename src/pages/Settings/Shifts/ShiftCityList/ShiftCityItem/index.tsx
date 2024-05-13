import React, { ChangeEvent, memo } from "react";

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import { BsPlusCircleFill } from "react-icons/bs";
import { TiMinus } from "react-icons/ti";

import City from "../../../../../models/City";
import ShiftCity from "../../../../../models/ShiftCity";
import Button from "../../../../../components/Button";

import { Container } from "./styles";
import SelectFilter from "../../../../../components/SelectFilter";

interface ShiftCityItemProps {
  type: "include" | "remove";
  shiftCity: ShiftCity;
  cities: City[];
  onChange: (
    ev: ChangeEvent<HTMLInputElement | { name?: string; value: any }>
  ) => void;
  onAddClick?: () => void;
  onRemoveClick?: () => void;
}

const ShiftCityItem: React.FC<ShiftCityItemProps> = ({
  type,
  shiftCity,
  cities,
  onChange,
  onAddClick,
  onRemoveClick,
}) => {
  return (
    <Container>
      {Boolean(cities.length) && (
        <>
          <SelectFilter
            label="Cidade"
            options={cities}
            identifierAttr="id"
            nameAttr="name"
            name="city_id"
            value={shiftCity.city_id || ""}
            onChange={onChange}
            required
          />

          <TextField
            label="Vagas"
            type="number"
            name="vacancies"
            value={shiftCity.vacancies}
            onChange={onChange}
          />
          <TextField
            label="Vagas (rural)"
            type="number"
            name="rural_vacancies"
            value={shiftCity.rural_vacancies}
            onChange={onChange}
          />

          {type === "include" ? (
            <Button
              title="Adicionar"
              icon={<BsPlusCircleFill />}
              background="var(--success)"
              onClick={onAddClick}
            />
          ) : (
            <Button
              title="Remover"
              icon={<TiMinus />}
              background="var(--danger)"
              onClick={onRemoveClick}
            />
          )}
        </>
      )}
    </Container>
  );
};

export default memo(ShiftCityItem);
