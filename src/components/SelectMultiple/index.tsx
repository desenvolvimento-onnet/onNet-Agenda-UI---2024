import { ChangeEvent, FormEvent, useCallback, useMemo, useRef } from "react";

import {
  Checkbox,
  FormControl,
  Input,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  SelectProps,
  TextField,
} from "@material-ui/core";

import { Form } from "./styles";
import { useState } from "react";
import { padronize } from "../../global/globalFunctions";
import MessageInfo from "../MessageInfo";
import Divider from "../Divider";
import { useEffect } from "react";

type KeysOfType<T, TProp> = {
  [P in keyof T]: T[P] extends TProp ? P : never;
}[keyof T];

interface SelectMultipleProps<T> extends SelectProps {
  label: string;
  options: T[];
  value: Array<string | number>;
  identifierAttr: KeysOfType<T, string | number | undefined>;
  nameAttr: KeysOfType<T, string | number>;
  onChange?: (ev: ChangeEvent<{ name?: string; value: unknown }>) => void;
  onSubmitFilter?: (query: string) => void;
}

type Option = { id: number | string; name: string };

function SelectMultiple<T>({
  label,
  options,
  value,
  identifierAttr,
  nameAttr,
  onChange,
  onSubmitFilter,
  ...props
}: SelectMultipleProps<T>) {
  const [query, setQuery] = useState<string>("");
  const [findedValues, setFindedValues] = useState<Option[]>([]);

  const optionsFiltered = useMemo(() => {
    const parsedQuery = padronize(query);

    return options.filter((option) => {
      const parsedOption = padronize(String(option[nameAttr]));

      return parsedOption.indexOf(parsedQuery) > -1;
    });
  }, [options, query]);

  const handleMultipleChange = useCallback(
    (ev: ChangeEvent<{ name?: string; value: unknown }>) => {
      const { name } = ev.target;
      const _value = (ev.target.value as Array<typeof identifierAttr>) || [];

      if (name && _value[_value.length - 1] === "all") {
        const data = optionsFiltered.map((item) => item[identifierAttr]) || [];
        const voidData = _value.filter(
          (value) => value !== "all" && !data.includes(value as any)
        );

        data.push(...(voidData as any));

        ev.target.value = _value.length - 1 == data.length ? voidData : data;
      }

      onChange && onChange(ev);
    },
    [optionsFiltered, value, onChange]
  );

  const handleSubmit = useCallback(
    (ev: FormEvent) => {
      ev.preventDefault();
      ev.stopPropagation();

      onSubmitFilter && onSubmitFilter(query);
    },
    [onSubmitFilter, query]
  );

  const renderValue = useCallback(
    (selected: unknown) => {
      const data = selected as Array<string | number>;

      return findedValues
        .filter((item) => data.includes(item.id))
        .map((item) => item.name)
        .join(", ");
    },
    [findedValues]
  );

  useEffect(() => {
    const loadedOptions: Option[] = [];

    value.forEach((id) => {
      const option = options.find(
        (option) => (option[identifierAttr] as any as number | string) === id
      );

      if (option)
        loadedOptions.push({ id, name: option[nameAttr] as any as string });
    });

    setFindedValues((prev) => {
      prev = [...prev, ...loadedOptions];

      return prev.reduce((a: Option[], b) => {
        const exists = a.find((item) => item.id === b.id);

        return exists ? a : a.concat([b]);
      }, []);
    });
  }, [value, setFindedValues]);

  return (
    <FormControl>
      <InputLabel>{label}</InputLabel>
      <Select
        {...props}
        multiple
        value={value}
        onChange={handleMultipleChange}
        onClick={(ev) => ev.stopPropagation()}
        input={<Input />}
        renderValue={renderValue}
        MenuProps={{
          getContentAnchorEl: null,
          anchorOrigin: {
            horizontal: "center",
            vertical: "center",
          },
          transformOrigin: {
            horizontal: "center",
            vertical: "center",
          },
        }}
      >
        <Form
          onSubmit={handleSubmit}
          onClickCapture={(ev) => ev.stopPropagation()}
          onKeyDownCapture={(ev) => ev.stopPropagation()}
        >
          <TextField
            label={`Filtrar ${onSubmitFilter ? "(ENTER para buscar)" : ""}`}
            variant="outlined"
            margin="dense"
            type="search"
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
          />

          <Divider />

          {!optionsFiltered.length && (
            <MessageInfo>Nenhum item encontrado</MessageInfo>
          )}
        </Form>

        {optionsFiltered.length && (
          <MenuItem value="all">
            <Checkbox
              checked={value.length === options.length}
              indeterminate={Boolean(
                value.length && value.length !== options.length
              )}
            />
            <ListItemText primary={<i>Selecionar tudo</i>} />
          </MenuItem>
        )}

        <Divider style={{ margin: ".5rem 1rem" }} />

        {optionsFiltered.map((item) => {
          const id = item[identifierAttr] as any;

          return (
            <MenuItem key={id} value={id}>
              <Checkbox checked={value.includes(id)} />
              <ListItemText primary={item[nameAttr]} />
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

export default SelectMultiple;
