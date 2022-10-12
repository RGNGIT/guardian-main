export interface BaseResponse<T, U> {
  code: number,
  alias: U,
  message: T
}
