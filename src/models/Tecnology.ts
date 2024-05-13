import Default from "./Default";
import Shift from "./Shift";

class Tecnology extends Default {
  public name: string;
  public shifts?: Shift[];

  constructor({ id, name, shifts, created_at, updated_at }: Tecnology) {
    super({ id, created_at, updated_at });

    this.name = name;
    this.shifts = shifts;
  }
}

export default Tecnology;
