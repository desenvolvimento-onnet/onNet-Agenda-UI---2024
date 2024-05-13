import Default from "./Default";
import Permission from "./Permission";
import User from "./User";

class Role extends Default {
  public name: string;
  public permissions?: number[] | Permission[];
  public users?: User[];

  constructor({ id, name, created_at, updated_at, permissions, users }: Role) {
    super({ id, created_at, updated_at });

    this.name = name;
    this.permissions = permissions;
    this.users = users;
  }
}

export default Role;
