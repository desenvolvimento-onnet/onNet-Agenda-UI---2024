import Default from "./Default";

export interface OsType {
  id: number;
  description: string;
}

export interface City {
  name: string;
  ibge: string;
}

export interface Plan {
  plan_number: string;
  name: string;
  download: string;
  upload: string;
  base_monthly_price: number;
  system_id: number;
}

export interface Order {
  os: number;
  client_number?: number;
  contract_number: number | null;
  client: string;
  closed: boolean;
  system_id: number;
  type: OsType;
  city: City;
  system: System;
}

export interface Contract {
  client_number?: number;
  contract_number: number;
  client: string;
  cpf_cnpj: string;
  rg_ie?: string | null;
  fantasy_name?: string | null;
  municipal_registration?: string | null;
  birthday_foundation?: string | null;
  father?: string | null;
  mother?: string | null;
  seller?: string | null;
  expiration_day: number;
  month_amount: number;
  email?: string | null;
  cellphone: string;
  phone01?: string | null;
  phone02?: string | null;
  zip_code: string;
  district: string;
  street: string;
  number: string;
  complement?: string | null;
  legal_person: boolean;
  monthly_price: number;
  accession_date: string | Date;
  canceled: boolean;
  system_id: number;
  city: City;
  plan: Plan;
  system: System;
}

class System extends Default {
  public name: string;
  public short_name: string;
  public identifier: string;
  public active: boolean | 1 | 0;

  constructor({
    id,
    name,
    short_name,
    identifier,
    active,
    created_at,
    updated_at,
  }: System) {
    super({ id, created_at, updated_at });

    this.name = name;
    this.short_name = short_name;
    this.identifier = identifier;
    this.active = active;
  }
}

export default System;
