import Contract from "./Contract";
import Default from "./Default";
import Plan from "./Plan";
import User from "./User";

class Renew extends Default {
  public print: string;
  public old_accession_date: Date | string;
  public new_accession_date: Date | string;
  public old_conclusion_date: Date | string;
  public new_conclusion_date: Date | string;
  public old_monthly_price?: number | null;
  public new_monthly_price?: number | null;
  public old_monthly_benefit?: number | null;
  public new_monthly_benefit?: number | null;
  public old_plan_id?: number | null;
  public new_plan_id?: number | null;
  public contract_id?: number;
  public user_id?: number;
  public oldPlan?: Plan | null;
  public newPlan?: Plan | null;
  public contract?: Contract | null;
  public user?: User | null;

  constructor({
    id,
    print,
    old_accession_date,
    new_accession_date,
    old_conclusion_date,
    new_conclusion_date,
    old_monthly_price,
    new_monthly_price,
    old_monthly_benefit,
    new_monthly_benefit,
    old_plan_id,
    new_plan_id,
    contract_id,
    user_id,
    oldPlan,
    newPlan,
    contract,
    user,
    created_at,
    updated_at,
  }: Renew) {
    super({ id, created_at, updated_at });
    
    this.print = print;
    this.old_accession_date = old_accession_date;
    this.new_accession_date = new_accession_date;
    this.old_conclusion_date = old_conclusion_date;
    this.new_conclusion_date = new_conclusion_date;
    this.old_monthly_price = old_monthly_price;
    this.new_monthly_price = new_monthly_price;
    this.old_monthly_benefit = old_monthly_benefit;
    this.new_monthly_benefit = new_monthly_benefit;
    this.old_plan_id = old_plan_id;
    this.new_plan_id = new_plan_id;
    this.contract_id = contract_id;
    this.user_id = user_id;
    this.oldPlan = oldPlan;
    this.newPlan = newPlan;
    this.contract = contract;
    this.user = user;
  }
}

export default Renew;
