// src/utils/regions.js
export const getContinent = (region) => {
  const americas = ["na1", "br1", "la1", "la2"];
  const europe = ["euw1", "eun1", "tr1", "ru"];
  const asia = ["kr", "jp1"];

  if (americas.includes(region)) return "americas";
  if (europe.includes(region)) return "europe";
  if (asia.includes(region)) return "asia";

  return "americas";
};
