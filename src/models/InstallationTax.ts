import Contract from "./Contract";
import Default from "./Default";

class InstallationTax extends Default {
  public name: string;
  public base_value: number;
  public active: boolean;
  public contracts?: Contract[];

  constructor({
    id,
    name,
    base_value,
    active,
    contracts,
    created_at,
    updated_at,
  }: InstallationTax) {
    super({ id, created_at, updated_at });

    this.name = name;
    this.base_value = base_value;
    this.active = active;
    this.contracts = contracts;
  }
}

export default InstallationTax;
