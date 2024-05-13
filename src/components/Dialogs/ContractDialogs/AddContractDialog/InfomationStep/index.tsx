import {
  ChangeEvent,
  MouseEvent,
  FormEvent,
  memo,
  useCallback,
  useState,
  useEffect,
} from "react";

import { cnpj, cpf } from "cpf-cnpj-validator";
import { TextField } from "@material-ui/core";
import { differenceInYears, isValid } from "date-fns";
import { KeyboardDatePicker } from "@material-ui/pickers";

import { parseCnpj, parseCpf } from "../../../../../global/globalFunctions";

import Contract from "../../../../../models/Contract";
import SwitchToggle from "../../../../SwitchToggle";
import Step from "../Step";
import System from "../../../../../models/System";
import SystemService from "../../../../../services/SystemService";
import { notificate } from "../../../../../global/notificate";
import SelectFilter from "../../../../SelectFilter";

interface InformationStepProps {
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

const InformationStep: React.FC<InformationStepProps> = ({
  active,
  value,
  onChange,
  onSubmit,
  onBackStep,
}) => {
  const [errors, setErrors] = useState<Array<keyof Contract>>([]);

  const [systems, setSystems] = useState<System[]>([]);

  const handleSubmit = useCallback(
    (ev: FormEvent) => {
      ev.preventDefault();

      const errors: Array<keyof Contract> = [];

      if (
        (!value.legal_person && !cpf.isValid(value.cpf_cnpj)) ||
        (value.legal_person && !cnpj.isValid(value.cpf_cnpj))
      )
        errors.push("cpf_cnpj");

      if (
        !value.legal_person &&
        value.birthday_foundation &&
        (!isValid(value.birthday_foundation) ||
          differenceInYears(new Date(), new Date(value.birthday_foundation)) <
            18)
      )
        errors.push("birthday_foundation");

      setErrors(errors);

      if (!errors.length) onSubmit(ev);
    },
    [
      value.legal_person,
      value.cpf_cnpj,
      value.birthday_foundation,
      onSubmit,
      setErrors,
    ]
  );

  const handleInputChange = useCallback(
    (
      ev: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | { name?: string; value?: any }
      >,
      checked?: boolean
    ) => {
      const { name, value: _value } = ev.target;

      setErrors((prev) => prev.filter((key) => key !== name));

      if (name === "cpf_cnpj")
        ev.target.value = value.legal_person
          ? parseCnpj(_value)
          : parseCpf(_value);
      else if (name === "legal_person") {
        const cpfCnpj = checked
          ? parseCnpj(value.cpf_cnpj)
          : parseCpf(value.cpf_cnpj);

        onChange({
          target: { name: "cpf_cnpj", value: cpfCnpj },
        } as ChangeEvent<HTMLInputElement>);

        onChange({
          target: { name: "contract_type_id", value: "" },
        } as ChangeEvent<HTMLInputElement>);

        setErrors((prev) =>
          prev.filter(
            (key) => key !== "cpf_cnpj" && key !== "birthday_foundation"
          )
        );

        if (checked) {
          onChange({
            target: { name: "father", value: "" },
          } as ChangeEvent<HTMLInputElement>);

          onChange({
            target: { name: "mother", value: "" },
          } as ChangeEvent<HTMLInputElement>);
        } else {
          onChange({
            target: { name: "fantasy_name", value: "" },
          } as ChangeEvent<HTMLInputElement>);

          onChange({
            target: { name: "municipal_registration", value: "" },
          } as ChangeEvent<HTMLInputElement>);
        }
      }

      onChange(ev, checked);
    },
    [value.legal_person, value.cpf_cnpj, onChange, setErrors]
  );

  const refresh = useCallback(() => {
    SystemService.index({ order_by: "name" })
      .then((response) => setSystems(response.data))
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status}`,
          message: "Ocorreu um erro ao carregar os sistemas",
          type: "danger",
        });

        console.log(err);
      });
  }, []);

  useEffect(() => {
    if (active) refresh();
  }, [active, refresh]);

  return (
    <Step
      onSubmit={handleSubmit}
      onBackStep={onBackStep}
      className={active ? "" : "hidden"}
    >
      <div className="line">
        <TextField
          className="small"
          label="Cód. Cliente"
          type="number"
          name="client_number"
          value={value.client_number}
          onChange={handleInputChange}
        />

        <TextField
          label="Nome do cliente"
          name="client"
          value={value.client}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="line">
        <TextField
          label={value.legal_person ? "CNPJ" : "CPF"}
          name="cpf_cnpj"
          value={value.cpf_cnpj}
          onChange={handleInputChange}
          required
          error={errors.includes("cpf_cnpj")}
          helperText={errors.includes("cpf_cnpj") && "Documento inválido"}
        />

        <TextField
          label={value.legal_person ? "Inscrição Estadual" : "RG"}
          name="rg_ie"
          value={value.rg_ie}
          onChange={handleInputChange}
        />

        <KeyboardDatePicker
          autoOk
          disableToolbar
          autoComplete="off"
          variant="inline"
          label={value.legal_person ? "Data de fundação" : "Data de nascimento"}
          format="dd/MM/yyyy"
          name="birthday_foundation"
          value={value.birthday_foundation}
          onChange={(value) =>
            handleInputChange({
              target: { name: "birthday_foundation", value },
            } as ChangeEvent<{ name?: string; value?: any }>)
          }
          error={errors.includes("birthday_foundation")}
          helperText={
            errors.includes("birthday_foundation") && "Pessoa menor de idade"
          }
        />
      </div>

      <div className={`line ${value.legal_person ? "" : "hidden"}`}>
        <TextField
          label="Nome fantasia"
          variant="outlined"
          name="fantasy_name"
          value={value.fantasy_name}
          onChange={handleInputChange}
        />
        <TextField
          label="Inscrição municipal"
          variant="outlined"
          name="municipal_registration"
          value={value.municipal_registration}
          onChange={handleInputChange}
        />
      </div>

      <div className={`line ${value.legal_person ? "hidden" : ""}`}>
        <TextField
          label="Nome do Pai"
          variant="outlined"
          name="father"
          value={value.father}
          onChange={handleInputChange}
        />
        <TextField
          label="Nome da Mãe"
          variant="outlined"
          name="mother"
          value={value.mother}
          onChange={handleInputChange}
        />
      </div>

      <div className="line">
        <div>
          <SwitchToggle
            label="Pessoa jurídica"
            name="legal_person"
            value={Boolean(value.legal_person)}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <SwitchToggle
            label="DDR"
            name="ddr"
            value={Boolean(value.ddr)}
            onChange={handleInputChange}
          />
        </div>

        <SelectFilter
          label="Sistema"
          identifierAttr="id"
          nameAttr="name"
          options={systems}
          name="system_id"
          value={value.system_id || ""}
          onChange={handleInputChange}
          required
        />
      </div>
    </Step>
  );
};

export default memo(InformationStep);
