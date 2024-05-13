import React, { ChangeEvent, useCallback, useEffect, useState } from "react";

import { CircularProgress } from "@material-ui/core";

import { Container, Item } from "./styles";

import ShiftCity from "../../../../models/ShiftCity";
import ShiftCityService from "../../../../services/ShiftCityService";
import CityService from "../../../../services/CityService";
import City from "../../../../models/City";
import ShiftCityItem from "./ShiftCityItem";
import Divider from "../../../../components/Divider";
import { notificate } from "../../../../global/notificate";

interface ShiftCityListProps {
  shiftId: number;
  onChange?: (shiftCities: ShiftCity[]) => void;
}

const ShiftCityList: React.FC<ShiftCityListProps> = ({ shiftId, onChange }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [cities, setCities] = useState<City[]>([]);
  const [shiftCities, setShiftCities] = useState<ShiftCity[]>([]);

  const [shiftCityForm, setShiftCityForm] = useState<ShiftCity>({
    vacancies: 0,
    rural_vacancies: 0,
  } as ShiftCity);

  async function refresh() {
    const cities = (await CityService.index({ order_by: "name" })).data;
    const shiftCities = (await ShiftCityService.index({ shift_id: shiftId }))
      .data;

    return { cities, shiftCities };
  }

  const handleAddClick = useCallback(() => {
    if (
      !shiftCityForm.city_id ||
      !String(shiftCityForm.vacancies) ||
      !String(shiftCityForm.rural_vacancies)
    ) {
      notificate({
        title: "Atenção",
        message: "Preencha todos os campos",
        type: "info",
      });

      return;
    }

    setShiftCities((prev) => [shiftCityForm, ...prev]);
    setShiftCityForm({ vacancies: 0, rural_vacancies: 0 } as ShiftCity);
  }, [shiftCityForm, setShiftCities]);

  const handleRemoveClick = useCallback(
    (cityId: number) => {
      const data = shiftCities.filter(
        (shiftCity) => shiftCity.city_id !== cityId
      );

      setShiftCities(data);
    },
    [shiftCities]
  );

  const handleInputChange = useCallback(
    (
      ev: ChangeEvent<HTMLInputElement | { name?: string; value: any }>,
      cityId?: number
    ) => {
      var { name, value } = ev.target;

      if (value !== "") value = Math.abs(Number(value));

      if (cityId) {
        setShiftCityForm({ vacancies: 0, rural_vacancies: 0 } as ShiftCity);

        const data = shiftCities.map((shiftCity) => {
          if (shiftCity.city_id === cityId)
            return { ...shiftCity, [name || ""]: value };

          return shiftCity;
        });

        setShiftCities(data);
      } else setShiftCityForm((prev) => ({ ...prev, [name || ""]: value }));
    },
    [shiftCities]
  );

  useEffect(() => {
    onChange && onChange(shiftCities);
  }, [shiftCities]);

  useEffect(() => {
    setIsLoading(true);

    refresh()
      .then((response) => {
        setCities(response.cities);
        setShiftCities(response.shiftCities);
      })
      .catch((err) => {
        notificate({
          title: `Erro ${err.response?.status || ""}`,
          message: "Ocorreu um erro ao carregar as cidades",
          type: "danger",
        });

        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }, [shiftId]);

  return (
    <Container>
      {isLoading ? (
        <CircularProgress size={100} className="centralize" />
      ) : (
        <>
          <ShiftCityItem
            type="include"
            shiftCity={shiftCityForm}
            cities={cities.filter(
              (city) =>
                city.id === shiftCityForm.city_id ||
                !shiftCities.find((shiftCity) => shiftCity.city_id === city.id)
            )}
            onChange={(ev) => handleInputChange(ev)}
            onAddClick={handleAddClick}
          />

          <Divider />

          {shiftCities.map((shiftCity) => (
            <ShiftCityItem
              key={shiftCity.id}
              type="remove"
              shiftCity={shiftCity}
              cities={cities.filter(
                (city) =>
                  city.id === shiftCity.city_id ||
                  !shiftCities.find(
                    (shiftCity) => shiftCity.city_id === city.id
                  )
              )}
              onChange={(ev) => handleInputChange(ev, shiftCity.city_id)}
              onRemoveClick={() => handleRemoveClick(Number(shiftCity.city_id))}
            />
          ))}
        </>
      )}
    </Container>
  );
};

export default ShiftCityList;
