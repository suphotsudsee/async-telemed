export function normalizeThaiId(input: string): string {
  return input.replace(/\D/g, "");
}

export function isValidThaiId(input: string): boolean {
  const id = normalizeThaiId(input);
  if (!/^\d{13}$/.test(id)) {
    return false;
  }

  const sum = id
    .slice(0, 12)
    .split("")
    .reduce((acc, digit, index) => acc + Number(digit) * (13 - index), 0);

  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === Number(id[12]);
}

