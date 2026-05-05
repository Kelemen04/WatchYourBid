import {
  FormProvider,
  type UseFormReturn,
  type FieldValues,
  type SubmitHandler,
} from "react-hook-form";

interface FormWrapperProps<T extends FieldValues> {
  children: React.ReactNode;
  onSubmit: SubmitHandler<T>;
  methods: UseFormReturn<T>;
  className?: string;
}

export const FormWrapper = <T extends FieldValues>({
  children,
  onSubmit,
  methods,
  className,
}: FormWrapperProps<T>) => {
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={className}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
};
