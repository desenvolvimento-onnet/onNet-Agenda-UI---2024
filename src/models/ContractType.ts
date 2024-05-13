import Contract from "./Contract";
import Default from "./Default";

class ContractType extends Default {
  public name: string;
  public template?: string | null;
  public active: boolean | 1 | 0;
  public contracts?: Contract[];

  constructor({
    id,
    name,
    template,
    active,
    contracts,
    created_at,
    updated_at,
  }: ContractType) {
    super({ id, created_at, updated_at });

    this.name = name;
    this.contracts = contracts;
    this.template = template;
    this.active = active;
  }
}

export default ContractType;
