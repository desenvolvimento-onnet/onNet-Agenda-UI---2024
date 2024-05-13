import React, { ChangeEvent, FormEvent, memo, useCallback } from "react";

import { TextField } from "@material-ui/core";
import { BsPlusCircleFill } from "react-icons/bs";
import { TiMinus } from "react-icons/ti";

import CompositionItem from "../../../../models/CompositionItem";
import Button from "../../../../components/Button";
import SwitchToggle from "../../../../components/SwitchToggle";

import { Container } from "./styles";

interface ItemProps {
  type: "include" | "remove";
  useValue?: boolean;
  compositionItem: CompositionItem;
  onChange: (
    ev: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | { name?: string; value?: any }
    >,
    checked?: boolean
  ) => void;
  onAddClick?: () => void;
  onRemoveClick?: () => void;
}

const Item: React.FC<ItemProps> = ({
  type,
  useValue,
  compositionItem,
  onChange,
  onAddClick,
  onRemoveClick,
}) => {
  const handleSubmit = useCallback(
    (ev: FormEvent) => {
      ev.preventDefault();

      if (type === "include") onAddClick && onAddClick();
      else onRemoveClick && onRemoveClick();
    },
    [onAddClick, onRemoveClick]
  );

  return (
    <Container onSubmit={handleSubmit}>
      <TextField
        label="Nome"
        name="name"
        value={compositionItem.name || ""}
        onChange={onChange}
        autoComplete="off"
        required={type === "include"}
      />

      <TextField
        label="Abreviação"
        name="short_name"
        value={compositionItem.short_name || ""}
        onChange={onChange}
        autoComplete="off"
        required={type === "include"}
      />

      {useValue ? (
        <TextField
          label="Valor (R$)"
          type="number"
          name="value"
          value={compositionItem.value?.toString() || ""}
          onChange={(ev) => {
            ev.target.value =
              Number(ev.target.value) < 0 ? "0" : ev.target.value;

            onChange(ev);
          }}
          disabled={Boolean(compositionItem.autocomplete)}
          required={type === "include" && !compositionItem.autocomplete}
        />
      ) : (
        <TextField
          label="Fração (%)"
          type="number"
          name="percent"
          value={compositionItem.percent?.toString() || ""}
          onChange={(ev) => {
            ev.target.value =
              Number(ev.target.value) < 0 ? "0" : ev.target.value;

            onChange(ev);
          }}
          disabled={Boolean(compositionItem.autocomplete)}
          required={type === "include" && !compositionItem.autocomplete}
        />
      )}

      <SwitchToggle
        label="Auto completar"
        name="autocomplete"
        value={compositionItem.autocomplete}
        onChange={onChange}
        formControlLabelProps={{
          className: "switch-label",
          labelPlacement: "bottom",
        }}
      />

      {type === "include" ? (
        <Button
          title="Adicionar"
          icon={<BsPlusCircleFill />}
          background="var(--success)"
          height={2}
          iconSize={10}
          type="submit"
        />
      ) : (
        <Button
          title="Remover"
          icon={<TiMinus />}
          background="var(--danger)"
          height={2}
          iconSize={10}
          type="submit"
        />
      )}
    </Container>
  );
};

export default memo(Item);
