import Contract from "./Contract";
import Default from "./Default";

class Product extends Default {
  public name: string;
  public base_value: number;
  public active: boolean | 1 | 0;
  public benefit: boolean | 1 | 0;
  public contracts?: Contract[];

  constructor({
    id,
    name,
    base_value,
    active,
    benefit,
    contracts,
    created_at,
    updated_at,
  }: Product) {
    super({ id, created_at, updated_at });

    this.name = name;
    this.base_value = base_value;
    this.active = active;
    this.benefit = benefit;
    this.contracts = contracts;
  }
}

export default Product;
