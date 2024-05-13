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
import PhoneNumber from "../../../../models/PhoneNumber";
import PhoneNumberService from "../../../../services/PhoneNumberService";
import { RiMedal2Fill } from "react-icons/ri";
import { MdPhonelinkLock } from "react-icons/md";

interface ViewNumberDialogProps extends DialogProps {
  index: number;
  open: boolean;
  phoneNumberId?: number;
  onClose: (options: CloseStatus) => void;
}

const ViewNumberDialog: React.FC<ViewNumberDialogProps> = ({
  index,
  open,
  phoneNumberId,
  onClose,
  ...props
}) => {
  const { userPermissions } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tabIndex, setTabIndex] = useState<number>(0);

  const [phoneNumber, setPhoneNumber] = useState<PhoneNumber>();

  useEffect(() => {
    if (open && !userPermissions?.phone_number.show) {
      notificate({
        title: "Erro",
        message: "Você não tem permissão para visualizar o número",
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
    const phoneNumber = (await PhoneNumberService.show(id)).data;

    return { phoneNumber };
  }

  function refresh(phoneNumberId: number) {
    setPhoneNumber(undefined);
    setIsLoading(true);
    setTabIndex(0);

    getData(phoneNumberId)
      .then((response) => setPhoneNumber(response.phoneNumber))
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar o número",
          type: "danger",
        });

        onClose({ index });

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if (open && phoneNumberId) refresh(phoneNumberId);
  }, [open, phoneNumberId]);

  return (
    <ConfirmDialog
      open={open}
      title="Visualizar número"
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
        ) : phoneNumber ? (
          <>
            <AppBar
              position="static"
              color="default"
              style={{ boxShadow: "none", background: "var(--white)" }}
            >
              <Tabs value={tabIndex} onChange={handleTabChange}>
                <Tab label="Info" value={0} />

                {Boolean(phoneNumber?.alocated) && (
                  <Tab label="Alocação" value={1} />
                )}

                {Boolean(phoneNumber?.reserved) && (
                  <Tab label="Reserva" value={2} />
                )}
              </Tabs>
            </AppBar>

            <TabPanel hidden={tabIndex !== 0}>
              <section>
                <div className="line">
                  <LabelGroup label="Número" content={phoneNumber.number} />

                  <LabelGroup
                    className="center"
                    label="Cidade"
                    content={phoneNumber.city?.name}
                  />

                  <LabelGroup
                    className="end"
                    label="Disponibilidade"
                    content={phoneNumber.alocated ? "Alocado" : "Disponível"}
                  />
                </div>

                <div className="line">
                  <LabelGroup label="DDD" content={phoneNumber.ddd} />

                  <LabelGroup
                    className="center"
                    label="Prefixo"
                    content={phoneNumber.prefix}
                  />

                  <LabelGroup
                    className="end"
                    label="Sufixo"
                    content={phoneNumber.sufix}
                  />
                </div>

                {Boolean(phoneNumber.portability || phoneNumber.gold) && (
                  <div className="line detach">
                    {Boolean(phoneNumber.gold) && (
                      <LabelGroup
                        label="Tipo"
                        icon={<RiMedal2Fill />}
                        content="Gold"
                      />
                    )}

                    {Boolean(phoneNumber.portability) && (
                      <LabelGroup
                        label="Tipo"
                        icon={<MdPhonelinkLock />}
                        content="Portabilidade"
                      />
                    )}
                  </div>
                )}
              </section>

              <Divider />

              <section>
                <div className="line">
                  <LabelGroup
                    label="Usuário de criação"
                    content={phoneNumber?.user?.short_name}
                    icon={<BsPersonCheck />}
                  />
                  <LabelGroup
                    className="end"
                    label="Data de criação"
                    content={
                      phoneNumber?.created_at &&
                      format(
                        new Date(phoneNumber?.created_at),
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

            {Boolean(phoneNumber.alocated) && (
              <TabPanel hidden={tabIndex !== 1}>
                <section>
                  <div className="line">
                    <LabelGroup
                      className="short"
                      label="N° Contrato"
                      content={
                        phoneNumber.contract?.client_number
                          ? `${phoneNumber.contract?.client_number} (${phoneNumber.contract?.contract_number})`
                          : phoneNumber.contract?.contract_number
                      }
                    />

                    <LabelGroup
                      label="Cliente"
                      content={phoneNumber?.contract?.client}
                    />
                  </div>
                </section>

                <Divider />

                <section>
                  <div className="line">
                    <LabelGroup
                      label="Usuário de alocação"
                      content={phoneNumber?.allocationUser?.short_name}
                      icon={<BsPersonCheck />}
                    />
                    <LabelGroup
                      className="end"
                      label="Data de alocação"
                      content={
                        phoneNumber?.alocated_at &&
                        format(
                          new Date(phoneNumber?.alocated_at),
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

            {Boolean(phoneNumber.reserved) && (
              <TabPanel hidden={tabIndex !== 2}>
                <section>
                  <div className="line">
                    <LabelGroup
                      label="Reservado até"
                      content={format(
                        new Date(phoneNumber?.reserved_until || ""),
                        "dd/MM/yyyy"
                      )}
                    />
                  </div>

                  <div className="line detach">
                    <LabelGroup
                      label="Obs"
                      content="Um número reservado não poderá ser alocado até a data de liberação. Após essa data, números de portabilidade serão excluídos."
                    />
                  </div>
                </section>

                <Divider />

                <section>
                  <div className="line">
                    <LabelGroup
                      label="Reservado por"
                      content={phoneNumber?.reservationUser?.short_name}
                      icon={<BsPersonCheck />}
                    />

                    <LabelGroup
                      className="end"
                      label="Reservado em"
                      content={
                        phoneNumber?.reserved_at &&
                        format(
                          new Date(phoneNumber?.reserved_at),
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
          <MessageInfo>Não foi possível carregar o número</MessageInfo>
        )}
      </Container>
    </ConfirmDialog>
  );
};

export default memo(ViewNumberDialog);
