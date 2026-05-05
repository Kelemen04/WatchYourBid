import { useFormContext, type Path, type FieldValues } from "react-hook-form";

interface FormInputProps<
  T extends FieldValues,
> extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: Path<T>;
}

export const FormInput = <T extends FieldValues>({
  label,
  name,
  ...rest
}: FormInputProps<T>) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-left ml-30 py-2 font-inter text-text-muted text-xl">
        {label}:
      </label>
      <input
        {...register(name)}
        {...rest}
        className={`w-xs border rounded-2xl p-2 ${error ? "border-red-500" : "border-gray-300"}`}
      />
      <div className="min-h-[20px] ml-30">
        {error && (
          <span className="text-red-500 text-xs font-bold">{error}</span>
        )}
      </div>
    </div>
  );
};
