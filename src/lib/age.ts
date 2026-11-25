/** The platform is for adults. Enforced by the server in age-gate.ts. */
export const MIN_AGE = 18;

export const AGE_MESSAGE = `You must be ${MIN_AGE} or older to use QuantumLearn AI.`;

export function validAge(age: number): boolean {
  return Number.isInteger(age) && age >= 1 && age <= 120;
}

/** What is wrong with an age, or null if nothing is. */
export function ageProblem(age: number): string | null {
  if (!validAge(age)) return "Please enter a valid age.";
  return age < MIN_AGE ? AGE_MESSAGE : null;
}
