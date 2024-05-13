import CompositionItem from "./CompositionItem";
import Default from "./Default";

class Composition extends Default {
  public name: string;
  public min_value: number;
  public active: boolean;
  public use_value: boolean;
  public compositionItems?: CompositionItem[] | null;

  constructor({
    id,
    name,
    min_value,
    active,
    use_value,
    compositionItems,
    created_at,
    updated_at,
  }: Composition) {
    super({ id, created_at, updated_at });

    this.name = name;
    this.min_value = min_value;
    this.active = active;
    this.use_value = use_value;
    this.compositionItems = compositionItems;
  }
}

export default Composition;
