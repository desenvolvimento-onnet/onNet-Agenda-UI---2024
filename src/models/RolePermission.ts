import Default from "./Default";
import Permission from "./Permission";
import Role from "./Role";

class RolePermission extends Default {
  public role_id: number;
  public permission_id?: number | null;
  public role?: Role;
  public permission?: Permission | null;

  constructor({
    id,
    role_id,
    permission_id,
    role,
    permission,
    created_at,
    updated_at,
  }: RolePermission) {
    super({ id, created_at, updated_at });

    this.role_id = role_id;
    this.permission_id = permission_id;
    this.role = role;
    this.permission = permission;
  }
}

export default RolePermission;
