import React, {
  ChangeEvent,
  FormEvent,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { MdSearch } from "react-icons/md";
import { format, isSameDay } from "date-fns";
import {
  CircularProgress,
  DialogProps,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@material-ui/core";

import { CloseStatus } from "../context";
import { notificate } from "../../../../global/notificate";
import { padronize } from "../../../../global/globalFunctions";

import ConfirmDialog from "../../../ConfirmDialog";
import Button from "../../../Button";
import Order from "../../../../models/Order";
import OrderService from "../../../../services/OrderService";
import MessageInfo from "../../../MessageInfo";
import Divider from "../../../Divider";
import ShiftCity from "../../../../models/ShiftCity";
import ShiftCityService from "../../../../services/ShiftCityService";
import LabelGroup from "../../../LabelGroup";

import { Container, Filter, Form } from "./styles";
import { AuthContext } from "../../../../global/context/AuthContext";
import { Vacancies } from "../../../../pages/Schedule/ShiftItem";
import { BsCardList, BsNewspaper, BsPersonLinesFill } from "react-icons/bs";

import SwitchToggle from "../../../SwitchToggle";
import ContractService from "../../../../services/ContractService";
import useContractDialog from "../../ContractDialogs/context/useContractDialog";
import Contract from "../../../../models/Contract";
import SystemService, {
  SystemContractParams,
} from "../../../../services/SystemService";
import System from "../../../../models/System";

interface AddOsDialogProps extends DialogProps {
  index: number;
  open: boolean;
  orderId?: number;
  date?: Date;
  shiftId?: number;
  cityId?: number;
  isRural?: boolean;
  onClose: (options: CloseStatus) => void;
}

interface SearchForm {
  osId?: number;
  system?: System;
}

const AddOsDialog: React.FC<AddOsDialogProps> = ({
  index,
  open,
  onClose,
  orderId,
  date,
  shiftId,
  cityId,
  isRural,
  ...props
}) => {
  const { userPermissions } = useContext(AuthContext);
  const { fixContractDialog } = useContractDialog();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [orderForm, setOrderForm] = useState<Order>({} as Order);

  const [selectedOrder, setSelectedOrder] = useState<Order>();
  const [selectedShiftCity, setSelectedShiftCity] = useState<ShiftCity>(
    {} as ShiftCity
  );

  const [systems, setSystems] = useState<System[]>([]);
  const [searchForm, setSearchForm] = useState<SearchForm>({} as SearchForm);

  const vacancies = useMemo<Vacancies | undefined>(() => {
    const { shift_id, city_id, shift } = selectedShiftCity;

    if (!open) return;

    if (orderId || (shift_id == shiftId && city_id == cityId)) {
      const orders = shift?.orders?.filter(
        (order) => !Boolean(order.rural) && !Boolean(order.canceled)
      );

      const ruralOrders = shift?.orders?.filter(
        (order) => Boolean(order.rural) && !Boolean(order.canceled)
      );

      const amount = Math.max(
        0,
        selectedShiftCity.vacancies - (orders?.length || 0)
      );
      const ruralAmount = Math.max(
        0,
        selectedShiftCity.rural_vacancies - (ruralOrders?.length || 0)
      );

      return { amount, ruralAmount };
    }
  }, [selectedShiftCity, shiftId, cityId, open]);

  useEffect(() => {
    if (open && vacancies) {
      var errorLabel: string | null = null;

      if (orderId && !userPermissions?.order.edit)
        errorLabel = "Você não tem permissão para editar a O.S";
      else if (!orderId) {
        if (userPermissions?.order.schedule.allow) {
          if (isRural) {
            if (!userPermissions.order.schedule.rural)
              errorLabel =
                "Você não tem permissão para adicionar uma O.S rural";
            else if (
              !vacancies.ruralAmount &&
              !userPermissions.order.schedule.shift_full
            )
              errorLabel = "O turno está lotado!";
          } else if (
            !vacancies.amount &&
            !userPermissions.order.schedule.shift_full
          )
            errorLabel = "O turno está lotado!";
        } else errorLabel = "Você não tem permissão para adicionar uma O.S";
      }

      if (errorLabel) {
        notificate({
          title: "Aviso",
          message: errorLabel,
          type: "warning",
        });

        onClose({ index, success: true });
      }
    }
  }, [open, onClose, userPermissions, vacancies, orderId]);

  const onSubmit = useCallback(async (order: Order, orderId?: number) => {
    if (orderId) await OrderService.update(orderId, order);
    else {
      const date = format(new Date(order.date || ""), "yyyy-MM-dd");

      await OrderService.store({ ...order, date });
    }
  }, []);

  const handleClose = useCallback(
    (success?: boolean) => {
      if (success) {
        if (
          !selectedOrder?.id &&
          (!orderForm.os || !orderForm.os_type || !orderForm.client)
        ) {
          notificate({
            title: "Atenção",
            message: "Não foram encontrados dados da O.S",
            type: "warning",
          });

          return;
        }

        setIsLoading(true);

        onSubmit(orderForm, selectedOrder?.id)
          .then(() => onClose({ index, success }))
          .catch((err) => {
            if (err.response?.status)
              notificate({
                title: `Erro ${err.response?.status || ""}`,
                message: "Ocorreu um erro ao salvar os dados",
                type: "danger",
              });
          })
          .finally(() => setIsLoading(false));
      } else onClose({ index, success });
    },
    [onClose, orderForm, index, onSubmit, selectedOrder]
  );

  const shouldDisableSwitch = useCallback(() => {
    if (userPermissions?.order.schedule.shift_full) return false;

    if (
      (isRural && !vacancies?.amount) ||
      (!isRural && !vacancies?.ruralAmount)
    )
      return true;
  }, [userPermissions, vacancies, isRural]);

  const getImportedContract = useCallback(
    (
      system_id: number,
      { contract_number, client_number }: SystemContractParams
    ) => {
      setIsLoading(true);

      ContractService.index({
        contract_number,
        client_number,
        system_id,
      })
        .then((response) => {
          if (response.data.data.length)
            setOrderForm((prev) => ({
              ...prev,
              contract_id: Number(response.data.data[0].id),
            }));
        })
        .catch((err) => {
          notificate({
            title: `Erro ${err.response?.status}`,
            message: "Ocorreu um erro ao carregar o contrato importado",
            type: "danger",
          });

          setOrderForm({} as Order);

          console.log(err);
        })
        .finally(() => setIsLoading(false));
    },
    []
  );

  const getSystemOsData = useCallback(
    async (shiftCity: ShiftCity, form: SearchForm) => {
      if (!form.osId) {
        notificate({
          title: "Atenção",
          message: "Insira o código da O.S",
          type: "info",
        });

        throw new Error("Data is missing");
      }

      if (!form.system) {
        notificate({
          title: "Atenção",
          message: "Selecione um sistema para continuar",
          type: "info",
        });

        throw new Error("Missing system");
      }

      const {
        city,
        type,
        closed,
        client_number,
        contract_number,
        system,
        ...data
      } = (await SystemService.getSystemOs(form.osId, form.system)).data;

      const orderExists = Boolean(
        (
          await OrderService.indexByQuery(String(form.osId), {
            canceled: false,
          })
        ).data.total
      );

      if (orderExists) {
        if (userPermissions?.order.schedule.duplicate_schedule)
          notificate({
            title: "Atenção",
            message: `A O.S "${form.osId}" já foi agendada`,
            type: "info",
            duration: 5000,
          });
        else {
          notificate({
            title: "Erro",
            message: `A O.S "${form.osId}" já foi agendada`,
            type: "danger",
            duration: 5000,
          });

          throw new Error("Schedule denied");
        }
      }

      if (closed) {
        if (userPermissions?.order.schedule.system_closed) {
          notificate({
            title: "Atenção",
            message: `A O.S "${form.osId}" já foi encerrada no ${system.short_name}`,
            type: "info",
            duration: 5000,
          });
        } else {
          notificate({
            title: "Erro",
            message: `A O.S "${form.osId}" já foi encerrada no ${system.short_name}`,
            type: "danger",
            duration: 5000,
          });

          throw new Error("Schedule denied");
        }
      }

      if (padronize(city.ibge) !== padronize(shiftCity.city?.ibge || "")) {
        if (userPermissions?.order.schedule.another_city)
          notificate({
            title: "Atenção",
            message: `A O.S de ${city.name.toUpperCase()} será agendada em ${shiftCity.city?.name.toUpperCase()}`,
            type: "info",
            duration: 5000,
          });
        else {
          notificate({
            title: "Erro",
            message: `A O.S de ${city.name.toUpperCase()} não pode ser agendada em ${shiftCity.city?.name.toUpperCase()}`,
            type: "danger",
            duration: 5000,
          });

          throw new Error("Schedule denied");
        }
      }

      const order: Order = { ...data, os_type: type.description } as Order;
      var systemContractParams: SystemContractParams | undefined;
      var contract: Contract | undefined;

      if (contract_number?.toString()) {
        systemContractParams = {
          client_number,
          contract_number,
        };

        contract = (
          await ContractService.index({
            client_number,
            contract_number,
          })
        ).data.data[0];
      }

      return { order, system, contract, systemContractParams };
    },
    [userPermissions]
  );

  const handleSearchOs = useCallback(
    (ev: FormEvent) => {
      ev.preventDefault();

      setIsLoading(true);

      getSystemOsData(selectedShiftCity, searchForm)
        .then(({ systemContractParams, contract, system, ...response }) => {
          if (!contract && systemContractParams) {
            fixContractDialog(
              system,
              {
                client_number: systemContractParams.client_number,
                contract_number: systemContractParams.contract_number,
              },
              undefined,
              (success) => {
                if (success) {
                  getImportedContract(Number(system.id), systemContractParams);
                  setOrderForm((prev) => ({ ...prev, ...response.order }));
                } else
                  notificate({
                    title: "Atenção",
                    message:
                      "É necessário importar o contrato para adicionar a O.S",
                    type: "info",
                  });
              }
            );
          } else
            setOrderForm((prev) => ({
              ...prev,
              ...response.order,
              contract_id: contract?.id || null,
            }));
        })
        .catch((err) => {
          if (err.response?.status === 404)
            notificate({
              title: "Erro",
              message: `A O.S "${searchForm.osId}" não foi encontrada`,
              type: "danger",
            });
          else if (err.response?.status)
            notificate({
              title: `Erro ${err.response.status}`,
              message: "Ocorreu um erro ao buscar pela O.S",
              type: "danger",
            });

          console.log(err);
        })
        .finally(() => setIsLoading(false));
    },
    [searchForm, selectedShiftCity, getImportedContract, fixContractDialog]
  );

  useEffect(() => {
    const formWithoutOs = { os: 0, client: "", os_type: "" };

    setOrderForm((prev) => ({ ...prev, ...(formWithoutOs as Order) }));
  }, [searchForm, setOrderForm]);

  async function getData(
    order_id?: number,
    city_id?: number,
    shift_id?: number,
    date?: Date
  ) {
    const systems = (await SystemService.index({ active: 1 })).data;

    const order = order_id
      ? (await OrderService.show(order_id)).data
      : undefined;

    const parsedDate = format(
      new Date(order?.date || date || ""),
      "yyyy-MM-dd"
    );

    const shiftCity = (
      await ShiftCityService.getByCityByDate(
        Number(order?.city_id || city_id),
        parsedDate,
        { shift_id: Number(order?.shift_id || shift_id) }
      )
    ).data[0];

    return { order, systems, shiftCity };
  }

  function refresh() {
    if (open) {
      setSelectedOrder({} as Order);
      setSelectedShiftCity({} as ShiftCity);
      setOrderForm({} as Order);
      setSearchForm({} as SearchForm);

      setIsLoading(true);

      getData(orderId, cityId, shiftId, date)
        .then((response) => {
          setSelectedOrder(response.order);
          setSelectedShiftCity(response.shiftCity);
          setSystems(response.systems);

          if (isSameDay(new Date(date || ""), new Date()))
            notificate({
              title: "Aviso",
              message:
                "Você está prestes a agendar uma O.S para ser realizada ainda HOJE!",
              type: "info",
              duration: 5000,
            });

          if (!orderId)
            setOrderForm({
              date: new Date(date || ""),
              city_id: cityId,
              shift_id: shiftId,
              rural: isRural,
            } as Order);
          else setOrderForm({ rural: response.order?.rural } as Order);
        })
        .catch((err) => {
          if (err.response?.status === 404)
            notificate({
              title: "Aviso",
              message: "Esta O.S não foi encontrada",
              type: "warning",
            });
          else
            notificate({
              title: `Erro ${err.response?.status || ""}`,
              message: "Ocorreu um erro ao carregar a O.S",
              type: "danger",
            });

          handleClose();

          console.log(err);
        })
        .finally(() => setIsLoading(false));
    } else handleClose();
  }

  const handleInputChange = useCallback(
    (
      ev: ChangeEvent<HTMLInputElement | { name?: string; value?: any }>,
      checked?: boolean
    ) => {
      const { name, value } = ev.target;

      setOrderForm((prev) => ({
        ...prev,
        [name || ""]: name === "rural" ? checked : value,
      }));
    },
    [setOrderForm]
  );

  useEffect(() => {
    setSearchForm((prev) => ({ ...prev, system: systems[0] }));
  }, [systems, setSearchForm]);

  useEffect(() => {
    refresh();
  }, [open, orderId, shiftId, cityId, date]);

  return (
    <ConfirmDialog
      open={open}
      title={`${orderId ? "Editar" : "Adicionar"} O.S`}
      okLabel="Salvar"
      cancelLabel="Voltar"
      onClose={handleClose}
      okButtonProps={{
        disabled: isLoading || Boolean(!selectedOrder?.id && !orderForm.os),
      }}
      fullWidth
      maxWidth="md"
      BackdropProps={{ style: { background: "var(--backdrop)" } }}
      {...props}
    >
      <Container>
        {!orderId && (
          <Filter onSubmit={handleSearchOs}>
            <TextField
              label="N° da O.S"
              type="number"
              name="os"
              variant="outlined"
              disabled={isLoading}
              value={searchForm.osId || ""}
              onChange={(ev) =>
                setSearchForm((prev) => ({
                  ...prev,
                  osId: parseInt(ev.target.value),
                }))
              }
            />

            <RadioGroup
              name="system"
              className="system"
              value={searchForm.system?.id || ""}
              onChange={(ev) => {
                const system = systems.find(
                  (system) => Number(ev.target.value) === system.id
                );

                if (system) {
                  setSearchForm((prev) => ({
                    ...prev,
                    system,
                  }));
                }
              }}
            >
              {systems.map((system, i) => (
                <div key={system.id}>
                  {i > 0 && <span>|</span>}

                  <FormControlLabel
                    value={system.id}
                    control={<Radio color="primary" />}
                    disabled={isLoading}
                    label={system.name}
                    style={{ margin: 0 }}
                  />
                </div>
              ))}
            </RadioGroup>

            <Button
              title="Buscar"
              icon={<MdSearch />}
              type="submit"
              background="var(--info)"
              disabled={isLoading}
            >
              Buscar
            </Button>
          </Filter>
        )}

        {isLoading ? (
          <CircularProgress size={100} className="centralize" />
        ) : !selectedShiftCity ? (
          <MessageInfo>Ocorreu um erro ao carregar os dados</MessageInfo>
        ) : (
          <Form
            onSubmit={(ev) => {
              ev.preventDefault();

              handleClose(true);
            }}
          >
            {(orderForm.os || selectedOrder?.os) && (
              <>
                <Divider />

                <div className="os-data">
                  <LabelGroup
                    label="O.S"
                    content={orderForm.os || selectedOrder?.os}
                    icon={<BsNewspaper />}
                  />

                  <LabelGroup
                    label="Cliente"
                    content={orderForm.client || selectedOrder?.client}
                    icon={<BsPersonLinesFill />}
                  />

                  <LabelGroup
                    label="Tipo O.S"
                    content={orderForm.os_type || selectedOrder?.os_type}
                    icon={<BsCardList />}
                  />
                </div>
              </>
            )}

            <Divider />

            <div className="line">
              <TextField
                label="Turno"
                variant="filled"
                value={selectedShiftCity.shift?.name || ""}
                InputProps={{ readOnly: true }}
              />
            </div>

            <div className="line">
              <TextField
                label="Cidade"
                variant="filled"
                value={selectedShiftCity.city?.name || ""}
                InputProps={{ readOnly: true }}
              />

              <TextField
                label="Data"
                name="date"
                value={format(
                  new Date(selectedOrder?.date || date || ""),
                  "dd/MM/yyyy"
                )}
                variant="filled"
                InputProps={{ readOnly: true }}
              />
            </div>

            <div className="line"></div>

            <div className="line">
              <TextField
                label="Observação (opcional)"
                name="note"
                value={
                  orderForm.note ||
                  (orderForm.note === undefined ? selectedOrder?.note : "")
                }
                onChange={handleInputChange}
                multiline
                rows={4}
                variant="outlined"
              />

              <div className="switch-rural">
                <SwitchToggle
                  label="Rural"
                  name="rural"
                  onChange={handleInputChange}
                  value={Boolean(orderForm.rural) || false}
                  disabled={shouldDisableSwitch()}
                  formControlLabelProps={{
                    title: shouldDisableSwitch()
                      ? `Sem vagas ${orderForm.rural ? "urbanas" : "rurais"}`
                      : "",
                  }}
                />
              </div>
            </div>
          </Form>
        )}
      </Container>
    </ConfirmDialog>
  );
};

export default memo(AddOsDialog);
