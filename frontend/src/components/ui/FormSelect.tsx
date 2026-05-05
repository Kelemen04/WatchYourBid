import { useFormContext, type Path, type FieldValues } from "react-hook-form";

interface FormSelectProps<
  T extends FieldValues,
> extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: Path<T>;
  options: string[] | { value: string; label: string }[];
}

export const FormSelect = <T extends FieldValues>({
  label,
  name,
  options,
  ...rest
}: FormSelectProps<T>) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name]?.message as string;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-left ml-30 py-2 font-inter text-text-muted text-xl">
        {label}:
      </label>
      <select
        {...register(name)}
        {...rest}
        className={`w-xs border rounded-2xl p-2 transition-all appearance-none
          ${error ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-primary"} 
          outline-none bg-white`}
      >
        <option value="">Select an option...</option>
        {options.map((opt) => {
          const value = typeof opt === "string" ? opt : opt.value;
          const label = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
      <div className="min-h-[20px] ml-30">
        {error && (
          <span className="text-red-500 text-xs font-bold">{error}</span>
        )}
      </div>
    </div>
  );
};
