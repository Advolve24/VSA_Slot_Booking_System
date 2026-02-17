import { Country, State, City } from "country-state-city";

export const getCitiesByState = (countryCode, stateCode) => {
  return City.getCitiesOfState(countryCode, stateCode);
};
