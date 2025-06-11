/**
 * Enum representing the different age categories for dogs based on their age in months.
 * These categories match the backend's age range definitions.
 */
export enum AgeRangeCategory {
  PUPPY = 'Chiot',           // 0-12 months
  YOUNG_DOG = 'Jeune chien', // 13-36 months
  ADULT = 'Adulte',          // 37-84 months
  SENIOR = 'Senior'          // 85+ months
}

/**
 * Gets the age range category based on min and max age values.
 * @param minAge The minimum age in months
 * @param maxAge The maximum age in months
 * @returns The corresponding age range category
 */
export function getAgeRangeCategory(minAge: number, maxAge: number): AgeRangeCategory {
  if (minAge === 0 && maxAge === 12) {
    return AgeRangeCategory.PUPPY;
  } else if (minAge === 13 && maxAge === 36) {
    return AgeRangeCategory.YOUNG_DOG;
  } else if (minAge === 37 && maxAge === 84) {
    return AgeRangeCategory.ADULT;
  } else if (minAge === 85 && maxAge === 999) {
    return AgeRangeCategory.SENIOR;
  } else {
    // Default case for custom age ranges
    return getClosestAgeRangeCategory(minAge, maxAge);
  }
}

/**
 * Gets the closest matching age range category for custom age ranges.
 * @param minAge The minimum age in months
 * @param maxAge The maximum age in months
 * @returns The closest matching age range category
 */
function getClosestAgeRangeCategory(minAge: number, maxAge: number): AgeRangeCategory {
  // Calculate the midpoint of the age range
  const midpoint = (minAge + maxAge) / 2;

  if (midpoint <= 12) {
    return AgeRangeCategory.PUPPY;
  } else if (midpoint <= 36) {
    return AgeRangeCategory.YOUNG_DOG;
  } else if (midpoint <= 84) {
    return AgeRangeCategory.ADULT;
  } else {
    return AgeRangeCategory.SENIOR;
  }
}
