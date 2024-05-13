import City from "./City";
import Contract from "./Contract";
import Default from "./Default";
import User from "./User";

class PhoneNumber extends Default {
  public ddd: string;
  public prefix: string;
  public sufix: string;
  public number: string;
  public reserved_until: Date | string | null;
  public gold: boolean;
  public portability: boolean;
  public active: boolean;
  public alocated: boolean;
  public reserved: boolean;
  public alocated_at: Date | string | null;
  public reserved_at: Date | string | null;
  public allocation_user_id: number | null;
  public reservation_user_id: number | null;
  public user_id: number;
  public city_id: number;
  public contract_id?: number | null;
  public city?: City;
  public contract?: Contract;
  public allocationUser?: User;
  public reservationUser?: User;
  public user?: User;

  constructor({
    id,
    ddd,
    prefix,
    sufix,
    number,
    reserved_until,
    gold,
    portability,
    active,
    alocated,
    reserved,
    alocated_at,
    reserved_at,
    allocation_user_id,
    reservation_user_id,
    user_id,
    city_id,
    contract_id,
    city,
    contract,
    allocationUser,
    reservationUser,
    user,
    created_at,
    updated_at,
  }: PhoneNumber) {
    super({ id, created_at, updated_at });

    this.ddd = ddd;
    this.prefix = prefix;
    this.sufix = sufix;
    this.number = number;
    this.reserved_until = reserved_until;
    this.gold = gold;
    this.portability = portability;
    this.active = active;
    this.alocated = alocated;
    this.reserved = reserved;
    this.alocated_at = alocated_at;
    this.reserved_at = reserved_at;
    this.allocation_user_id = allocation_user_id;
    this.reservation_user_id = reservation_user_id;
    this.user_id = user_id;
    this.city_id = city_id;
    this.contract_id = contract_id;
    this.city = city;
    this.contract = contract;
    this.allocationUser = allocationUser;
    this.reservationUser = reservationUser;
    this.user = user;
  }
}

export default PhoneNumber;
