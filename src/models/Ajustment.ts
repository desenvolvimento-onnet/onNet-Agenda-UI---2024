import Default from "./Default";

class Ajustment extends Default {
  public monthly_benefit: number;
  public month_amount: number;
  public legal_month_amount: number;
  public max_fix_time: number;
  public min_renew_time: number;

  constructor({
    id,
    monthly_benefit,
    month_amount,
    legal_month_amount,
    max_fix_time,
    min_renew_time,
    created_at,
    updated_at,
  }: Ajustment) {
    super({ id, created_at, updated_at });

    this.monthly_benefit = monthly_benefit;
    this.month_amount = month_amount;
    this.legal_month_amount = legal_month_amount;
    this.max_fix_time = max_fix_time;
    this.min_renew_time = min_renew_time;
  }
}

export default Ajustment;
