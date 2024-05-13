import React, {
  ChangeEvent,
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { format, isSameDay } from "date-fns";
import {
  CircularProgress,
  DialogProps,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";

import { CloseStatus } from "../context";
import { notificate } from "../../../../global/notificate";
import { AuthContext } from "../../../../global/context/AuthContext";
import { padronize } from "../../../../global/globalFunctions";

import ConfirmDialog from "../../../ConfirmDialog";
import Reschedule from "../../../../models/Reschedule";
import Order from "../../../../models/Order";
import OrderService from "../../../../services/OrderService";
import MessageInfo from "../../../MessageInfo";
import Calendar from "../../../Calendar";
import City from "../../../../models/City";
import CityService from "../../../../services/CityService";
import ShiftCityService from "../../../../services/ShiftCityService";
import ShiftCity from "../../../../models/ShiftCity";
import RescheduleService from "../../../../services/RescheduleService";

import { Container } from "./styles";
import SelectFilter from "../../../SelectFilter";

interface RescheduleOsDialogProps extends DialogProps {
  index: number;
  open: boolean;
  onClose: (options: CloseStatus) => void;
  orderId?: number;
}

const RescheduleOsDialog: React.FC<RescheduleOsDialogProps> = ({
  index,
  open,
  onClose,
  orderId,
  ...props
}) => {
  const { user, userPermissions } = useContext(AuthContext);

  const [dateError, setDateError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rescheduleForm, setRescheduleForm] = useState<Reschedule>(
    {} as Reschedule
  );

  const [selectedOrder, setSelectedOrder] = useState<Order>();

  const [cities, setCities] = useState<City[]>();
  const [shiftCities, setShiftCities] = useState<ShiftCity[]>();

  useEffect(() => {
    if (open && !userPermissions?.order.reschedule) {
      notificate({
        title: "Erro",
        message: "Você não tem permissão para reagendar a O.S",
        type: "danger",
      });

      onClose({ index, success: false });
    }
  }, [open, userPermissions]);

  const onSubmit = useCallback(
    async (order: Order, reschedule: Reschedule) => {
      const { reason, new_shift_id, new_city_id, new_date } = reschedule;

      if (dateError) {
        notificate({
          title: "Atenção",
          message: dateError,
          type: "info",
        });

        throw new Error("Invalid date");
      }

      if (!reason || !new_shift_id) {
        notificate({
          title: "Atenção",
          message: "Preencha todos os campos!",
          type: "info",
        });

        throw new Error("Missing data");
      }

      if (order?.canceled) {
        notificate({
          title: "Aviso",
          message: "Esta O.S já está cancelada!",
          type: "warning",
        });

        throw new Error("Order already canceled");
      }

      if (order?.closed) {
        notificate({
          title: "Aviso",
          message: "Esta O.S já está fechada!",
          type: "warning",
        });

        throw new Error("Order already closed");
      }

      if (
        isSameDay(
          new Date(new_date || (order?.date as Date)),
          new Date(order?.date as Date)
        ) &&
        new_shift_id === order?.shift_id &&
        (!reschedule.new_city_id || reschedule.new_city_id === order?.city_id)
      ) {
        notificate({
          title: "Atenção",
          message:
            "É necessário alerar pelo menos uma informação da O.S para concluir o reagendamento!",
          type: "info",
        });

        throw new Error(
          "Cannot be rescheduled in the same data with the old data"
        );
      }

      if (new_city_id) {
        const newCity = cities?.find((city) => city.id === new_city_id);
        const oldCity = cities?.find((city) => city.id === order.city_id);

        if (
          newCity &&
          oldCity &&
          padronize(newCity.ibge) !== padronize(oldCity.ibge) &&
          !userPermissions?.order.schedule.another_city
        ) {
          notificate({
            title: "Erro",
            message: `A O.S da cidade ${oldCity.name.toUpperCase()} não pode ser reagendada na cidade ${newCity.name.toUpperCase()}`,
            type: "danger",
            duration: 5000,
          });

          throw new Error("Schedule denied");
        }
      }

      if (new_date)
        reschedule = {
          ...reschedule,
          new_date: format(new Date(new_date || ""), "yyyy-MM-dd"),
        };

      await RescheduleService.store({
        ...reschedule,
        order_id: Number(order.id),
      });
    },
    [dateError]
  );

  const handleClose = useCallback(
    (success?: boolean) => {
      if (success && selectedOrder) {
        setIsLoading(true);

        onSubmit(selectedOrder, rescheduleForm)
          .then(() => onClose({ index, success }))
          .catch((err) => {
            if (err.response?.status)
              notificate({
                title: `Erro ${err.response?.status || ""}`,
                message: "Ocorreu um erro ao reagendar a O.S",
                type: "danger",
              });

            console.log(err);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else onClose({ index, success });
    },
    [onClose, selectedOrder, rescheduleForm, index, onSubmit]
  );

  const handleDateChange = useCallback(
    (date: Date | null) => {
      setRescheduleForm((prev) => ({
        ...prev,
        new_date: date || (selectedOrder?.date as Date),
      }));
    },
    [setRescheduleForm, selectedOrder?.date]
  );

  const handleInputChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement | { name?: string; value: any }>) => {
      const { name, value } = ev.target;

      setRescheduleForm((prev) => ({ ...prev, [name || ""]: value }));
    },
    [setRescheduleForm]
  );

  async function getShiftCities(cityId: number, date: Date) {
    const parsedDate = format(new Date(date || ""), "yyyy-MM-dd");

    const shiftCities = (
      await ShiftCityService.getByCityByDate(cityId, parsedDate)
    ).data;

    return { shiftCities };
  }

  async function getData(id: number) {
    const userCities = (user?.cities as City[]) || [];

    const order = (await OrderService.show(id)).data;
    const cities = (await CityService.index({ order_by: "name" })).data.filter(
      (city) =>
        city.id === order.city_id ||
        userCities.find((userCity) => city.id === userCity.id)
    );

    return { order, cities };
  }

  function refresh() {
    if (open) {
      setSelectedOrder(undefined);
      setRescheduleForm({} as Reschedule);

      if (!orderId) {
        handleClose();

        return;
      }

      setIsLoading(true);

      getData(orderId)
        .then((response) => {
          if (response.order.canceled) {
            notificate({
              title: "Aviso",
              message: "Esta O.S já está cancelada!",
              type: "warning",
            });

            handleClose();
          } else if (response.order.closed) {
            notificate({
              title: "Aviso",
              message: "Esta O.S já está fechada!",
              type: "warning",
            });

            handleClose();
          } else {
            setSelectedOrder(response.order);
            setCities(response.cities);
          }
        })
        .catch((err) => {
          notificate({
            title: `Erro ${err.response?.status || ""}`,
            message: "Ocorreu um erro ao carregar a O.S",
            type: "danger",
          });

          handleClose();

          console.log(err);
        })
        .finally(() => setIsLoading(false));
    }
  }

  function vacancyAmount(shiftCity: ShiftCity, rural?: boolean) {
    const vacancy = rural ? shiftCity.rural_vacancies : shiftCity.vacancies;
    let amount = 0;

    if (rural)
      amount =
        shiftCity.shift?.orders?.filter((order) => order.rural).length || 0;
    else
      amount =
        shiftCity.shift?.orders?.filter((order) => !order.rural).length || 0;

    return Math.max(0, vacancy - amount);
  }

  // Set the free amount vacancies in each shiftCity
  useEffect(() => {
    if (open) {
      const cityId = rescheduleForm.new_city_id || selectedOrder?.city_id;
      const date = rescheduleForm.new_date || selectedOrder?.date;

      setShiftCities([]);

      if (cityId && date && !dateError)
        getShiftCities(cityId, new Date(date))
          .then((response) => {
            const shiftCities = selectedOrder?.rural
              ? response.shiftCities.map((shiftCity) => {
                  shiftCity.rural_vacancies = vacancyAmount(shiftCity, true);

                  return shiftCity;
                })
              : response.shiftCities.map((shiftCity) => {
                  shiftCity.vacancies = vacancyAmount(shiftCity);

                  return shiftCity;
                });

            setShiftCities(shiftCities);
          })
          .catch((err) => {
            notificate({
              title: `Erro ${err.response?.status || ""}`,
              message: "Ocorreu um erro ao carregar os turnos",
              type: "danger",
            });

            setShiftCities(undefined);

            console.log(err);
          });
    }
  }, [
    open,
    selectedOrder,
    rescheduleForm.new_city_id,
    rescheduleForm.new_date,
    dateError,
  ]);

  // Set the selected shift depending of the city seleted
  useEffect(() => {
    const new_shift_id = shiftCities?.find(
      (shiftCity) =>
        shiftCity.shift_id === Number(selectedOrder?.shift_id) &&
        shiftCity.city_id === Number(selectedOrder?.city_id)
    )
      ? Number(selectedOrder?.shift_id)
      : 0;

    setRescheduleForm((prev) => ({ ...prev, new_shift_id }));
  }, [
    shiftCities,
    selectedOrder?.shift_id,
    selectedOrder?.city_id,
    rescheduleForm.new_city_id,
  ]);

  useEffect(() => {
    refresh();
  }, [open, orderId]);

  return (
    <ConfirmDialog
      open={open}
      title="Reagendar O.S"
      okLabel="Salvar"
      cancelLabel="Voltar"
      onClose={handleClose}
      okButtonProps={{ disabled: isLoading || !rescheduleForm.new_shift_id }}
      fullWidth
      maxWidth="xs"
      {...props}
    >
      <Container>
        {isLoading ? (
          <CircularProgress size={100} className="centralize" />
        ) : selectedOrder ? (
          <form
            onSubmit={(ev) => {
              ev.preventDefault();

              handleClose(true);
            }}
          >
            <strong>
              {selectedOrder.os} - {selectedOrder.client}
            </strong>

            <Calendar
              label="Data"
              value={(rescheduleForm.new_date || selectedOrder.date) as Date}
              onChange={handleDateChange}
              cityId={rescheduleForm.new_city_id || selectedOrder.city_id}
              variant="inline"
              onError={(err) =>
                setDateError(err ? "Verifique a data selecionada" : "")
              }
            />

            <SelectFilter
              label="Cidade"
              options={cities || []}
              identifierAttr="id"
              nameAttr="name"
              name="new_city_id"
              value={rescheduleForm.new_city_id || selectedOrder.city_id || ""}
              onChange={handleInputChange}
              required
            />

            {shiftCities ? (
              <FormControl required>
                <InputLabel>Turno</InputLabel>

                <Select
                  name="new_shift_id"
                  value={rescheduleForm.new_shift_id || ""}
                  onChange={handleInputChange}
                  required
                >
                  {shiftCities.map(
                    (shiftCity) =>
                      Boolean(shiftCity.shift?.active) && (
                        <MenuItem
                          key={shiftCity.id}
                          value={shiftCity.shift_id}
                          disabled={
                            !userPermissions?.order.schedule.shift_full &&
                            !Boolean(
                              selectedOrder.rural
                                ? shiftCity.rural_vacancies
                                : shiftCity.vacancies
                            ) &&
                            !(
                              shiftCity.shift_id ===
                                Number(selectedOrder.shift_id) &&
                              shiftCity.city_id ===
                                Number(selectedOrder.city_id)
                            )
                          }
                        >
                          {shiftCity.shift?.name} -{" "}
                          {selectedOrder.rural
                            ? shiftCity.rural_vacancies
                            : shiftCity.vacancies}{" "}
                          vaga(s)
                        </MenuItem>
                      )
                  )}
                </Select>
              </FormControl>
            ) : (
              <MessageInfo>Não foi possível carregar os turnos</MessageInfo>
            )}

            <TextField
              label="Motivo"
              name="reason"
              value={rescheduleForm.reason || ""}
              onChange={handleInputChange}
              multiline
              rows={3}
              variant="outlined"
              fullWidth
              margin="normal"
            />
          </form>
        ) : (
          open && (
            <MessageInfo>
              Não foi possível carregar a ordem de serviço
            </MessageInfo>
          )
        )}
      </Container>
    </ConfirmDialog>
  );
};

export default memo(RescheduleOsDialog);
