export const today = () => new Date().toISOString().slice(0, 10);
export const positiveNumber = (value: string) => Number(value.replace(/,/g, ""));
export const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
