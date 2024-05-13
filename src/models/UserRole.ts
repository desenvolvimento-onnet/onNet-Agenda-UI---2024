import Default from "./Default";
import Role from "./Role";
import User from "./User";

class UserRole extends Default {
  public user_id: number;
  public role_id: number;
  public user?: User;
  public role?: Role;

  constructor({
    id,
    user_id,
    role_id,
    user,
    role,
    created_at,
    updated_at,
  }: UserRole) {
    super({ id, created_at, updated_at });

    this.user_id = user_id;
    this.role_id = role_id;
    this.user = user;
    this.role = role;
  }
}

export default UserRole;
