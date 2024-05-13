import {
  useCallback,
  useEffect,
  ChangeEvent,
  useState,
  FormEvent,
  MouseEvent,
  memo,
} from "react";

import { isBefore } from "date-fns";
import { TextField } from "@material-ui/core";
import { isValid } from "date-fns/esm";
import { KeyboardDatePicker } from "@material-ui/pickers";

import { notificate } from "../../../../../global/notificate";

import Contract from "../../../../../models/Contract";
import ContractType from "../../../../../models/ContractType";
import ContractTypeService from "../../../../../services/ContractTypeService";
import Step from "../Step";
import SelectFilter from "../../../../SelectFilter";
import Plan from "../../../../../models/Plan";
import Pagination from "../../../../../models/Pagination";
import PlanService from "../../../../../services/PlanService";
import InstallationTax from "../../../../../models/InstallationTax";
import InstallationTaxService from "../../../../../services/InstallationTaxService";
import SwitchToggle from "../../../../SwitchToggle";

interface ContractStepProps {
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

const ContractStep: React.FC<ContractStepProps> = ({
  active,
  value,
  onChange,
  onSubmit,
  onBackStep,
}) => {
  const [errors, setErrors] = useState<Array<keyof Contract>>([]);

  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [installationTaxes, setInstallationTaxes] = useState<InstallationTax[]>(
    []
  );
  const [plans, setPlans] = useState<Pagination<Plan>>();

  const handleSubmit = useCallback(
    (ev: FormEvent) => {
      ev.preventDefault();

      const errors: Array<keyof Contract> = [];
      const plan = plans?.data.find((plan) => plan.id === value.plan_id);

      if (plan && value.monthly_price < (plan.composition?.min_value || 0))
        errors.push("monthly_price");

      if (value.conclusion_date && !isValid(value.conclusion_date))
        errors.push("conclusion_date");
      else if (
        value.conclusion_date &&
        value.accession_date &&
        (!isValid(value.conclusion_date) ||
          isBefore(
            new Date(value.conclusion_date),
            new Date(value.accession_date)
          ))
      )
        errors.push("accession_date");

      setErrors(errors);

      if (!errors.length) onSubmit(ev);
    },
    [
      value.conclusion_date,
      value.accession_date,
      value.plan_id,
      value.monthly_price,
      setErrors,
      onSubmit,
      plans,
    ]
  );

  useEffect(() => {
    if (
      !value.id &&
      value.expiration_day &&
      value.month_amount &&
      value.accession_date
    ) {
      const accession_date = new Date(value.accession_date);
      const conclusion_date = accession_date;

      conclusion_date.setDate(value.expiration_day);
      conclusion_date.setMonth(
        accession_date.getMonth() + Number(value.month_amount)
      );

      onChange({
        target: { name: "conclusion_date", value: conclusion_date },
      } as ChangeEvent<{ name?: string; value: Date }>);
    }
  }, [
    value.id,
    value.expiration_day,
    value.month_amount,
    value.accession_date,
  ]);

  useEffect(() => {
    if (!value.id) {
    }
  }, [onChange, contractTypes, value.id, value.contract_type_id]);

  useEffect(() => {
    if (!value.id) {
    }
  }, [onChange, plans, value.id, value.plan_id]);

  const handleInputChange = useCallback(
    (
      ev: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | { name?: string; value?: any }
      >,
      checked?: boolean
    ) => {
      const { name, value: _value } = ev.target;

      if (name === "plan_id") {
        const currentPlan = plans?.data.find((plan) => plan.id == _value);

        if (currentPlan) {
          onChange({
            target: {
              name: "monthly_price",
              value: currentPlan.base_monthly_price,
            },
          } as ChangeEvent<{ name?: string; value: number }>);

          onChange({
            target: {
              name: "monthly_benefit",
              value: currentPlan.base_monthly_benefit,
            },
          } as ChangeEvent<{ name?: string; value: number }>);
        }
      } else if (name === "installation_tax_id") {
        const currentInstallationTax = installationTaxes.find(
          (installationTax) => installationTax.id == _value
        );

        if (currentInstallationTax)
          onChange({
            target: {
              name: "installation_tax_value",
              value: currentInstallationTax.base_value,
            },
          } as ChangeEvent<{ name?: string; value: number }>);
      }

      setErrors((prev) => prev.filter((key) => key !== name));
      onChange(ev, checked);
    },
    [onChange, setErrors, plans, contractTypes, installationTaxes]
  );

  const refreshPlans = useCallback(
    (page?: number, per_page?: number, query?: string) => {
      PlanService.index({ order_by: "name", page, per_page, query })
        .then((response) => {
          if (
            !response.data.data.some((plan) => plan.id === value.plan_id) &&
            value.plan
          )
            response.data.data.push(value.plan);

          setPlans(response.data);
        })
        .catch((err) => {
          notificate({
            title: `Erro ${err.response?.status}`,
            message: "Ocorreu um erro ao carregar os planos",
            type: "danger",
          });

          console.log(err);
        });
    },
    [setPlans, value]
  );

  const refresh = useCallback(() => {
    refreshPlans(1, 20);

    ContractTypeService.index({ active: 1, order_by: "name" })
      .then((response) => setContractTypes(response.data))
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status}`,
          message: "Ocorreu um erro ao carregar os tipos de contrato",
          type: "danger",
        });

        console.log(err);
      });

    InstallationTaxService.index({ active: 1 })
      .then((response) => setInstallationTaxes(response.data))
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status}`,
          message: "Ocorreu um erro ao carregar as taxas de instalação",
          type: "danger",
        });

