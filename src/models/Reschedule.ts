import City from "./City";
import Default from "./Default";
import Order from "./Order";
import Shift from "./Shift";
import User from "./User";

class Reschedule extends Default {
  public reason: string;
  public old_date: Date | string;
  public new_date: Date | string;
  public order_id: number;
  public user_id: number;
  public old_shift_id?: number;
  public new_shift_id?: number;
  public old_city_id?: number;
  public new_city_id?: number;
  public order?: Order;
  public user?: User;
  public oldShift?: Shift | null;
  public newShift?: Shift | null;
  public oldCity?: City | null;
  public newCity?: City | null;

  constructor({
    id,
    created_at,
    reason,
    old_date,
    new_date,
    order_id,
    user_id,
    old_shift_id,
    new_shift_id,
    old_city_id,
    new_city_id,
    order,
    user,
    oldShift,
    newShift,
    oldCity,
    newCity,
    updated_at,
  }: Reschedule) {
    super({ id, created_at, updated_at });

    this.reason = reason;
    this.old_date = old_date;
    this.new_date = new_date;
    this.order_id = order_id;
    this.user_id = user_id;
    this.old_shift_id = old_shift_id;
    this.new_shift_id = new_shift_id;
    this.old_city_id = old_city_id;
    this.new_city_id = new_city_id;
    this.order = order;
    this.user = user;
    this.oldShift = oldShift;
    this.newShift = newShift;
    this.oldCity = oldCity;
    this.newCity = newCity;
  }
}

export default Reschedule;
