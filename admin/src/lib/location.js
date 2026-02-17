import { City } from "country-state-city";

/**
 * India → Maharashtra cities (human readable)
 */
export const getMaharashtraCities = () => {
  return City.getCitiesOfState("IN", "MH").map((c) => c.name);
};
