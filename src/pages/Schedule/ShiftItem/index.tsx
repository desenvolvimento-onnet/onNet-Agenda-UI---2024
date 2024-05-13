import React, { memo, useMemo } from "react";
import Button from "../../../components/Button";

import { IoNewspaperOutline } from "react-icons/io5";
import { BsInfo } from "react-icons/bs";
import { MdAdd } from "react-icons/md";

import { Container, Title, Info, Vacancy, ButtonGroup } from "./styles";

import { FiMinus } from "react-icons/fi";
import { useContext } from "react";
import { AuthContext } from "../../../global/context/AuthContext";
import { useCallback } from "react";
import { endOfDay, isPast } from "date-fns/esm";

import ShiftCity from "../../../models/ShiftCity";

export interface VacancyForm {
  type: "increment" | "decrement";
  rural: boolean;
}

interface ShiftItemProps {
  shiftCity: ShiftCity;
  selectedDate: Date;
  canChangeVacancy?: boolean;
  onInfoClick: (ev?: React.MouseEvent<HTMLButtonElement | MouseEvent>) => void;
  onVacancyClick: (vacancy: VacancyForm) => void;
  onOrderClick: (ev?: React.MouseEvent<HTMLButtonElement | MouseEvent>) => void;
  onAddOsClick: (rural: boolean) => void;
}

export interface Vacancies {
  amount: number;
  ruralAmount: number;
}

const ShiftItem: React.FC<ShiftItemProps> = ({
  shiftCity,
  selectedDate,
  canChangeVacancy,
  onOrderClick,
  onAddOsClick,
  onVacancyClick,
  onInfoClick,
}) => {
  const { userPermissions } = useContext(AuthContext);

  const vacancies = useMemo<Vacancies>(() => {
    const orders = shiftCity.shift?.orders?.filter(
      (order) => !Boolean(order.rural) && !Boolean(order.canceled)
    );

    const ruralOrders = shiftCity.shift?.orders?.filter(
      (order) => Boolean(order.rural) && !Boolean(order.canceled)
    );

    const amount = Math.max(0, shiftCity.vacancies - (orders?.length || 0));
    const ruralAmount = Math.max(
      0,
      shiftCity.rural_vacancies - (ruralOrders?.length || 0)
    );

    return { amount, ruralAmount };
  }, [shiftCity]);

  const isRural = useMemo<boolean>(() => {
    return (
      !userPermissions?.order.schedule.shift_full &&
      Boolean(!vacancies.amount && vacancies.ruralAmount)
    );
  }, [vacancies.amount, vacancies.ruralAmount, userPermissions]);

  const shouldDisableSchedule = useCallback(() => {
    const date = endOfDay(selectedDate);

    if (isPast(date)) return true;

    if (userPermissions?.order.schedule.allow) {
      const { amount } = vacancies;

      if (
        amount ||
        userPermissions.order.schedule.shift_full ||
        (isRural && userPermissions.order.schedule.rural)
      )
        return false;
    }

    return true;
  }, [userPermissions, isRural, vacancies, selectedDate]);

  return (
    <Container>
      <Title>
        <h2
          className={!vacancies.amount ? "disabled" : ""}
          title={shiftCity.shift?.name}
        >
          {shiftCity.shift?.name} {vacancies.amount === 0 && <i>(Lotado)</i>}
        </h2>

        <Button
          title="Verificar disponibilidade"
          background="var(--info)"
          height={1.5}
          icon={<BsInfo />}
          iconSize={18}
          onClick={onInfoClick}
        />
      </Title>

      <Info>
        <Vacancy>
          <span className={!vacancies.amount ? "disabled" : ""}>
            Disponível:{" "}
            <strong>
              {vacancies.amount} / {shiftCity.vacancies}
            </strong>
          </span>

          {canChangeVacancy && (
            <div className="button-group">
              <Button
                icon={<FiMinus />}
                height={1.8}
                title="Remover 1 vaga"
                background="var(--danger)"
                disabled={!shiftCity.vacancies}
                onClick={() =>
                  onVacancyClick({ type: "decrement", rural: false })
                }
              />

              <Button
                icon={<MdAdd />}
                height={1.8}
                background="var(--success)"
                title="Adicionar 1 vaga"
                onClick={() =>
                  onVacancyClick({ type: "increment", rural: false })
                }
              />
            </div>
          )}
        </Vacancy>

        <Vacancy>
          <span className={!vacancies.ruralAmount ? "disabled" : ""}>
            Disponível (rural):{" "}
            <strong>
              {vacancies.ruralAmount} / {shiftCity.rural_vacancies}
            </strong>
          </span>

          {canChangeVacancy && (
            <div className="button-group">
              <Button
                icon={<FiMinus />}
                height={1.8}
                background="var(--danger)"
                title="Remover 1 vaga (rural)"
                disabled={!shiftCity.rural_vacancies}
                onClick={() =>
                  onVacancyClick({ type: "decrement", rural: true })
                }
              />

              <Button
                icon={<MdAdd />}
                height={1.8}
                title="Adicionar 1 vaga (rural)"
                background="var(--success)"
                onClick={() =>
                  onVacancyClick({ type: "increment", rural: true })
                }
              />
            </div>
          )}
        </Vacancy>
      </Info>

      <ButtonGroup>
        <Button
          icon={<IoNewspaperOutline />}
          background="var(--secondary)"
          title="Ver ordens de serviço"
          onClick={onOrderClick}
        />

        <Button
          className="full-width"
          icon={<MdAdd />}
          title="Agendar nova O.S"
          background="var(--success)"
          onClick={() => onAddOsClick(isRural)}
          disabled={shouldDisableSchedule()}
        >
          Adicionar
          {isRural && " (Rural)"}
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default memo(ShiftItem);
