import React, { memo, useCallback, useEffect, useState } from "react";

import {
  KeyboardDatePicker,
  KeyboardDatePickerProps,
} from "@material-ui/pickers";
import { CircularProgress } from "@material-ui/core";
import { TiMediaRecordOutline } from "react-icons/ti";
import { format, isToday } from "date-fns";

import { Container } from "./styles";

import Button from "../Button";
import HolidayService from "../../services/HolidayService";
import Holiday from "../../models/Holiday";
import MessageInfo from "../MessageInfo";
import { notificate } from "../../global/notificate";
import { useContext } from "react";
import { AuthContext } from "../../global/context/AuthContext";

interface CalendarProps extends KeyboardDatePickerProps {
  cityId?: number;
  value: Date | null;
  onChange: (date: Date | null) => void;
  variant?: "inline" | "dialog" | "static";
  enablePast?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  cityId,
  onChange,
  value,
  variant = "static",
  enablePast,
  children,
  ...props
}) => {
  const { userPermissions } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [holidays, setHolidays] = useState<Holiday[]>();

  const handleCurrentDate = useCallback(() => {
    const currentDate = new Date();

    onChange(currentDate);
  }, [onChange]);

  const refresh = useCallback(() => {
    setIsLoading(true);

    HolidayService.activeHolidays()
      .then((response) => {
        if (!value) handleCurrentDate();

        setHolidays(response.data);
      })
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar o calendário",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() =>
        setTimeout(() => {
          setIsLoading(false);
        }, 300)
      );
  }, [value, setHolidays, handleCurrentDate, setIsLoading]);

  const isDisabled = useCallback(
    (date: Date) => {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      return Boolean(
        holidays?.find(
          (holiday) =>
            holiday.day === day &&
            holiday.month === month &&
            (holiday.year || year) === year &&
            (!holiday.city_id || holiday.city_id === cityId)
        )
      );
    },
    [cityId, holidays]
  );

  const handleShoudDisableDate = useCallback(
    (date: Date | null) => {
      if (!date || userPermissions?.order.schedule.holiday) return false;

      return isDisabled(date);
    },
    [isDisabled]
  );

  useEffect(() => {
    if (value && !userPermissions?.order.schedule.holiday) {
      const date = new Date(value);

      if (isDisabled(date)) {
        notificate({
          title: "Aviso",
          message: `A data ${format(
            date,
            "dd/MM/yyyy"
          )} está bloqueada. A data mais próxima foi selecionada!`,
          type: "warning",
          duration: 10000,
        });

        date.setDate(date.getDate() + 1);

        onChange(date);
      }
    }
  }, [value, isDisabled, onChange, userPermissions]);

  useEffect(() => {
    refresh();
  }, []);

  return (
    <Container>
      {isLoading ? (
        <CircularProgress size={30} className="centralize" />
      ) : holidays && value ? (
        <>
          <KeyboardDatePicker
            {...props}
            autoOk
            disablePast={!enablePast}
            variant={variant}
            format="dd/MM/yyyy"
            value={value}
            invalidDateMessage="Data inválida"
            maxDateMessage="A data selecionada ultrapassa a data válida"
            minDateMessage="A data selecionada é menor do que a data permitida"
            shouldDisableDate={handleShoudDisableDate}
            onChange={onChange}
          />

          {variant === "static" && (
            <Button
              title="Selecionar a data de hoje"
              icon={<TiMediaRecordOutline />}
              onClick={handleCurrentDate}
              background="var(--secondary)"
              disabled={isToday(value || 0)}
            >
              Data de hoje
            </Button>
          )}
        </>
      ) : (
        <MessageInfo>Não foi possível carregar o calendário</MessageInfo>
      )}
    </Container>
  );
};

export default memo(Calendar);
