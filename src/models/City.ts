import Default from "./Default";
import Holiday from "./Holiday";
import Order from "./Order";
import PhoneNumber from "./PhoneNumber";
import Shift from "./Shift";
import User from "./User";

class City extends Default {
  public name: string;
  public ibge: string;
  public state: string | null;
  public ddd: string | null;
  public prefix: string | null;
  public users?: User[] | null;
  public shifts?: Shift[] | null;
  public holidays?: Holiday[] | null;
  public orders?: Order[] | null;
  public phoneNumbers?: PhoneNumber[] | null;

  constructor({
    id,
    name,
    ibge,
    state,
    ddd,
    prefix,
    users,
    shifts,
    holidays,
    orders,
    phoneNumbers,
    created_at,
    updated_at,
  }: City) {
    super({ id, created_at, updated_at });

    this.name = name;
    this.ibge = ibge;
    this.state = state;
    this.ddd = ddd;
    this.prefix = prefix;
    this.users = users;
    this.shifts = shifts;
    this.holidays = holidays;
    this.orders = orders;
    this.phoneNumbers = phoneNumbers;
  }
}

export default City;
