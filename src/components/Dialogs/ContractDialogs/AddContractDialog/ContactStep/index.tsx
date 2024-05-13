import {
  ChangeEvent,
  FormEvent,
  memo,
  MouseEvent,
  useCallback,
  useState,
} from "react";

import { TextField } from "@material-ui/core";

import Contract from "../../../../../models/Contract";
import Step from "../Step";
import { parsePhone } from "../../../../../global/globalFunctions";

interface ContactStepProps {
  active: boolean;
  value: Contract;
  onChange: (
    ev: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | { name?: string; value?: any }
    >,
    checked?: boolean
  ) => void;
  onSubmit: (ev: FormEvent) => void;
  onBackStep?: (ev: MouseEvent<HTMLButtonElement>) => void;
}

const ContactStep: React.FC<ContactStepProps> = ({
  active,
  value,
  onChange,
  onSubmit,
  onBackStep,
}) => {
  const [errors, setErrors] = useState<Array<keyof Contract>>([]);

  const handleSubmit = useCallback(
    (ev: FormEvent) => {
      ev.preventDefault();

      const errors: Array<keyof Contract> = [];

      if (value.cellphone && value.cellphone.replace(/\D/g, "").length < 10)
        errors.push("cellphone");

      if (value.phone01 && value.phone01.replace(/\D/g, "").length < 10)
        errors.push("phone01");

      if (value.phone02 && value.phone02.replace(/\D/g, "").length < 10)
        errors.push("phone02");

      if (value.work_phone && value.work_phone.replace(/\D/g, "").length < 10)
        errors.push("work_phone");

      setErrors(errors);

      if (!errors.length) onSubmit(ev);
    },
    [onSubmit, value.cellphone, value.phone01, value.phone02, value.work_phone]
  );

  const handleInputChange = useCallback(
    (
      ev: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | { name?: string; value?: any }
      >,
      checked?: boolean
    ) => {
      const { name, value: _value } = ev.target;

      const phoneKeys: Array<keyof Contract> = [
        "cellphone",
        "phone01",
        "phone02",
        "work_phone",
      ];

      if (phoneKeys.includes(name as keyof Contract))
        ev.target.value = parsePhone(_value);

      setErrors((prev) => prev.filter((key) => key !== name));

      onChange(ev, checked);
    },
    [onChange, setErrors]
  );

  return (
    <Step
      onSubmit={handleSubmit}
      onBackStep={onBackStep}
      className={active ? "" : "hidden"}
    >
      <div className="line">
        <TextField
          label="Celular"
          name="cellphone"
          value={value.cellphone}
          onChange={handleInputChange}
          required
          error={errors.includes("cellphone")}
          helperText={errors.includes("cellphone") && "Telefone inválido"}
        />
        <TextField
          label="E-mail"
          name="email"
          value={value.email}
          onChange={handleInputChange}
          type="email"
        />
      </div>

      <div className="line">
        <TextField
          label="Telefone comercial"
          variant="outlined"
          name="phone01"
          value={value.phone01}
          onChange={handleInputChange}
          error={errors.includes("phone01")}
          helperText={errors.includes("phone01") && "Telefone inválido"}
        />
        <TextField
          label="Telefone residencial"
          variant="outlined"
          name="phone02"
          value={value.phone02}
          onChange={handleInputChange}
          error={errors.includes("phone02")}
          helperText={errors.includes("phone02") && "Telefone inválido"}
        />
      </div>

      <div className="line">
        <TextField
          label="Local de trabalho"
          variant="outlined"
          name="work_place"
          value={value.work_place}
          onChange={handleInputChange}
        />
        <TextField
          label="Telefone de trabalho"
          variant="outlined"
          name="work_phone"
          value={value.work_phone}
          onChange={handleInputChange}
          error={errors.includes("work_phone")}
          helperText={errors.includes("work_phone") && "Telefone inválido"}
        />
      </div>
    </Step>
  );
};

export default memo(ContactStep);
