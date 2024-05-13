import Contract from "./Contract";
import Default from "./Default";
import Product from "./Product";

class ContractProduct extends Default {
  public value: number;
  public amount: number;
  public contract_id: number;
  public product_id: number;
  public product?: Product;
  public contract?: Contract;

  constructor({
    id,
    value,
    amount,
    contract_id,
    product_id,
    product,
    contract,
    created_at,
    updated_at,
  }: ContractProduct) {
    super({ id, created_at, updated_at });

    this.value = value;
    this.amount = amount;
    this.contract_id = contract_id;
    this.product_id = product_id;
    this.product = product;
    this.contract = contract;
  }
}

export default ContractProduct;
