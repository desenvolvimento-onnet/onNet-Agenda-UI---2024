import React, {
  ChangeEvent,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { CircularProgress, DialogProps, TextField } from "@material-ui/core";
import { BsPersonLinesFill } from "react-icons/bs";
import { KeyboardDatePicker } from "@material-ui/pickers";
import { differenceInDays, format } from "date-fns";

import { CloseStatus } from "../context";
import { notificate } from "../../../../global/notificate";
import { AuthContext } from "../../../../global/context/AuthContext";
import {
  Plan as SystemPlan,
  Contract as SystemContract,
} from "../../../../models/System";

import SystemService from "../../../../services/SystemService";
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
import Renew from "../../../../models/Renew";
import RenewService from "../../../../services/RenewService";
import Pagination from "../../../../models/Pagination";
import KeyTemplate from "../../../../models/KeyTemplate";

import { Container } from "./styles";
import Composition from "../../../../models/Composition";
import CompositionService from "../../../../services/CompositionService";
import AjustmentService from "../../../../services/AjustmentService";
import System from "../../../../models/System";

interface RenewContractDialogProps extends DialogProps {
  index: number;
  open: boolean;
  contractId?: number;
  onClose: (options: CloseStatus) => void;
}

const RenewContractDialog: React.FC<RenewContractDialogProps> = ({
  index,
  open,
  onClose,
  contractId,
  ...props
}) => {
  const { userPermissions } = useContext(AuthContext);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [plans, setPlans] = useState<Pagination<Plan>>();

  const [plan, setPlan] = useState<Plan>();
  const [contract, setContract] = useState<Contract>({} as Contract);
  const [olderContract, setOlderContract] = useState<Contract>();
  const [renew, setRenew] = useState<Renew>({} as Renew);

  useEffect(() => {
    if (open && !userPermissions?.contract.renew.allow) {
      notificate({
        title: "Erro",
        message: "Você não tem permissão para renovar o contrato",
        type: "danger",
      });

      onClose({ index, success: false });
    }
  }, [open, userPermissions]);

  const onSubmit = useCallback(
    async (form: Renew, fixedContract: Contract) => {
      if (!fixedContract.contract_type_id) {
        notificate({
          title: "Atenção",
          message: "Insira o tipo de contrato",
          type: "info",
        });

        throw new Error("Missing contract_type");
      }

      if (!form.new_accession_date) {
        notificate({
          title: "Atenção",
          message: "Insira a data de assinatura",
          type: "info",
        });

        throw new Error("Missing new_accession_date");
      }

      const plan = plans?.data.find((plan) => form.new_plan_id === plan.id);

      if (
        form.new_monthly_price &&
        form.new_monthly_price < (plan?.composition?.min_value || 0)
      ) {
        notificate({
          title: "Atenção",
          message: `O valor mínimo de renovação desse plano é R$ ${(
            plan?.composition?.min_value || 0
          ).toFixed(2)}`,
          type: "info",
        });

        throw new Error("monthly price not permited");
      }

      fixedContract.birthday_foundation = format(
        new Date(fixedContract.birthday_foundation || ""),
        "yyyy-MM-dd 00:00:00"
      );

      fixedContract.accession_date = format(
        new Date(fixedContract.accession_date || ""),
        "yyyy-MM-dd 00:00:00"
      );

      fixedContract.conclusion_date = format(
        new Date(fixedContract.conclusion_date || ""),
        "yyyy-MM-dd 00:00:00"
      );

      form.new_accession_date = format(
        new Date(form.new_accession_date || ""),
        "yyyy-MM-dd 00:00:00"
      );

      form.new_conclusion_date = format(
        new Date(form.new_conclusion_date || ""),
        "yyyy-MM-dd 00:00:00"
      );

      await RenewService.store(form, fixedContract);
    },
    [plans]
  );

  const handleContractInputChange = useCallback(
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

      setContract((prev) => ({
        ...prev,
        [name || ""]: switchButton.includes(name as keyof Contract)
          ? checked
          : value,
      }));
    },
    [setContract]
  );

  const handleInputChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement | { name?: string; value?: any }>) => {
      const { name, value } = ev.target;

      setRenew((prev) => ({ ...prev, [name || ""]: value }));
    },
    [setRenew]
  );

  const handleClose = useCallback(
    (success?: boolean) => {
      if (success && contract) {
        setIsLoading(true);

        onSubmit(renew, contract)
          .then(() => {
            notificate({
              title: "Sucesso",
              message: "Contrato renovado com sucesso!",
              type: "success",
            });

            onClose({ index, success });
          })
          .catch((err) => {
            if (err.response?.status)
              notificate({
                title: `Erro ${err.response.status || ""}`,
                message: "Ocorreu um erro ao renovar o contrato",
                type: "danger",
              });

            console.log(err);
          })
          .finally(() => setIsLoading(false));
      } else onClose({ index, success });
    },
    [onClose, index, onSubmit, contract, renew]
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
      { plan, city, monthly_price, ...data }: SystemContract,
      compositions: Composition[],
      currentContract: Contract
    ) => {
      const ajustment = (await AjustmentService.getMainAjustment()).data;
      const lastRenew = (
        await RenewService.index({
          contract_id: currentContract.id,
          order_by: "created_at",
          order_basis: "DESC",
        })
      ).data[0];

      const lastUpdate = new Date(
        lastRenew?.new_accession_date || currentContract.accession_date || ""
      );

      const dateDiferrence = differenceInDays(new Date(), lastUpdate);

      if (dateDiferrence < ajustment.min_renew_time) {
        if (!userPermissions?.contract.renew.before_min_date) {
          notificate({
            title: "Aviso",
            message: `O contrato só poderá ser renovado após ${
              ajustment.min_renew_time - dateDiferrence
            } dia(s)`,
            type: "warning",
          });

          throw new Error("Min renew time not aceptable");
        } else
          notificate({
            title: "Atenção",
            message: `O contrato está sendo renovado ${
              ajustment.min_renew_time - dateDiferrence
            } dia(s) antes do permitido`,
            type: "info",
          });
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

      const contractPlan = await fixPlan(
        plan,
        compositions,
        ajustment.monthly_benefit
      );

      if (
        Number(currentContract.plan?.plan_number) ===
          Number(contractPlan.plan_number) &&
        currentContract.monthly_price === monthly_price &&
        currentContract.monthly_benefit === contractPlan.base_monthly_benefit
      )
        notificate({
          title: "Atenção",
          message:
            "Não houve alteração no plano e mensalidade. A renovação será apenas da fidelidade!",
          type: "info",
          duration: 10000,
        });

      const renew = {
        contract_id: Number(currentContract.id),
        new_accession_date: new Date(),
        new_plan_id: Number(contractPlan.id),
        new_monthly_price: monthly_price,
        new_monthly_benefit: contractPlan.base_monthly_benefit,
      } as Renew;

      const fixedContract = new Contract({
        ...currentContract,
        ...data,
        city_id: Number(contractCity.id),
        month_amount: data.legal_person
          ? ajustment.legal_month_amount
          : ajustment.month_amount,
      });

      return { renew, plan: contractPlan, fixedContract };
    },
    [fixPlan, userPermissions]
  );

  const refreshPlans = useCallback(
    (page?: number, per_page?: number, query?: string) => {
      PlanService.index({ order_by: "name", page, per_page, query })
        .then((response) => {
          if (!response.data.data.some((item) => item.id == plan?.id) && plan)
            response.data.data.push(plan);

          setPlans(response.data);
        })
        .catch((err) => {
          if (err.response?.status)
            notificate({
              title: `Erro ${err.response.status || ""}`,
              message: "Ocorreu um erro ao carregar os planos",
              type: "danger",
            });

          console.log(err);
        });
    },
    [setPlans, plan]
  );

  async function getData(contractId: number) {
    const contract = (await ContractService.show(contractId)).data;
    const systemContract = (
      await SystemService.getSystemContract(contract.system as System, {
        client_number: contract.client_number,
        contract_number: contract.contract_number,
      })
    ).data;

    if (systemContract.canceled) {
      notificate({
        title: "Erro",
        message: `Este contrato já foi cancelado no ${contract.system?.short_name}!`,
        type: "danger",
      });

      throw new Error("System Contract is canceled");
    }

    const plans = (
      await PlanService.index({
        order_by: "name",
        page: 1,
        per_page: 20,
      })
    ).data;

    const contractTypes = (
      await ContractTypeService.index({ active: 1, order_by: "name" })
    ).data;

    const compositions = (
      await CompositionService.index({
        active: 1,
        order_by: "min_value",
        order_basis: "DESC",
      })
    ).data;

    return { systemContract, contract, plans, contractTypes, compositions };
  }

  function refresh() {
    setRenew({} as Renew);
    setContract({} as Contract);
    setOlderContract(undefined);
    setPlan(undefined);

    setIsLoading(true);

    getData(Number(contractId))
      .then(({ plans, ...response }) => {
        setContractTypes(response.contractTypes);
        setOlderContract(response.contract);

        fixContract(
          response.systemContract,
          response.compositions,
          response.contract
        )
          .then((response) => {
            setPlan(response.plan);
            setContract(response.fixedContract);
            setRenew((prev) => ({ ...prev, ...response.renew }));

            if (!plans.data.some((plan) => plan.id === response.plan.id))
              plans.data.push(response.plan);

            setPlans(plans);
          })
          .catch((err) => {
            if (err.response?.status)
              notificate({
                title: `Erro ${err.response.status || ""}`,
                message: "Ocorreu um erro ao renovar o contrato",
                type: "danger",
              });

            handleClose();

            setIsLoading(false);

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
  }

  useEffect(() => {
    if (olderContract && iframeRef.current) {
      const keyTemplate = new KeyTemplate(olderContract);
      const iframe = iframeRef.current;

      const html = `<!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        </head>
        <body>
          ${olderContract.contractType?.template || ""}
        </body>
      </html>`;

      if (iframe.contentDocument) {
        iframe.contentDocument.write(html);

        keyTemplate.parseAll(iframe.contentDocument);

        const print = iframe.contentDocument.body.innerHTML || "";

        setRenew((prev) => ({ ...prev, print }));
      }
    }
  }, [olderContract, iframeRef, setRenew]);

  useEffect(() => {
    const findedPlan =
      plan?.id === renew.new_plan_id
        ? plan
        : plans?.data.find((plan) => plan.id === renew.new_plan_id);

    if (findedPlan)
      setRenew((prev) => ({
        ...prev,
        new_monthly_price: findedPlan.base_monthly_price,
        new_monthly_benefit: findedPlan.base_monthly_benefit,
      }));
  }, [plans, renew.new_plan_id, setRenew, plan]);

  useEffect(() => {
    if (renew.new_accession_date) {
      const accession_date = new Date(renew.new_accession_date);
      const new_conclusion_date = accession_date;

      new_conclusion_date.setDate(contract.expiration_day);
      new_conclusion_date.setMonth(
        accession_date.getMonth() + Number(contract.month_amount)
      );

      setRenew((prev) => ({ ...prev, new_conclusion_date }));
    }
  }, [
    renew.new_accession_date,
    contract.expiration_day,
    contract.month_amount,
    setRenew,
  ]);

  useEffect(() => {
    if (open) refresh();
  }, [open, contractId]);

  return (
    <ConfirmDialog
      open={open}
      title={"Renovar contrato"}
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
      <>
        <Container>
          {isLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : (
            <>
              <div className="contract-data">
                <div>
                  <LabelGroup
                    label="Cliente"
                    content={`${
                      contract.client_number
                        ? `${contract.client_number} (${contract.contract_number})`
                        : contract.contract_number
                    } - ${contract.client}`}
                    icon={<BsPersonLinesFill />}
                  />
                </div>
              </div>

              <Divider />

              <form>
                <div className="line">
                  <SelectFilter
                    label="Tipo de contrato"
                    name="contract_type_id"
                    onChange={handleContractInputChange}
                    value={contract?.contract_type_id || ""}
                    options={contractTypes}
                    identifierAttr="id"
                    nameAttr="name"
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="line">
                  <TextField
                    label="Duração (meses)"
                    name="month_amount"
                    value={contract.month_amount}
                    onChange={(ev) => {
                      ev.target.value =
                        ev.target.value && Number(ev.target.value) < 1
                          ? "1"
                          : ev.target.value;

                      handleContractInputChange(ev);
                    }}
                    InputProps={{
                      readOnly:
                        !userPermissions?.contract.renew.edit_month_amount,
                    }}
                    type="number"
                    required
                  />

                  <KeyboardDatePicker
                    autoOk
                    disableToolbar
                    autoComplete="off"
                    variant="inline"
                    label="Início do contrato"
                    format="dd/MM/yyyy"
                    name="new_accession_date"
                    value={renew?.new_accession_date}
                    onChange={(value) =>
                      handleInputChange({
                        target: { name: "new_accession_date", value },
                      } as ChangeEvent<{ name?: string; value?: any }>)
                    }
                    required
                  />
                </div>

                <div className="line">
                  <SelectFilter
                    label="Plano"
                    name="new_plan_id"
                    onChange={handleInputChange}
                    value={renew.new_plan_id || ""}
                    options={
                      plans?.data.filter(
                        (plan) =>
                          !plan.system_id ||
                          plan.system_id === contract.system_id
                      ) || []
                    }
                    identifierAttr="id"
                    nameAttr="name"
                    autoComplete="off"
                    onSubmitFilter={(query) =>
                      refreshPlans(1, plans?.perPage, query)
                    }
                    readOnly={!userPermissions?.contract.renew.change_plan}
                    required
                  />

                  <TextField
                    className="short"
                    label="Mensalidade"
                    name="new_monthly_price"
                    value={renew.new_monthly_price}
                    type="number"
                    onChange={(ev) => {
                      ev.target.value =
                        Number(ev.target.value) < 0 ? "0" : ev.target.value;

                      handleInputChange(ev);
                    }}
                    InputProps={{
                      readOnly:
                        !userPermissions?.contract.renew.edit_monthly_price,
                    }}
                    required
                  />

                  <TextField
                    className="short"
                    label="Benefício"
                    name="new_monthly_benefit"
                    value={renew.new_monthly_benefit}
                    type="number"
                    onChange={(ev) => {
                      ev.target.value =
                        Number(ev.target.value) < 0 ? "0" : ev.target.value;

                      handleInputChange(ev);
                    }}
                    InputProps={{
                      readOnly:
                        !userPermissions?.contract.renew.edit_monthly_benefit,
                    }}
                    required
                  />
                </div>
              </form>
            </>
          )}
        </Container>

        <iframe ref={iframeRef} frameBorder={0} height={0} width={0} />
      </>
    </ConfirmDialog>
  );
};

export default memo(RenewContractDialog);
