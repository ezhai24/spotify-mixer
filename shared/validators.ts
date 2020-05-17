export const validateRequired = (
  fields: string[],
  form: Record<string, string>,
  errors: Record<string, string[]>,
): Record<string, string[]> => {
  const newErrors = { ...errors };
  fields.forEach(field => {
    const error = '*Required';
    const errorIndex = errors[field].indexOf(error);
    if(errorIndex === -1 && !form[field]) {
      newErrors[field].unshift(error);
    } else if (errorIndex !== -1 && !!form[field]) {
      newErrors[field].splice(errorIndex, 1);
    }
  });
  return newErrors;
};
