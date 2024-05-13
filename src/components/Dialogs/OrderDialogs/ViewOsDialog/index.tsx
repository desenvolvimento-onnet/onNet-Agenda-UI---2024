import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { BsPersonCheck } from "react-icons/bs";
import { CircularProgress, DialogProps } from "@material-ui/core";
import { ptBR } from "date-fns/locale";

import format from "date-fns/format";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import { CloseStatus } from "../context/index";
import { notificate } from "../../../../global/notificate";
import { AuthContext } from "../../../../global/context/AuthContext";

import ConfirmDialog from "../../../ConfirmDialog";
import OrderService from "../../../../services/OrderService";
import Order from "../../../../models/Order";
import Divider from "../../../Divider";
import MessageInfo from "../../../MessageInfo";
import LabelGroup from "../../../LabelGroup";

import { Container, TabPanel } from "./styles";

interface ViewOsDialogProps extends DialogProps {
  index: number;
  open: boolean;
  orderId?: number;
  onClose: (options: CloseStatus) => void;
}

const ViewOsDialog: React.FC<ViewOsDialogProps> = ({
  index,
  open,
  orderId,
  onClose,
  ...props
}) => {
  const { userPermissions } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tabIndex, setTabIndex] = useState<number>(0);

  const [order, setOrder] = useState<Order>();

  useEffect(() => {
    if (open && !userPermissions?.order.show) {
      notificate({
        title: "Erro",
        message: "Você não tem permissão para visualizar a O.S",
        type: "danger",
      });

      onClose({ index, success: false });
    }
  }, [open, userPermissions]);

  const handleTabChange = useCallback(
    (event: React.ChangeEvent<{}>, index: number) => {
      setTabIndex(index);
    },
    [setTabIndex]
  );

  async function getData(id: number) {
    const order = (await OrderService.show(id)).data;

    return { order };
  }

  function refresh() {
    setOrder(undefined);

    if (!orderId) {
      onClose({ index, success: true });

      return;
    }

    setIsLoading(true);
    setTabIndex(0);

    getData(orderId)
      .then((response) => setOrder(response.order))
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar a O.S",
          type: "danger",
        });

        onClose({ index });

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if (open) refresh();
  }, [open, orderId]);

  return (
    <ConfirmDialog
      open={open}
      title="Visualizar O.S"
      okLabel=""
      cancelLabel="Voltar"
      onClose={() => onClose({ index })}
      maxWidth="md"
      fullWidth
      BackdropProps={{ style: { background: "var(--backdrop)" } }}
      {...props}
    >
      <Container>
        {isLoading ? (
          <CircularProgress size={100} className="centralize" />
        ) : order ? (
          <>
            <AppBar
              position="static"
              color="default"
              style={{ boxShadow: "none", background: "var(--white)" }}
            >
              <Tabs value={tabIndex} onChange={handleTabChange}>
                <Tab label="Info" value={0} />

                {Boolean(order?.rescheduled) && (
                  <Tab
                    label={`Reagendamentos (${Number(
                      order.reschedules?.length
                    )})`}
                    value={1}
                  />
                )}
                {Boolean(order?.canceled) && (
                  <Tab label="Cancelamento" value={2} />
                )}
                {Boolean(order?.closed) && <Tab label="Fechamento" value={3} />}
              </Tabs>
            </AppBar>

            <TabPanel hidden={tabIndex !== 0}>
              <section>
                <div className="line">
                  <LabelGroup label="O.S" content={order?.os} />
                  <LabelGroup
                    className="center"
                    label="Cliente"
                    content={order?.client}
                  />
                  <LabelGroup
                    className="end"
                    label="Tipo de O.S"
                    content={order?.os_type}
                  />
                </div>
              </section>

              <section>
                <div className="line">
                  <LabelGroup label="Turno" content={order?.shift?.name} />
                  <LabelGroup
                    className="center"
                    label="Data"
                    content={
                      order?.date && format(new Date(order?.date), "dd/MM/yyyy")
                    }
                  />
                  <LabelGroup
                    className="end"
                    label="Cidade"
                    content={order?.city?.name}
                  />
                </div>

                {Boolean(order?.note || order?.rural || order.contract_id) && (
                  <div className="line detach">
                    {Boolean(order?.contract_id) && (
                      <LabelGroup
                        label="N° Contrato"
                        content={
                          order?.contract?.client_number
                            ? `${order?.contract?.client_number} (${order?.contract?.contract_number})`
                            : order?.contract?.contract_number
                        }
                      />
                    )}

                    {Boolean(order?.note) && (
                      <LabelGroup label="Observação" content={order?.note} />
                    )}

                    <LabelGroup
                      className="end"
                      label="Rural"
                      content={order?.rural ? "Sim" : "Não"}
                    />
                  </div>
                )}
              </section>

              <Divider />

              <section>
                <div className="line">
                  <LabelGroup
                    label="Usuário de criação"
                    content={order?.user?.short_name}
                    icon={<BsPersonCheck />}
                  />

                  {order.system && (
                    <LabelGroup
                      className="center"
                      label="Sistema de Origem"
                      content={order.system.name}
                    />
                  )}

                  <LabelGroup
                    className="end"
                    label="Data de criação"
                    content={
                      order?.created_at &&
                      format(
                        new Date(order?.created_at),
                        "dd MMM, yyyy || HH:mm'h'",
                        {
                          locale: ptBR,
                        }
                      )
                    }
                  />
                </div>
              </section>
            </TabPanel>

            {Boolean(order.rescheduled) && (
              <TabPanel hidden={tabIndex !== 1}>
                {order.reschedules?.map((reschedule) => (
                  <section key={reschedule.id} className="reschedule">
                    <div className="line">
                      {(reschedule.oldShift || reschedule.newShift) && (
                        <LabelGroup
                          label="Turno"
                          content={
                            <>
                              <p>
                                De: <strong>{reschedule.oldShift?.name}</strong>
                              </p>
                              <p>
                                Para:{" "}
                                <strong>{reschedule.newShift?.name}</strong>
                              </p>
                            </>
                          }
                        />
                      )}

                      {(reschedule.oldCity || reschedule.newCity) && (
                        <LabelGroup
                          label="Cidade"
                          content={
                            <>
                              <p>
                                De: <strong> {reschedule.oldCity?.name}</strong>
                              </p>
                              <p>
                                Para:{" "}
                                <strong> {reschedule.newCity?.name}</strong>
                              </p>
                            </>
                          }
                        />
                      )}

                      {(reschedule.old_date || reschedule.new_date) && (
                        <LabelGroup
                          label="Data"
                          content={
                            <>
                              <p>
                                De:{" "}
                                <strong>
                                  {format(
                                    new Date(reschedule.old_date || ""),
                                    "dd/MM/yyyy"
                                  )}
                                </strong>
                              </p>
                              <p>
                                Para:{" "}
                                <strong>
                                  {format(
                                    new Date(reschedule.new_date || ""),
                                    "dd/MM/yyyy"
                                  )}
                                </strong>
                              </p>
                            </>
                          }
                        />
                      )}
                    </div>

                    <div className="line detach">
                      <LabelGroup label="Motivo" content={reschedule.reason} />
                    </div>

                    <Divider />

                    <div className="line">
                      <LabelGroup
                        label="Usuário de reagendamento"
                        content={reschedule.user?.short_name}
                        icon={<BsPersonCheck />}
                      />

                      <LabelGroup
                        className="end"
                        label="Data de reagendamento"
                        content={
                          reschedule.created_at &&
                          format(
                            new Date(reschedule.created_at),
                            "dd MMM, yyyy || HH:mm'h'",
                            { locale: ptBR }
                          )
                        }
                      />
                    </div>
                  </section>
                ))}
              </TabPanel>
            )}

            {Boolean(order.canceled) && (
              <TabPanel hidden={tabIndex !== 2}>
                <section>
                  <div className="line">
                    <LabelGroup
                      label="Motivo"
                      content={order?.cancellation_reason}
                    />
                  </div>
                </section>

                <Divider />

                <section>
                  <div className="line">
                    <LabelGroup
                      label="Usuário de cancelamento"
                      content={order?.cancellationUser?.short_name}
                      icon={<BsPersonCheck />}
                    />
                    <LabelGroup
                      className="end"
                      label="Data de cancelamento"
                      content={
                        order?.canceled_at &&
                        format(
                          new Date(order?.canceled_at),
                          "dd MMM, yyyy || HH:mm'h'",
                          {
                            locale: ptBR,
                          }
                        )
                      }
                    />
                  </div>
                </section>
              </TabPanel>
            )}

            {Boolean(order.closed) && (
              <TabPanel hidden={tabIndex !== 3}>
                <section>
                  <div className="line">
                    <LabelGroup
                      label="Descrição"
                      content={order?.closing_note}
                      emptyMessage="sem descrição"
                    />
                  </div>
                </section>

                <Divider />

                <section>
                  <div className="line">
                    <LabelGroup
                      label="Usuário de fechamento"
                      content={order?.closingUser?.short_name}
                      icon={<BsPersonCheck />}
                    />
                    <LabelGroup
                      className="end"
                      label="Data de cancelamento"
                      content={
                        order?.closed_at &&
                        format(
                          new Date(order?.closed_at),
                          "dd MMM, yyyy || HH:mm'h'",
                          {
                            locale: ptBR,
                          }
                        )
                      }
                    />
                  </div>
                </section>
              </TabPanel>
            )}
          </>
        ) : (
          <MessageInfo>Não foi possível carregar a O.S</MessageInfo>
        )}
      </Container>
    </ConfirmDialog>
  );
};

export default memo(ViewOsDialog);
