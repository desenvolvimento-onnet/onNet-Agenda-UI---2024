import React, { ChangeEvent, useCallback, useEffect, useState } from "react";

import { CircularProgress, TextField } from "@material-ui/core";
import { MdBlock, MdCheck, MdEdit } from "react-icons/md";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
} from "react-icons/io5";

import { notificate } from "../../../global/notificate";
import { Table, TBody, Td, Th, THead } from "../../../components/Table";

import ConfirmDialog from "../../../components/ConfirmDialog";
import MessageInfo from "../../../components/MessageInfo";
import Plan from "../../../models/Plan";
import PlanService from "../../../services/PlanService";
import Pagination from "../../../models/Pagination";
import Button from "../../../components/Button";
import PaginateFooter from "../../../components/PaginateFooter";

import { Container, DialogContainer } from "./styles";
import Composition from "../../../models/Composition";
import CompositionService from "../../../services/CompositionService";
import SelectFilter from "../../../components/SelectFilter";
import Divider from "../../../components/Divider";
import SettingsChildren from "../SettingsChildren";
import { useMemo } from "react";
import { padronize } from "../../../global/globalFunctions";

const Plans: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [dialogOpened, setDialogOpened] = useState<number | null>(null);
  const [dialogIsLoading, setDialogIsLoading] = useState<boolean>(false);

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState<Plan>({} as Plan);

  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [plans, setPlans] = useState<Pagination<Plan>>();

  const plansFiltered = useMemo(() => {
    const value = padronize(query);

    const data =
      plans?.data.filter(
        (plan) =>
          padronize(plan.name).indexOf(value) > -1 ||
          padronize(plan.download).indexOf(value) > -1 ||
          plan.base_monthly_price.toString().indexOf(value) > -1
      ) || [];

    return { ...plans, data };
  }, [plans, query]);

  async function getData(query: string, page: number, per_page: number) {
    const compositions = (
      await CompositionService.index({ order_by: "name", active: 1 })
    ).data.map((composition) => {
      if (composition.min_value > 0)
        composition.name += ` (Mín.: R$ ${composition.min_value.toFixed(2)})`;

      return composition;
    });

    const plans = (
      await PlanService.index({
        query,
        page,
        per_page,
        order_by: "created_at",
        order_basis: "DESC",
      })
    ).data;

    return { plans, compositions };
  }

  async function onSubmit(plan: Plan, id?: number) {
    if (
      !id &&
      (!plan.name ||
        !plan.download ||
        !plan.upload ||
        !plan.base_monthly_price ||
        !plan.base_monthly_benefit ||
        !plan.composition_id)
    ) {
      notificate({
        title: "Atenção",
        message: "Preencha todos os campos!",
        type: "info",
      });

      throw new Error("Missing data form");
    }

    const composition = compositions.find(
      (composition) => composition.id == plan.composition_id
    );

    if (!composition) {
      notificate({
        title: "Aviso",
        message: "Ocorreu um erro ao carregar a composição!",
        type: "info",
      });

      throw new Error("Composition not found");
    }

    if (plan.base_monthly_price < composition.min_value) {
      notificate({
        title: "Aviso",
        message:
          "Composição inválida! Valor do plano menor que o permitido na composição.",
        type: "info",
      });

      throw new Error("Composition not found");
    }

    if (id) await PlanService.update(id, { ...plan });
    else await PlanService.store(plan);
  }

  async function onInactivatePlan(id: number, active: boolean) {
    await PlanService.update(id, { active } as Plan);
  }

  function refresh(page?: number, perPage?: number) {
    setIsLoading(true);

    getData(query, page || 1, perPage || 20)
      .then((response) => {
        setCompositions(response.compositions);
        setPlans(response.plans);
      })
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar os planos",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  function submitDialog() {
    setDialogIsLoading(true);

    onSubmit(planForm, selectedPlan?.id)
      .then(() => {
        setDialogOpened(null);
        refresh(1, plans?.perPage);
      })
      .catch((err) => {
        if (err.response?.status === 409)
          notificate({
            title: "Aviso",
            message: "Este plano já está cadastrado",
            type: "warning",
          });
        else if (err.response?.status)
          notificate({
            title: `Erro ${err.response?.status || ""}`,
            message: "Ocorreu um erro ao salvar os dados",
            type: "danger",
          });

        console.log(err);
      })
      .finally(() => setDialogIsLoading(false));
  }

  function inactivateDialog() {
    setDialogIsLoading(true);

    onInactivatePlan(Number(selectedPlan?.id), !Boolean(selectedPlan?.active))
      .then(() => {
        setDialogOpened(null);
        refresh(plans?.page, plans?.perPage);
      })
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao tentar ativar/inativar o plano",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setDialogIsLoading(false));
  }

  const handleFormInputChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement | { name?: string; value: any }>) => {
      var { name, value } = ev.target;

      setPlanForm((prev) => ({ ...prev, [name || ""]: value }));
    },
    [setPlanForm]
  );

  const handleDialogOpen = useCallback(
    (index: number, planId?: number) => {
      setPlanForm({} as Plan);
      setDialogOpened(index);

      if (planId) {
        setDialogIsLoading(true);

        PlanService.show(planId)
          .then((response) => {
            const { composition, ...plan } = response.data;

            if (
              composition &&
              !compositions.some((comp) => comp.id == composition.id)
            )
              setCompositions((prev) => [...prev, composition]);

            setSelectedPlan(plan);
            setPlanForm(plan);
          })
          .catch((err) => {
            if (err.response?.status === 404)
              notificate({
                title: "Aviso",
                message: "Este plano não foi encontrado",
                type: "warning",
              });
            else
              notificate({
                title: `Erro ${err.response?.status || ""}`,
                message: "Ocorreu um erro ao carregar o plano",
                type: "danger",
              });

            setDialogOpened(null);

            console.log(err);
          })
          .finally(() => setDialogIsLoading(false));
      } else setSelectedPlan(null);
    },
    [setDialogIsLoading, setSelectedPlan, setPlanForm, compositions]
  );

  const handleDialogClose = useCallback(
    (success: boolean) => {
      if (success) {
        if (dialogOpened === 1) submitDialog();
        if (dialogOpened === 2) inactivateDialog();
      } else {
        setCompositions((prev) => prev.filter((comp) => comp.active));
        setDialogOpened(null);
      }
    },
    [planForm, selectedPlan]
  );

  useEffect(() => {
    refresh();
  }, []);

  return (
    <>
      <SettingsChildren
        inputProps={{
          value: query,
          onChange: useCallback((ev) => setQuery(ev.target.value), [setQuery]),
          disabled: !plans,
        }}
        onFilterSubmit={() => refresh(1, plans?.perPage)}
        onAddClick={() => handleDialogOpen(1)}
      >
        <Container>
          {isLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : plans ? (
            plans.data.length ? (
              <>
                <Table>
                  <THead>
                    <tr>
                      <Th short>ID</Th>
                      <Th>Plano</Th>
                      <Th>Download</Th>
                      <Th>Upload</Th>
                      <Th>Status</Th>
                      <Th>Mensalidade</Th>
                      <Th>Benefício</Th>
                      <Th>Composição</Th>
                      <Th>Sistema</Th>
                      <Th></Th>
                      <Th></Th>
                    </tr>
                  </THead>
                  <TBody>
                    {plansFiltered.data.map((plan) => (
                      <tr key={plan.id}>
                        <Td>{plan.id} </Td>
                        <Td>{plan.name}</Td>
                        <Td>{plan.download}</Td>
                        <Td>{plan.upload}</Td>
                        {Boolean(plan.active) ? (
                          <Td
                            style={{
                              background: "var(--success)",
                              color: "var(--white)",
                            }}
                          >
                            Ativo
                          </Td>
                        ) : (
                          <Td
                            style={{
                              background: "var(--danger)",
                              color: "var(--white)",
                            }}
                          >
                            Inativo
                          </Td>
                        )}
                        <Td>R$ {Number(plan.base_monthly_price).toFixed(2)}</Td>
                        <Td>
                          R$ {Number(plan.base_monthly_benefit).toFixed(2)}
                        </Td>
                        <Td>{plan.composition?.name}</Td>
                        <Td>{plan.system?.name}</Td>
                        <Td noBackground short>
                          <Button
                            title="Editar"
                            className="centralize"
                            icon={<MdEdit />}
                            background={"var(--info)"}
                            onClick={() => handleDialogOpen(1, plan.id)}
                          />
                        </Td>
                        <Td noBackground short>
                          {Boolean(plan.active) ? (
                            <Button
                              title="Inativar"
                              className="centralize"
                              icon={<MdBlock />}
                              background="var(--danger)"
                              onClick={() => handleDialogOpen(2, plan.id)}
                            />
                          ) : (
                            <Button
                              title="Ativar"
                              className="centralize"
                              icon={<MdCheck />}
                              background="var(--primary)"
                              onClick={() => handleDialogOpen(2, plan.id)}
                            />
                          )}
                        </Td>
                      </tr>
                    ))}
                  </TBody>
                </Table>

                <PaginateFooter pagination={{ ...plans }} onReload={refresh} />
              </>
            ) : (
              <MessageInfo>Nenhum plano encontrado</MessageInfo>
            )
          ) : (
            <MessageInfo>Não foi possível carregar os planos</MessageInfo>
          )}
        </Container>
      </SettingsChildren>

      {/* Add plan dialog - INDEX 1*/}
      <ConfirmDialog
        title={`${selectedPlan?.id ? "Editar" : "Adicionar"} Plano`}
        okLabel="Salvar"
        okButtonProps={{ disabled: dialogIsLoading }}
        open={dialogOpened === 1}
        onClose={handleDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogContainer>
          {dialogIsLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : (
            <form
              onSubmit={(ev) => {
                ev.preventDefault();

                handleDialogClose(true);
              }}
            >
              <div className="line">
                <TextField
                  label="Nome"
                  variant="outlined"
                  name="name"
                  value={planForm.name || selectedPlan?.name || ""}
                  onChange={handleFormInputChange}
                  required
                />
              </div>

              <Divider />

              <div className="line">
                <TextField
                  label="Vel. Download"
                  variant="outlined"
                  name="download"
                  value={planForm.download || selectedPlan?.download || ""}
                  onChange={handleFormInputChange}
                  required
                />

                <TextField
                  label="Vel. Upload"
                  variant="outlined"
                  name="upload"
                  value={planForm.upload || selectedPlan?.upload || ""}
                  onChange={handleFormInputChange}
                  required
                />
              </div>

              <div className="line">
                <TextField
                  label="Mensalidade (R$)"
                  variant="outlined"
                  type="number"
                  name="base_monthly_price"
                  value={
                    planForm.base_monthly_price ||
                    selectedPlan?.base_monthly_price ||
                    ""
                  }
                  onChange={handleFormInputChange}
                  required
                />

                <TextField
                  label="Benefício (R$)"
                  variant="outlined"
                  type="number"
                  name="base_monthly_benefit"
                  value={
                    planForm.base_monthly_benefit ||
                    selectedPlan?.base_monthly_benefit ||
                    ""
                  }
                  onChange={handleFormInputChange}
                  required
                />
              </div>

              <Divider />

              <div className="line">
                <SelectFilter
                  label="Composição"
                  nameAttr="name"
                  options={compositions}
                  identifierAttr="id"
                  name="composition_id"
                  value={
                    planForm.composition_id ||
                    selectedPlan?.composition_id ||
                    ""
                  }
                  onChange={handleFormInputChange}
                  required
                />
              </div>
            </form>
          )}
        </DialogContainer>
      </ConfirmDialog>

      {/* Inactivate plan dialog - INDEX 2 */}
      <ConfirmDialog
        title={`${selectedPlan?.active ? "Inativar" : "Ativar"} Plano`}
        open={dialogOpened === 2}
        onClose={handleDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogContainer>
          {dialogIsLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : (
            <div className="alert">
              {selectedPlan?.active ? (
                <IoCloseCircleOutline size={75} color="var(--danger)" />
              ) : (
                <IoCheckmarkCircleOutline size={75} color="var(--success)" />
              )}

              <h2>Deseja continuar?</h2>

              <div>
                <p>
                  Tem certeza que deseja{" "}
                  {selectedPlan?.active ? (
                    <strong>INATIVAR</strong>
                  ) : (
                    <strong>ATIVAR</strong>
                  )}{" "}
                  o plano
                </p>
              </div>

              <strong>{selectedPlan?.name}</strong>
            </div>
          )}
        </DialogContainer>
      </ConfirmDialog>
    </>
  );
};

export default Plans;
