import React, { ChangeEvent, FormEvent, memo, useCallback } from "react";

import { TextField } from "@material-ui/core";
import { BsPlusCircleFill } from "react-icons/bs";
import { TiMinus } from "react-icons/ti";

import Button from "../../../../../components/Button";

import { Container } from "./styles";
import SelectFilter from "../../../../../components/SelectFilter";
import ContractProduct from "../../../../../models/ContractProduct";
import Product from "../../../../../models/Product";
import { useContext } from "react";
import { AuthContext } from "../../../../../global/context/AuthContext";

interface ContractProductItemProps {
  type: "include" | "remove";
  contractProduct: ContractProduct;
  products: Product[];
  onChange: (
    ev: ChangeEvent<HTMLInputElement | { name?: string; value: any }>
  ) => void;
  onAddClick?: () => void;
  onRemoveClick?: () => void;
}

const ContractProductItem: React.FC<ContractProductItemProps> = ({
  type,
  contractProduct,
  products,
  onChange,
  onAddClick,
  onRemoveClick,
}) => {
  const { userPermissions } = useContext(AuthContext);

  const handleInputChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = ev.target;

      if (name === "amount") {
        const parsedValue = Number(parseInt(value) || "");

        ev.target.value = String(parsedValue < 1 ? 1 : parsedValue);
      } else {
        const parsedValue = Number(value);

        ev.target.value = String(parsedValue < 0 ? 0 : parsedValue);
      }

      onChange(ev);
    },
    [onChange]
  );

  const handleSubmit = useCallback(
    (ev: FormEvent) => {
      ev.preventDefault();

      if (type === "include") onAddClick && onAddClick();
      else onRemoveClick && onRemoveClick();
    },
    [type, onAddClick, onRemoveClick]
  );

  return (
    <Container onSubmit={handleSubmit}>
      <SelectFilter
        label="Item"
        options={products}
        identifierAttr="id"
        nameAttr="name"
        name="product_id"
        value={contractProduct.product_id || ""}
        onChange={onChange}
        readOnly={type === "remove"}
        required={type === "include"}
      />

      <TextField
        label="Preço (R$)"
        type="number"
        name="value"
        value={contractProduct.value}
        onChange={handleInputChange}
        InputProps={{
          readOnly: !userPermissions?.contract.products.edit_value,
        }}
        required={type === "include"}
      />

      <TextField
        label="Quantidade"
        type="number"
        name="amount"
        value={contractProduct.amount}
        onChange={handleInputChange}
        required={type === "include"}
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

export default memo(ContractProductItem);
