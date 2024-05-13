import City from "./City";
import Default from "./Default";
import Order from "./Order";
import ShiftCity from "./ShiftCity";
import ShiftType from "./ShiftType";
import Tecnology from "./Tecnology";

export interface CityWithPivot extends City {
  pivot: ShiftCity;
}

class Shift extends Default {
  public name: string;
  public active: boolean | 0 | 1;
  public tecnology_id?: number;
  public shift_type_id: number;
  public tecnology?: Tecnology | null;
  public shiftType?: ShiftType;
  public cities?: CityWithPivot[];
  public orders?: Order[];

  constructor({
    id,
    name,
    active,
    tecnology_id,
    shift_type_id,
    created_at,
    updated_at,
    tecnology,
    shiftType,
    cities,
    orders,
  }: Shift) {
    super({ id, created_at, updated_at });

    this.name = name;
    this.active = active;
    this.tecnology_id = tecnology_id;
    this.shift_type_id = shift_type_id;
    this.tecnology = tecnology;
    this.shiftType = shiftType;
    this.cities = cities;
    this.orders = orders;
  }
}

export default Shift;
