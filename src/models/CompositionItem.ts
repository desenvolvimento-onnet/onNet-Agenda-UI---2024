import Composition from "./Composition";
import Default from "./Default";

class CompositionItem extends Default {
  public name: string;
  public short_name: string;
  public value: number | null;
  public percent: number | null;
  public autocomplete: boolean;
  public composition_id: number;
  public composition?: Composition | null;

  constructor({
    id,
    name,
    short_name,
    value,
    percent,
    autocomplete,
    composition_id,
    composition,
    created_at,
    updated_at,
  }: CompositionItem) {
    super({ id, created_at, updated_at });

    this.name = name;
    this.short_name = short_name;
    this.value = value;
    this.percent = percent;
    this.autocomplete = autocomplete;
    this.composition_id = composition_id;
    this.composition = composition;
  }
}

export default CompositionItem;
