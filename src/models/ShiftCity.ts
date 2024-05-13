import City from "./City";
import Default from "./Default";
import Shift from "./Shift";

class ShiftCity extends Default {
  public vacancies: number;
  public rural_vacancies: number;
  public shift_id: number;
  public city_id: number;
  public shift?: Shift;
  public city?: City;

  constructor({
    id,
    vacancies,
    rural_vacancies,
    shift_id,
    city_id,
    created_at,
    updated_at,
    shift,
    city,
  }: ShiftCity) {
    super({ id, created_at, updated_at });

    this.vacancies = vacancies;
    this.rural_vacancies = rural_vacancies;
    this.shift_id = shift_id;
    this.city_id = city_id;
    this.shift = shift;
    this.city = city;
  }
}

export default ShiftCity;
