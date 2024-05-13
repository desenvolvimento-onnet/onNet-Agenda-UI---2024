import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
  TextField,
} from "@material-ui/core";

import { padronize } from "../../global/globalFunctions";

import { Form } from "./styles";
import Divider from "../Divider";
import MessageInfo from "../MessageInfo";

type KeysOfType<T, TProp> = {
  [P in keyof T]: T[P] extends TProp ? P : never;
}[keyof T];

interface SelectFilterProps<T> extends SelectProps {
  label: string;
  options: T[];
  value: string | number;
  identifierAttr: KeysOfType<T, string | number | undefined>;
  nameAttr: KeysOfType<T, string | number>;
  onChange?: (ev: ChangeEvent<{ name?: string; value: unknown }>) => void;
  onSubmitFilter?: (query: string) => void;
}

function SelectFilter<T>({
  label,
  options,
  value,
  identifierAttr,
  nameAttr,
  onChange,
  required,
  onSubmitFilter,
  ...props
}: SelectFilterProps<T>) {
  const [query, setQuery] = useState<string>("");

  const optionsFiltered = useMemo(() => {
    const parsedQuery = padronize(query);

    return options.filter((option) => {
      const parsedOption = padronize(String(option[nameAttr]));

      return (
        value === (option[identifierAttr] as any) ||
        parsedOption.indexOf(parsedQuery) > -1
      );
    });
  }, [options, query, value]);

  const handleSubmit = useCallback(
    (ev: FormEvent) => {
      ev.preventDefault();
      ev.stopPropagation();

      onSubmitFilter && onSubmitFilter(query);
    },
    [onSubmitFilter, query]
  );

  const getTitle = useCallback(() => {
    if (value) {
      const option = options.find(
        (option) => (option[identifierAttr] as any) === value
      );

      if (option) return option[nameAttr] as any as string;
    }

    return "";
  }, [options, value]);

  return (
    <FormControl required={required}>
      <InputLabel>{label}</InputLabel>

      <Select
        {...props}
        title={getTitle()}
        value={value}
        onChange={onChange}
        required={required}
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

        {!required && <MenuItem value="">&nbsp;</MenuItem>}

        {optionsFiltered.map((option) => {
          const id = option[identifierAttr] as any;

          return (
            <MenuItem key={id} value={id}>
              {option[nameAttr]}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

export default SelectFilter;
