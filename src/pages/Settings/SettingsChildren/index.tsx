import React, { useCallback } from "react";
import Button from "../../../components/Button";

import { BsPlusCircleFill } from "react-icons/bs";
import { IoIosArrowBack } from "react-icons/io";
import { TextField, TextFieldProps } from "@material-ui/core";

import { Container, Header } from "./styles";
import { useHistory } from "react-router-dom";

interface SettingsChildrenProps {
  inputProps?: TextFieldProps;
  children: React.ReactNode;
  onAddClick?: (ev?: React.MouseEvent<HTMLButtonElement | MouseEvent>) => void;
  onFilterSubmit?: () => void;
}

const SettingsChildren: React.FC<SettingsChildrenProps> = ({
  inputProps,
  onAddClick,
  onFilterSubmit,
  children,
}) => {
  const history = useHistory();

  return (
    <Container>
      <Header>
        <Button
          title="Voltar"
          icon={<IoIosArrowBack />}
          iconSize={20}
          background="var(--secondary)"
          className="flex-start"
          onClick={useCallback(() => history.goBack(), [])}
        />

        <form
          onSubmit={(ev) => {
            ev.preventDefault();

            onFilterSubmit && onFilterSubmit();
          }}
        >
          <TextField
            {...inputProps}
            label="Buscar"
            type="search"
            autoComplete="off"
            style={{ width: "22rem" }}
          />
        </form>

        <Button
          title="Adicionar novo"
          background="var(--secondary)"
          icon={<BsPlusCircleFill />}
          onClick={onAddClick}
        >
          Adicionar
        </Button>
      </Header>

      {children}
    </Container>
  );
};

export default SettingsChildren;
