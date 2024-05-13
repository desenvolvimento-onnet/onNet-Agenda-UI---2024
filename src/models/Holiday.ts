import City from "./City";
import Default from "./Default";

class Holiday extends Default {
  public day: number;
  public month: number;
  public year?: number | null;
  public description: string;
  public city_id?: number | null;
  public city?: City | null;

  constructor({
    id,
    day,
    month,
    year,
    description,
    city_id,
    created_at,
    updated_at,
    city,
  }: Holiday) {
    super({ id, created_at, updated_at });

    this.day = day;
    this.month = month;
    this.year = year;
    this.description = description;
    this.city_id = city_id;
    this.city = city;
  }
}
export default Holiday;
