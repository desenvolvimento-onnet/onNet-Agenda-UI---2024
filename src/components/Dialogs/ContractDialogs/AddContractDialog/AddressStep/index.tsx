import {
  ChangeEvent,
  FormEvent,
  memo,
  MouseEvent,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";

import { notificate } from "../../../../../global/notificate";

import Contract from "../../../../../models/Contract";
import City from "../../../../../models/City";
import CityService from "../../../../../services/CityService";
import Step from "../Step";
import { parseCep } from "../../../../../global/globalFunctions";
import SelectFilter from "../../../../SelectFilter";
import { AuthContext } from "../../../../../global/context/AuthContext";

interface AddressStepProps {
  active: boolean;
  value: Contract;
  submitTitle?: string;
  onChange: (
    ev: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | { name?: string; value?: any }
    >,
    checked?: boolean
  ) => void;
  onSubmit: (ev: FormEvent) => void;
  onBackStep?: (ev: MouseEvent<HTMLButtonElement>) => void;
}

const AddressStep: React.FC<AddressStepProps> = ({
  active,
  value,
  submitTitle,
  onChange,
  onSubmit,
  onBackStep,
}) => {
  const { user } = useContext(AuthContext);

  const [errors, setErrors] = useState<Array<keyof Contract>>([]);
  const [cities, setCities] = useState<City[]>([]);

  const handleSubmit = useCallback(
    (ev: FormEvent) => {
      ev.preventDefault();

      const errors: Array<keyof Contract> = [];

      if (value.zip_code.replace(/\D/g, "").length < 8) errors.push("zip_code");

      setErrors(errors);

      if (!errors.length) onSubmit(ev);
    },
    [onSubmit, value.zip_code]
  );

  const handleInputChange = useCallback(
    (
      ev: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | { name?: string; value?: any }
      >,
      checked?: boolean
    ) => {
      const { name, value: _value } = ev.target;

      if (name === "zip_code") ev.target.value = parseCep(_value);

      setErrors((prev) => prev.filter((key) => key !== name));

      onChange(ev, checked);
    },
    [onChange, setErrors]
  );

  const refresh = useCallback(() => {
    CityService.index({ order_by: "name" })
      .then((response) => setCities(response.data))
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status}`,
          message: "Ocorreu um erro ao carregar as cidades",
          type: "danger",
        });

        console.log(err);
      });
  }, [setCities]);

  useEffect(() => {
    if (active) refresh();
  }, [active, refresh]);

  return (
    <Step
      onSubmit={handleSubmit}
      onBackStep={onBackStep}
      className={active ? "" : "hidden"}
      submitTitle={submitTitle}
    >
      <div className="line">
        <SelectFilter
          label="Cidade"
          options={cities}
          identifierAttr="id"
          nameAttr="name"
          name="city_id"
          value={value.city_id || ""}
          onChange={handleInputChange}
          required
        />

        <TextField
          label="CEP"
          name="zip_code"
          value={value.zip_code}
          onChange={handleInputChange}
          required
          error={errors.includes("zip_code")}
          helperText={errors.includes("zip_code") && "CEP inválido"}
        />
      </div>

      <div className="line">
        <TextField
          className="small"
          variant="outlined"
          label="Bairro"
          name="district"
          value={value.district}
          onChange={handleInputChange}
          required
        />

        <TextField
          variant="outlined"
          label="Logradouro"
          name="street"
          value={value.street}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="line">
        <TextField
          className="small"
          variant="outlined"
          label="Número"
          name="number"
          value={value.number}
          onChange={handleInputChange}
          required
        />

        <TextField
          variant="outlined"
          label="Complemento"
          name="complement"
          value={value.complement}
          onChange={handleInputChange}
        />
      </div>
    </Step>
  );
};

export default memo(AddressStep);
