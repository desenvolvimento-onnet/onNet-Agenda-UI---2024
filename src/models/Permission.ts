import Default from "./Default";
import Role from "./Role";

class Permission extends Default {
  public label: string;
  public prefix: string;
  public parent_permission_id?: number | null;
  public isModule: boolean;
  public parent?: Permission | null;
  public roles?: Role[];

  constructor({
    id,
    label,
    prefix,
    parent_permission_id,
    isModule,
    parent,
    roles,
    created_at,
    updated_at,
  }: Permission) {
    super({ id, created_at, updated_at });

    this.label = label;
    this.prefix = prefix;
    this.parent_permission_id = parent_permission_id;
    this.isModule = isModule;
    this.parent = parent;
    this.roles = roles;
  }
}

export default Permission;
