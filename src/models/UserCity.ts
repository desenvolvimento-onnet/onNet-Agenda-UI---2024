import City from "./City";
import Default from "./Default";
import User from "./User";

class UserCity extends Default {
  public user_id: number;
  public city_id: number;
  public user?: User;
  public city?: City;

  constructor({
    id,
    user_id,
    city_id,
    user,
    city,
    created_at,
    updated_at,
  }: UserCity) {
    super({ id, created_at, updated_at });

    this.user_id = user_id;
    this.city_id = city_id;
    this.user = user;
    this.city = city;
  }
}

export default UserCity;
