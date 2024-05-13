class Default {
  public id?: number;
  public created_at?: Date | string;
  public updated_at?: Date | string;

  constructor({ id, created_at, updated_at }: Default) {
    this.id = id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

export default Default;
