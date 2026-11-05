const PAKISTANI_MOBILE_PATTERN = /^\+923\d{9}$/;

export function normalizePkNumber(input) {
  const cleaned = String(input ?? "").replace(/[\s-]/g, "");

  if (cleaned.startsWith("+92")) {
    return `+${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith("92")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("0")) {
    return `+92${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith("3")) {
    return `+92${cleaned}`;
  }

  return cleaned;
}

export function isValidPkNumber(input) {
  return PAKISTANI_MOBILE_PATTERN.test(normalizePkNumber(input));
}
