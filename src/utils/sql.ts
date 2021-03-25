export const distanceSql = (
  latCol: number,
  lonCol: number,
  latVar: number,
  lonVar: number,
) => /*sql*/ `
  6371 * 2 * ASIN(SQRT(
  POWER(SIN((${latCol} - abs(${latVar})) * pi()/180 / 2), 2)
  + COS(${latCol} * pi()/180 ) * COS(abs(${latVar}) * pi()/180)
  * POWER(SIN((${lonCol} - ${lonVar}) *  pi()/180 / 2), 2)))
`;
