import Composition from "./Composition";
import Default from "./Default";
import System from "./System";

class Plan extends Default {
  public plan_number?: string | null;
  public name: string;
  public download: string;
  public upload: string;
  public base_monthly_price: number;
  public base_monthly_benefit: number;
  public active: boolean;
  public system_id?: number | null;
  public composition_id: number;
  public system?: System;
  public composition?: Composition | null;

  constructor({
    id,
    name,
    download,
    upload,
    base_monthly_price,
    base_monthly_benefit,
    active,
    system_id,
    composition_id,
    system,
    composition,
    created_at,
    updated_at,
  }: Plan) {
    super({ id, created_at, updated_at });

    this.name = name;
    this.download = download;
    this.upload = upload;
    this.base_monthly_price = base_monthly_price;
    this.base_monthly_benefit = base_monthly_benefit;
    this.active = active;
    this.system_id = system_id;
    this.composition_id = composition_id;
    this.system = system;
    this.composition = composition;
  }
}

export default Plan;
