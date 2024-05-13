export default interface Pagination<T> {
  total: number;
  perPage: number;
  page: number;
  lastPage: number;
  data: T[];
}
