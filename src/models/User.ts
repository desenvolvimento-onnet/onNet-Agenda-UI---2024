import City from "./City";
import Default from "./Default";
import Role from "./Role";

class User extends Default {
  public name: string;
  public short_name: string;
  public email: string;
  public password: string;
  public active: boolean | 1 | 0;
  public admin: boolean | 1 | 0;
  public all_cities: boolean | 1 | 0;
  public cities?: number[] | City[];
  public roles?: number[] | Role[];

  constructor({
    id,
    name,
    short_name,
    email,
    password,
    active,
    admin,
    all_cities,
    cities,
    roles,
    created_at,
    updated_at,
  }: User) {
    super({ id, created_at, updated_at });

    this.name = name;
    this.short_name = short_name;
    this.email = email;
    this.password = password;
    this.active = active;
    this.admin = admin;
    this.all_cities = all_cities;
    this.cities = cities;
    this.roles = roles;
  }
}

export default User;
