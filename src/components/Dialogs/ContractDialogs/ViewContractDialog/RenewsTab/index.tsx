import { useCallback, useContext, useState } from "react";

import {
  Accordion,
  AccordionSummary,
  CircularProgress,
} from "@material-ui/core";
import { MdExpandMore } from "react-icons/md";
import { BsPersonCheck } from "react-icons/bs";
import { FiPrinter } from "react-icons/fi";
import { IoCloseCircleOutline } from "react-icons/io5";
import { ptBR } from "date-fns/locale";

import format from "date-fns/format";

import { notificate } from "../../../../../global/notificate";
import { Container as DialogContainer } from "../../DeleteContractDialog/styles";

import TabBar, { TabBarProps } from "../TabBar";
import Contract from "../../../../../models/Contract";
import LabelGroup from "../../../../LabelGroup";
import Divider from "../../../../Divider";
import Button from "../../../../Button";
import ConfirmDialog from "../../../../ConfirmDialog";
import RenewService from "../../../../../services/RenewService";
import { AuthContext } from "../../../../../global/context/AuthContext";

export interface RenewsTabProps extends Omit<TabBarProps, "children"> {
  contract: Contract;
  onRefresh?: () => void;
}

const RenewsTab: React.FC<RenewsTabProps> = ({
  contract,
  onRefresh,
  ...props
}) => {
  const { userPermissions } = useContext(AuthContext);

  const [dialogIsOpened, setDialogIsOpened] = useState<boolean>(false);
  const [dialogIsLoading, setDialogIsLoading] = useState<boolean>(false);
  const [selectedRenew, setSelectedRenew] = useState<number>();

  const handleDialogOpen = useCallback((renewId: number) => {
    setSelectedRenew(renewId);
    setDialogIsOpened(true);
  }, []);

  const handleDialogClose = useCallback(
    (success) => {
      if (success && selectedRenew) {
        setDialogIsLoading(true);

        RenewService.delete(selectedRenew)
          .then(() => {
            setDialogIsLoading(false);
            onRefresh && onRefresh();

            notificate({
              title: "Sucesso",
              message: "Renovação removida com sucesso!",
              type: "success",
            });
          })
          .catch((err) => {
            notificate({
              title: `Erro ${err.response?.status}`,
              message: "Ocorreu um erro ao remover a renovação",
              type: "danger",
            });

            console.log(err);
          })
          .finally(() => setDialogIsLoading(false));
      } else {
        setSelectedRenew(undefined);
        setDialogIsOpened(false);
      }
    },
    [selectedRenew]
  );

  const handlePrint = useCallback((print: string) => {
    const template = `<!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      </head>
      <body>
        ${print}
      </body>
    </html>`;

    const blob = new Blob([template], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.setAttribute("href", url);
    a.setAttribute("target", "_blank");
    a.click();
    a.remove();
  }, []);

  return (
    <>
      <TabBar {...props}>
        {contract.renews?.map((renew, i) => (
          <Accordion key={renew.id} className="accordion-container">
            <AccordionSummary expandIcon={<MdExpandMore />}>
              <div className="header spaced">
                <h3>{renew.user?.short_name}</h3>

                <p>
                  {format(
                    new Date(renew.created_at || ""),
                    "dd/MM/yyyy 'às' HH:mm'h'",
                    { locale: ptBR }
                  )}
                </p>
              </div>
            </AccordionSummary>

            <section className="accordion">
              <fieldset className="line">
                <legend>Antes</legend>

                {renew.oldPlan && (
                  <LabelGroup
                    className="large"
                    label="Plano"
                    content={renew.oldPlan.name}
                  />
                )}

                {renew.old_monthly_price?.toString() && (
                  <LabelGroup
                    className="center"
                    label="Mensalidade"
                    content={`R$ ${renew.old_monthly_price.toFixed(2)}`}
                  />
                )}

                {renew.old_monthly_benefit?.toString() && (
                  <LabelGroup
                    className="center"
                    label="Benefício"
                    content={`R$ ${renew.old_monthly_benefit.toFixed(2)}`}
                  />
                )}

                <LabelGroup
                  className="end"
                  label="Duração do contrato"
                  content={
                    <>
                      <p>
                        Início:{" "}
                        <strong>
                          {format(
                            new Date(renew.old_accession_date || ""),
                            "dd/MM/yyyy"
                          )}
                        </strong>
                      </p>
                      <p>
                        Fim:{" "}
                        <strong>
                          {format(
                            new Date(renew.old_conclusion_date || ""),
                            "dd/MM/yyyy"
                          )}
                        </strong>
                      </p>
                    </>
                  }
                />
              </fieldset>

              <fieldset className="line detach">
                <legend>Depois</legend>

                {renew.newPlan && (
                  <LabelGroup
                    className="large"
                    label="Plano"
                    content={renew.newPlan.name}
                  />
                )}

                {renew.new_monthly_price?.toString() && (
                  <LabelGroup
                    className="center"
                    label="Mensalidade"
                    content={`R$ ${renew.new_monthly_price.toFixed(2)}`}
                  />
                )}

                {renew.new_monthly_benefit?.toString() && (
                  <LabelGroup
                    className="center"
                    label="Benefício"
                    content={`R$ ${renew.new_monthly_benefit.toFixed(2)}`}
                  />
                )}

                <LabelGroup
                  className="end"
                  label="Duração do contrato"
                  content={
                    <>
                      <p>
                        Início:{" "}
                        <strong>
                          {format(
                            new Date(renew.new_accession_date || ""),
                            "dd/MM/yyyy"
                          )}
                        </strong>
                      </p>
                      <p>
                        Fim:{" "}
                        <strong>
                          {format(
                            new Date(renew.new_conclusion_date || ""),
                            "dd/MM/yyyy"
                          )}
                        </strong>
                      </p>
                    </>
                  }
                />
              </fieldset>

              <Divider />

              <div className="line">
                <LabelGroup
                  label="Usuário de renovação"
                  content={renew.user?.short_name}
                  icon={<BsPersonCheck />}
                />

                {userPermissions?.contract.delete_renew && (
                  <Button
                    title="Reverter renovação"
                    background="var(--danger)"
                    disabled={i !== 0}
                    onClick={() => handleDialogOpen(Number(renew.id))}
                  >
                    Excluir
                  </Button>
                )}

                <Button
                  className="print-button"
                  title="Imprimir versão antiga"
                  background="var(--white)"
                  icon={<FiPrinter />}
                  onClick={() => handlePrint(renew.print)}
                />

                <LabelGroup
                  className="end"
                  label="Data da renovação"
                  content={
                    renew.created_at &&
                    format(
                      new Date(renew.created_at),
                      "dd MMM, yyyy || HH:mm'h'",
                      {
                        locale: ptBR,
                      }
                    )
                  }
                />
              </div>
            </section>
          </Accordion>
        ))}
      </TabBar>

      <ConfirmDialog
        open={dialogIsOpened}
        title="Deletar renovação"
        cancelLabel="Voltar"
        onClose={handleDialogClose}
        fullWidth
        maxWidth="xs"
      >
        <DialogContainer>
          {dialogIsLoading ? (
            <CircularProgress size={100} className="centralize" />
          ) : (
            <>
              <IoCloseCircleOutline size={75} color="var(--danger)" />
              <h2>Confirmar exclusão?</h2>

              <span>
                Esta ação irá reverter o contrato ao estado anterior, mantendo
                algumas das modificações realizadas após a renovação.
              </span>

              <Divider />

              <p>Este processedimento é irreversível!</p>
            </>
          )}
        </DialogContainer>
      </ConfirmDialog>
    </>
  );
};

export default RenewsTab;
