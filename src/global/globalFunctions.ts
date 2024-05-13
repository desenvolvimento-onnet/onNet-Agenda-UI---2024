export function padronize(str?: string | String): string {
  const text = (str || "").toLocaleLowerCase().trim();

  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function parseCpf(str?: string | String): string {
  const value = (str || "").replace(/\D/g, "");

  if (value.length > 9)
    return value.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2}).*/, "$1.$2.$3-$4");
  else if (value.length > 6)
    return value.replace(/^(\d{3})(\d{3})(\d)/, "$1.$2.$3");
  else if (value.length > 3) return value.replace(/^(\d{3})(\d)/, "$1.$2");

  return value;
}

export function parseCnpj(str?: string | String): string {
  const value = (str || "").replace(/\D/g, "");

  if (value.length > 12)
    return value.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2}).*/,
      "$1.$2.$3/$4-$5"
    );
  else if (value.length > 8)
    return value.replace(/^(\d{2})(\d{3})(\d{3})(\d)/, "$1.$2.$3/$4");
  else if (value.length > 5)
    return value.replace(/^(\d{2})(\d{3})(\d)/, "$1.$2.$3");
  else if (value.length > 2) return value.replace(/^(\d{2})(\d)/, "$1.$2");

  return value;
}

export function parsePhone(str?: string | String): string {
  const value = (str || "").replace(/\D/g, "");

  if (value.length > 10)
    return value.replace(/^(\d{2})(\d{5})(\d{1,4}).*/, "($1) $2-$3");
  else if (value.length > 6)
    return value.replace(/^(\d{2})(\d{4})(\d)/, "($1) $2-$3");
  else if (value.length > 2) return value.replace(/^(\d{2})(\d)/, "($1) $2");
  else if (value.length > 0) return value.replace(/^(\d)/, "($1");

  return value;
}

export function parseCep(str?: string | String): string {
  const value = (str || "").replace(/\D/g, "");

  if (value.length > 5) return value.replace(/^(\d{5})(\d{1,3}).*/, "$1-$2");

  return value;
}
