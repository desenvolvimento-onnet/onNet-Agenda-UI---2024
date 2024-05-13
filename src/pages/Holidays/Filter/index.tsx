import React, { ChangeEvent } from "react";

import { TextField } from "@material-ui/core";
import { TiPlus } from "react-icons/ti";

import { Container } from "./styles";

import Button from "../../../components/Button";
import { IoMdSearch } from "react-icons/io";
import Holiday from "../../../models/Holiday";

interface FilterProps {
  value: Holiday;
  onChange: (ev: ChangeEvent<HTMLInputElement>) => void;
  onSearchClick: () => void;
  onAddClick: () => void;
}

const Filter: React.FC<FilterProps> = ({
  value,
  onSearchClick,
  onAddClick,
  onChange,
}) => {
  return (
    <Container>
      <form
        onSubmit={(ev) => {
          ev.preventDefault();

          onSearchClick();
        }}
      >
        <TextField
          type="number"
          value={value.day}
          variant="outlined"
          label="Dia"
          name="day"
          onChange={onChange}
        />
        <TextField
          type="number"
          value={value.month}
          variant="outlined"
          label="Mês"
          name="month"
          onChange={onChange}
        />
        <TextField
          type="number"
          value={value.year}
          variant="outlined"
          label="Ano"
          name="year"
          onChange={onChange}
        />
        <TextField
          className="large"
          value={value.description}
          variant="outlined"
          autoComplete="off"
          label="Descrição"
          name="description"
          onChange={onChange}
        />

        <Button
          title="Adicionar"
          type="submit"
          background="var(--success)"
          icon={<IoMdSearch />}
        />
      </form>

      <Button
        title="Adicionar"
        background="var(--info)"
        icon={<TiPlus />}
        onClick={onAddClick}
      >
        Adicionar
      </Button>
    </Container>
  );
};

export default Filter;