        console.log(err);
      });
  }, [setContractTypes, setInstallationTaxes]);

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
          label="Cód. Contrato"
          type="number"
          name="contract_number"
          value={value.contract_number}
          onChange={handleInputChange}
          required
        />

        <SelectFilter
          label="Tipo de Contrato"
          options={contractTypes}
          identifierAttr="id"
          nameAttr="name"
          name="contract_type_id"
          value={value.contract_type_id || ""}
          onChange={handleInputChange}
          required
        />

        <TextField
          label="Vendedor"
          name="seller"
          value={value.seller}
          onChange={handleInputChange}
        />
      </div>

      <div className="line">
        <TextField
          label="Dia do vencimento"
          name="expiration_day"
          value={value.expiration_day}
          onChange={(ev) => {
            if (Number(ev.target.value) < 1) ev.target.value = "";
            else if (Number(ev.target.value) > 31) ev.target.value = "31";

            handleInputChange(ev);
          }}
          type="number"
          required
        />
        <TextField
          label="Qtd. meses do contrato"
          name="month_amount"
          value={value.month_amount || ""}
          onChange={(ev) => {
            if (Number(ev.target.value) < 1) ev.target.value = "";

            handleInputChange(ev);
          }}
          type="number"
          required
        />

        <KeyboardDatePicker
          autoOk
          disableToolbar
          autoComplete="off"
          variant="inline"
          label="Data de adesão"
          format="dd/MM/yyyy"
          name="accession_date"
          value={value.accession_date}
          onChange={(value) =>
            handleInputChange({
              target: { name: "accession_date", value },
            } as ChangeEvent<{ name?: string; value?: any }>)
          }
          error={errors.includes("accession_date")}
          helperText={
            errors.includes("accession_date") && "Adesão maior que o término"
          }
          required
        />

        <KeyboardDatePicker
          autoOk
          disableToolbar
          autoComplete="off"
          variant="inline"
          label="Data de término"
          format="dd/MM/yyyy"
          name="conclusion_date"
          value={value.conclusion_date}
          onChange={(value) =>
            handleInputChange({
              target: { name: "conclusion_date", value },
            } as ChangeEvent<{ name?: string; value?: any }>)
          }
          error={errors.includes("conclusion_date")}
          helperText={errors.includes("conclusion_date") && "Data inválida"}
          required
        />
      </div>

      <div className="line">
        <SelectFilter
          label="Plano"
          options={
            plans?.data.filter(
              (plan) => plan.id == value.plan_id || plan.active
            ) || []
          }
          identifierAttr="id"
          nameAttr="name"
          name="plan_id"
          value={value.plan_id || ""}
          onChange={handleInputChange}
          onSubmitFilter={(query) => refreshPlans(1, plans?.perPage, query)}
          required
        />

        <TextField
          className="small"
          label="Mensalidade (R$)"
          name="monthly_price"
          value={value.monthly_price || ""}
          onChange={handleInputChange}
          type="number"
          error={errors.includes("monthly_price")}
          helperText={
            errors.includes("monthly_price") &&
            `O valor mínimo aceito para esse plano é R$ ${(
              plans?.data.find((plan) => plan.id === value.plan_id)?.composition
                ?.min_value || 0
            ).toFixed(2)}`
          }
          required
        />

        <TextField
          className="small"
          label="Benefício mensal (R$)"
          name="monthly_benefit"
          value={value.monthly_benefit || ""}
          onChange={handleInputChange}
          type="number"
          required
        />
      </div>

      <div className="line">
        <SelectFilter
          label="Taxa de instalação"
          options={
            installationTaxes?.filter(
              (installationTax) =>
                installationTax.id == value.installation_tax_id ||
                installationTax.active
            ) || []
          }
          identifierAttr="id"
          nameAttr="name"
          name="installation_tax_id"
          value={value.installation_tax_id || ""}
          onChange={handleInputChange}
          required
        />

        <TextField
          className="small"
          label="Valor (R$)"
          name="installation_tax_value"
          value={value.installation_tax_value || ""}
          onChange={(ev) => {
            ev.target.value =
              Number(ev.target.value) < 0 ? "0" : ev.target.value;

            handleInputChange(ev);
          }}
          type="number"
          required
        />

        <div className="small">
          <SwitchToggle
            label="Isento"
            name="free_installation_tax"
            value={Boolean(value.free_installation_tax)}
            onChange={handleInputChange}
            formControlLabelProps={{
              style: { margin: "auto" },
            }}
          />
        </div>
      </div>

      <div className="line">
        <TextField
          variant="outlined"
          label="Observação"
          name="note"
          value={value.note}
          onChange={handleInputChange}
          multiline
        />
      </div>
    </Step>
  );
};

export default memo(ContractStep);
