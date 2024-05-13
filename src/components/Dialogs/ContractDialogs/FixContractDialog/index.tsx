import React, {
  ChangeEvent,
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { CircularProgress, DialogProps, TextField } from "@material-ui/core";
import { MdAttachMoney, MdNetworkCheck } from "react-icons/md";
import { KeyboardDatePicker } from "@material-ui/pickers";
import { BsPersonLinesFill } from "react-icons/bs";
import { differenceInDays, format } from "date-fns";

import { CloseStatus } from "../context";
import { differenceInMonths } from "date-fns/esm";
import { notificate } from "../../../../global/notificate";
import { AuthContext } from "../../../../global/context/AuthContext";
import System, {
  Plan as SystemPlan,
  Contract as SystemContract,
} from "../../../../models/System";
import SystemService, {
  SystemContractParams,
} from "../../../../services/SystemService";

import ConfirmDialog from "../../../ConfirmDialog";
import ContractService from "../../../../services/ContractService";
import Contract from "../../../../models/Contract";
import ContractTypeService from "../../../../services/ContractTypeService";
import ContractType from "../../../../models/ContractType";
import SelectFilter from "../../../SelectFilter";
import CityService from "../../../../services/CityService";
import PlanService from "../../../../services/PlanService";
import Plan from "../../../../models/Plan";
import Divider from "../../../Divider";
import LabelGroup from "../../../LabelGroup";
import InstallationTax from "../../../../models/InstallationTax";
import InstallationTaxService from "../../../../services/InstallationTaxService";
import SwitchToggle from "../../../SwitchToggle";
import Composition from "../../../../models/Composition";
import CompositionService from "../../../../services/CompositionService";
import AjustmentService from "../../../../services/AjustmentService";
import RenewService from "../../../../services/RenewService";

import { Container } from "./styles";

interface FixContractDialogProps extends DialogProps {
  index: number;
  open: boolean;
  contractId?: number;
  system?: System;
  contractParams?: SystemContractParams;
  onClose: (options: CloseStatus) => void;
}

const FixContractDialog: React.FC<FixContractDialogProps> = ({
  index,
  open,
  onClose,
  contractId,
  system,
  contractParams,
  ...props
}) => {
  const { userPermissions } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [selectedPlan, setSelectedPlan] = useState<Plan>();
  const [selectedSystem, setSelectedSystem] = useState<System>();
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [installationTaxes, setInstallationTaxes] = useState<InstallationTax[]>(
    []
  );

  const [contract, setContract] = useState<Contract>({} as Contract);

  useEffect(() => {
    if (open) {
      if (!contractId && !userPermissions?.contract.import.allow) {
        notificate({
          title: "Erro",
          message: "Você não tem permissão para importar o contrato",
          type: "danger",
        });

        onClose({ index, success: false });
      } else if (contractId && !userPermissions?.contract.fix.allow) {
        notificate({
          title: "Erro",
          message: "Você não tem permissão para ajustar o contrato",
          type: "danger",
        });

        onClose({ index, success: false });
      }
    }
  }, [open, userPermissions]);

  const onSubmit = useCallback(async (form: Contract, contractId?: number) => {
    if (
      !form.contract_type_id ||
      !form.accession_date ||
      !form.installation_tax_id
    ) {
      notificate({
        title: "Atenção",
        message: "Preencha todos os campos",
        type: "info",
      });

      throw new Error("Missing data form");
    }

    form.birthday_foundation = format(
      new Date(form.birthday_foundation || ""),
      "yyyy-MM-dd 00:00:00"
    );

    form.accession_date = format(
      new Date(form.accession_date || ""),
      "yyyy-MM-dd 00:00:00"
    );

    form.conclusion_date = format(
      new Date(form.conclusion_date || ""),
      "yyyy-MM-dd 00:00:00"
    );

    if (contractId) await ContractService.update(contractId, form);
    else await ContractService.store(form);
  }, []);

  const handleInputChange = useCallback(
    (
      ev: ChangeEvent<HTMLInputElement | { name?: string; value?: any }>,
      checked?: boolean
    ) => {
      const { name, value } = ev.target;

      const switchButton: Array<keyof Contract> = [
        "legal_person",
        "free_installation_tax",
        "canceled",
      ];

      if (name === "installation_tax_id") {
        const installationTax = installationTaxes.find(
          (installationTax) => installationTax.id == value
        );

        if (installationTax)
          handleInputChange({
            target: {
              name: "installation_tax_value",
              value: installationTax.base_value,
            },
          } as ChangeEvent<{ name?: string; value: number }>);
      }

      setContract((prev) => ({
        ...prev,
        [name || ""]: switchButton.includes(name as keyof Contract)
          ? checked
          : value,
      }));
    },
    [setContract, installationTaxes]
  );

  const handleClose = useCallback(
    (success?: boolean) => {
      if (success && contract) {
        setIsLoading(true);

        onSubmit(contract, contractId)
          .then(() => {
            notificate({
              title: "Sucesso",
              message: `Contrato ${
                contractId ? "ajustado" : "importado"
              } com sucesso!`,
              type: "success",
            });

            onClose({ index, success });
          })
          .catch((err) => {
            if (err.response?.status)
              notificate({
                title: `Erro ${err.response.status || ""}`,
                message: "Ocorreu um erro ao ajustar o contrato",
                type: "danger",
              });

            console.log(err);
          })
          .finally(() => setIsLoading(false));
      } else onClose({ index, success });
    },
    [onClose, index, onSubmit, contract, contractId]
  );

  const fixPlan = useCallback(
    async (
      plan: SystemPlan,
      compositions: Composition[],
      base_monthly_benefit: number
    ) => {
      var fixedPlan = (
        await PlanService.index({ plan_number: plan.plan_number })
      ).data.data[0];

      var composition_id: number | undefined;

      for (let i = 0; i < compositions.length; i++)
        if (plan.base_monthly_price >= compositions[i].min_value) {
          composition_id = compositions[i].id as number;

          break;
        }

      if (!composition_id) {
        notificate({
          title: "Aviso",
          message: `Não foi encontrada uma composição válida para o plano ${plan.name}`,
          type: "warning",
        });

        throw new Error("Composition is not valid");
      }

      if (!fixedPlan)
        fixedPlan = (
          await PlanService.store({
            ...plan,
            base_monthly_benefit,
            composition_id,
          } as Plan)
        ).data;
      else if (
        fixedPlan.name !== plan.name ||
        fixedPlan.download !== plan.download ||
        fixedPlan.upload !== plan.upload ||
        fixedPlan.base_monthly_price !== plan.base_monthly_price ||
        (fixedPlan.base_monthly_benefit &&
          fixedPlan.base_monthly_benefit !== base_monthly_benefit) ||
        fixedPlan.composition_id !== composition_id
      )
        fixedPlan = (
          await PlanService.update(Number(fixedPlan.id), {
            name: plan.name,
            download: plan.download,
            upload: plan.upload,
            base_monthly_benefit,
            composition_id,
          } as Plan)
        ).data;

      return fixedPlan;
    },
    []
  );

  const fixContract = useCallback(
    async (
      {
        city,
        plan,
        monthly_price,
        accession_date,
        system,
        ...data
      }: SystemContract,
      compositions: Composition[],
      currentContract?: Contract
    ) => {
      const ajustment = (await AjustmentService.getMainAjustment()).data;

      if (currentContract) {
        const lastRenew = (
          await RenewService.index({
            contract_id: currentContract.id,
            order_by: "created_at",
            order_basis: "DESC",
          })
        ).data[0];

        const lastUpdate = new Date(
          lastRenew?.created_at || currentContract.created_at || ""
        );

        const diferrenceInDays = differenceInDays(new Date(), lastUpdate);

        if (diferrenceInDays >= ajustment.max_fix_time) {
          if (!userPermissions?.contract.fix.after_limit_date) {
            notificate({
              title: "Aviso",
              message:
                "O tempo para ajustar o contrato se excedeu! Se for o caso realize uma renovação, caso contrário contate a T.I",
              type: "warning",
            });

            throw new Error("Max fix time not aceptable");
          } else
            notificate({
              title: "Atenção",
              message: `O contrato está sendo ajustado após o limite permitido`,
              type: "info",
            });
        }
      }

      const contractCity = (await CityService.index({ ibge: city.ibge }))
        .data[0];

      if (!contractCity) {
        notificate({
          title: "Aviso",
          message: `A cidade ${city.name} não está cadastrada na plataforma`,
          type: "warning",
        });

        throw new Error("City not found");
      }

      var contractPlan = await fixPlan(
        currentContract?.plan && currentContract.plan.id !== 1
          ? (currentContract.plan as SystemPlan)
          : plan,
        compositions,
        ajustment.monthly_benefit
      );

      if (currentContract) {
        currentContract = {
          ...currentContract,
          ...data,
          monthly_price: contractPlan.base_monthly_price,
          plan_id: Number(contractPlan.id),
        };

        if (
          currentContract.plan?.id !== 1 &&
          plan.plan_number !== currentContract.plan?.plan_number
        )
          notificate({
            title: "Atenção",
            message: "O plano de internet não será ajustado!",
            type: "info",
          });
      } else {
        if (data.canceled) {
          notificate({
            title: "Aviso",
            message: `Este contrato já foi cancelado no ${system.short_name}!`,
            type: "warning",
            duration: 10000,
          });

          throw new Error("Contract already canceled in system");
        }

        currentContract = {
          ...data,
          accession_date:
            differenceInMonths(new Date(), new Date(accession_date)) >= 1
              ? new Date(accession_date)
              : new Date(),
          free_installation_tax: true,
          monthly_price,
          month_amount: data.legal_person
            ? ajustment.legal_month_amount
            : ajustment.month_amount,
          plan_id: Number(contractPlan.id),
        } as Contract;
      }

      currentContract = new Contract({
        ...currentContract,
        monthly_benefit: contractPlan.base_monthly_benefit,
        city_id: Number(contractCity.id),
      });

      return { contract: currentContract, plan: contractPlan, system };
    },
    [fixPlan, userPermissions]
  );

  async function getData(
    system: System,
    systemContractParams: SystemContractParams,
    contractId?: number
  ) {
    const systemContract = (
      await SystemService.getSystemContract(system, systemContractParams)
    ).data;
    const contractTypes = (
      await ContractTypeService.index({ active: 1, order_by: "name" })
    ).data;
    const installationTaxes = (
      await InstallationTaxService.index({ order_by: "name" })
    ).data;
    const compositions = (
      await CompositionService.index({
        active: 1,
        order_by: "min_value",
        order_basis: "DESC",
      })
    ).data;

    var contract: Contract | undefined;

    if (contractId) contract = (await ContractService.show(contractId)).data;
    else {
      const contractExists = (
        await ContractService.index({
          client_number: systemContract.client_number,
          contract_number: systemContract.contract_number,
        })
      ).data;

      if (contractExists.total > 0) {
        notificate({
          title: "Aviso",
          message: "Este contrato já foi importado",
          type: "warning",
        });
        throw new Error("Contract already imported");
      }
    }

    return {
      systemContract,
      contract,
      contractTypes,
      installationTaxes,
      compositions,
    };
  }

  function refresh() {
    setContract({} as Contract);

    if (system && contractParams) {
      setIsLoading(true);

      getData(system, contractParams, contractId)
        .then((response) => {
          setContractTypes(response.contractTypes);
          setInstallationTaxes(response.installationTaxes);

          fixContract(
            response.systemContract,
            response.compositions,
            response.contract
          )
            .then((response) => {
              setSelectedPlan(response.plan);
              setContract(response.contract);
              setSelectedSystem(response.system);
            })
            .catch((err) => {
              if (err.response?.status)
                notificate({
                  title: `Erro ${err.response.status || ""}`,
                  message: "Ocorreu um erro ao ajustar o contrato",
                  type: "danger",
                });

              handleClose();

              console.log(err);
            })
            .finally(() => setIsLoading(false));
        })
        .catch((err) => {
          if (err.response?.status === 404)
            notificate({
              title: "Aviso",
              message: "O contrato não foi encontrado",
              type: "warning",
            });
          else if (err.response?.status)
            notificate({
              title: `Erro ${err.response.status || ""}`,
              message: "Ocorreu um erro ao carregar o contrato",
              type: "danger",
            });

          handleClose();

          setIsLoading(false);
          handleClose(false);

          console.log(err);
        });
    } else handleClose();
  }

  useEffect(() => {
    if (contract.accession_date) {
      const accession_date = new Date(contract.accession_date);
      const conclusion_date = accession_date;

      conclusion_date.setDate(contract.expiration_day);
      conclusion_date.setMonth(
        accession_date.getMonth() + Number(contract.month_amount)
      );

      setContract((prev) => ({ ...prev, conclusion_date }));
    }
  }, [
    contract.accession_date,
    contract.expiration_day,
    contract.month_amount,
    setContract,
  ]);

  useEffect(() => {
    if (open && contract.canceled && !isLoading) handleClose(true);
  }, [open, contract.canceled, handleClose, isLoading]);

  useEffect(() => {
    if (open) refresh();
  }, [open, contractId, system, contractParams, setContract, setSelectedPlan]);

  return (
    <ConfirmDialog
      open={open}
      title={`${contractId ? "Ajustar" : "Importar"} contrato`}
      okLabel="Salvar"
      cancelLabel="Voltar"
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      okButtonProps={{
        disabled:
          isLoading ||
          !contract.contract_type_id ||
          !contract.installation_tax_id ||
          !String(contract.installation_tax_value),
      }}
      {...props}
    >
      <Container>
        {isLoading ? (
          <CircularProgress size={100} className="centralize" />
        ) : (
          <>
            {contractId && (
              <>
                <strong>
                  Contrato sincronizado com o {selectedSystem?.short_name}!
                </strong>

                <Divider />
              </>
            )}

            <div className="contract-data">
              <div>
                <LabelGroup
                  label="Cliente"
                  content={` ${
                    contract.client_number
                      ? `${contract.client_number} (${contract.contract_number})`
                      : contract.contract_number
                  } - ${contract.client}`}
                  icon={<BsPersonLinesFill />}
                />
              </div>

              <div>
                <LabelGroup
                  label="Plano"
                  content={selectedPlan?.name}
                  icon={<MdNetworkCheck />}
                />

                <LabelGroup
                  label="Mensalidade"
                  content={`R$ ${contract?.monthly_price}`}
                  icon={<MdAttachMoney />}
                />
              </div>
            </div>

            <Divider />

            <form>
              <div className="line">
                <SelectFilter
                  label="Tipo de contrato"
                  name="contract_type_id"
                  onChange={handleInputChange}
                  value={contract?.contract_type_id || ""}
                  options={contractTypes}
                  identifierAttr="id"
                  nameAttr="name"
                  autoComplete="off"
                  required
                />

                <KeyboardDatePicker
                  className="short"
                  autoOk
                  disableToolbar
                  autoComplete="off"
                  variant="inline"
                  label="Início do contrato"
                  format="dd/MM/yyyy"
                  name="accession_date"
                  value={contract?.accession_date}
                  onChange={(value) =>
                    handleInputChange({
                      target: { name: "accession_date", value },
                    } as ChangeEvent<{ name?: string; value?: any }>)
                  }
                  required
                />
              </div>

              <div className="line">
                <SelectFilter
                  label="Taxa de instalação"
                  name="installation_tax_id"
                  onChange={handleInputChange}
                  value={contract.installation_tax_id || ""}
                  options={installationTaxes}
                  identifierAttr="id"
                  nameAttr="name"
                  autoComplete="off"
                  required
                />

                <TextField
                  className="short"
                  label="Valor (R$)"
                  name="installation_tax_value"
                  value={contract.installation_tax_value || ""}
                  onChange={(ev) => {
                    ev.target.value =
                      Number(ev.target.value) < 0 ? "0" : ev.target.value;

                    handleInputChange(ev);
                  }}
                  InputProps={{
                    readOnly: !userPermissions?.contract.import.edit_tax_value,
                  }}
                  required
                  type="number"
                  autoComplete="off"
                />

                <div className="short">
                  <SwitchToggle
                    label="Isento"
                    name="free_installation_tax"
                    value={contract.free_installation_tax}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <TextField
                label="Observação do contrato (opcional)"
                variant="outlined"
                name="note"
                value={contract.note || ""}
                onChange={handleInputChange}
                multiline
                autoComplete="off"
              />
            </form>

            {contractId && (
              <>
                <Divider />

                <span>*Obs: Clique em "SALVAR" para aplicar as alterações</span>
              </>
            )}
          </>
        )}
      </Container>
    </ConfirmDialog>
  );
};

export default memo(FixContractDialog);
