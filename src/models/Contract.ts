import { parseCep, parsePhone } from "../global/globalFunctions";

import City from "./City";
import ContractProduct from "./ContractProduct";
import ContractType from "./ContractType";
import Default from "./Default";
import InstallationTax from "./InstallationTax";
import Order from "./Order";
import PhoneNumber from "./PhoneNumber";
import Plan from "./Plan";
import Product from "./Product";
import Renew from "./Renew";
import System from "./System";
import User from "./User";

export interface ProductWithPivot extends Product {
  pivot: ContractProduct;
}

class Contract extends Default {
  public client_number?: number | null;
  public contract_number: number;
  public client: string;
  public cpf_cnpj: string;
  public rg_ie?: string | null;
  public birthday_foundation?: string | Date | null;
  public mother?: string | null;
  public father?: string | null;
  public fantasy_name?: string | null;
  public municipal_registration?: string | null;
  public legal_person: boolean | 1 | 0;
  public email?: string | null;
  public cellphone: string;
  public phone01?: string | null;
  public phone02?: string | null;
  public work_place?: string | null;
  public work_phone?: string | null;
  public seller?: string | null;
  public zip_code: string;
  public district: string;
  public street: string;
  public number: string;
  public complement?: string | null;
  public accession_date: string | Date | null;
  public conclusion_date: string | Date | null;
  public expiration_day: number;
  public month_amount: number;
  public monthly_price: number;
  public monthly_benefit: number;
  public free_installation_tax: boolean;
  public note?: string | null;
  public canceled: boolean | 1 | 0;
  public renewed: boolean | 1 | 0;
  public ddr: boolean | 1 | 0;
  public system_id?: number | null;
  public city_id: number;
  public plan_id: number;
  public contract_type_id: number;
  public installation_tax_id: number;
  public installation_tax_value: number;
  public user_id: number;
  public system?: System;
  public city?: City;
  public contractType?: ContractType;
  public products?: ProductWithPivot[];
  public phoneNumbers?: PhoneNumber[];
  public renews?: Renew[];
  public orders?: Order[];
  public user?: User;
  public plan?: Plan;
  public installationTax?: InstallationTax;

  constructor({ id, created_at, updated_at, ...data }: Contract) {
    super({ id, created_at, updated_at });

    this.client_number = data.client_number;
    this.contract_number = data.contract_number;
    this.client = data.client;
    this.cpf_cnpj = data.cpf_cnpj;
    this.rg_ie = data.rg_ie;
    this.birthday_foundation =
      data.birthday_foundation && new Date(data.birthday_foundation);
    this.mother = data.mother;
    this.father = data.father;
    this.fantasy_name = data.fantasy_name;
    this.municipal_registration = data.municipal_registration;
    this.legal_person = data.legal_person;
    this.email = data.email;
    this.cellphone = parsePhone(data.cellphone);
    this.phone01 = parsePhone(data.phone01 || "");
    this.phone02 = parsePhone(data.phone02 || "");
    this.work_place = data.work_place;
    this.work_phone = data.work_phone;
    this.seller = data.seller;
    this.zip_code = parseCep(data.zip_code);
    this.district = data.district;
    this.street = data.street;
    this.number = data.number;
    this.complement = data.complement;
    this.accession_date = data.accession_date && new Date(data.accession_date);
    this.conclusion_date =
      data.conclusion_date && new Date(data.conclusion_date);
    this.expiration_day = data.expiration_day;
    this.month_amount = data.month_amount;
    this.monthly_price = data.monthly_price;
    this.monthly_benefit = data.monthly_benefit;
    this.installation_tax_value = data.installation_tax_value;
    this.note = data.note;
    this.canceled = data.canceled;
    this.renewed = data.renewed;
    this.ddr = data.ddr;
    this.system_id = data.system_id;
    this.city_id = data.city_id;
    this.plan_id = data.plan_id;
    this.user_id = data.user_id;
    this.contract_type_id = data.contract_type_id;
    this.installation_tax_id = data.installation_tax_id;
    this.free_installation_tax = data.free_installation_tax;
  }
}

export default Contract;
