import City from "./City";
import Contract from "./Contract";
import Default from "./Default";
import Reschedule from "./Reschedule";
import Shift from "./Shift";
import System from "./System";
import User from "./User";

class Order extends Default {
  public client: string;
  public date: Date | string;
  public os: number;
  public os_type: string;
  public note: string | null;
  public rural: boolean | 1 | 0;
  public rescheduled: boolean | 1 | 0;
  public closed: boolean | 1 | 0;
  public canceled: boolean | 1 | 0;
  public closing_note?: string | null;
  public closed_at?: Date | string | null;
  public cancellation_reason?: string | null;
  public canceled_at?: Date | string | null;
  public system_id: number | null;
  public shift_id: number;
  public city_id: number;
  public user_id: number;
  public contract_id: number | null;
  public closing_user_id?: number | null;
  public cancellation_user_id?: number | null;
  public system: System;
  public shift?: Shift;
  public city?: City;
  public user?: User;
  public contract?: Contract;
  public closingUser?: User;
  public cancellationUser?: User | null;
  public reschedules?: Reschedule[] | null;

  constructor({
    id,
    client,
    date,
    os,
    os_type,
    note,
    rural,
    rescheduled,
    closed,
    canceled,
    closing_note,
    closed_at,
    cancellation_reason,
    canceled_at,
    system_id,
    shift_id,
    city_id,
    user_id,
    contract_id,
    closing_user_id,
    cancellation_user_id,
    created_at,
    updated_at,
    system,
    shift,
    city,
    user,
    contract,
    closingUser,
    cancellationUser,
    reschedules,
  }: Order) {
    super({ id, created_at, updated_at });

    this.client = client;
    this.date = date;
    this.os = os;
    this.os_type = os_type;
    this.note = note;
    this.rural = rural;
    this.rescheduled = rescheduled;
    this.closed = closed;
    this.canceled = canceled;
    this.closing_note = closing_note;
    this.closed_at = closed_at;
    this.cancellation_reason = cancellation_reason;
    this.canceled_at = canceled_at;
    this.system_id = system_id;
    this.shift_id = shift_id;
    this.city_id = city_id;
    this.user_id = user_id;
    this.contract_id = contract_id;
    this.closing_user_id = closing_user_id;
    this.cancellation_user_id = cancellation_user_id;
    this.system = system;
    this.shift = shift;
    this.city = city;
    this.user = user;
    this.contract = contract;
    this.closingUser = closingUser;
    this.cancellationUser = cancellationUser;
    this.reschedules = reschedules;
  }
}

export default Order;
