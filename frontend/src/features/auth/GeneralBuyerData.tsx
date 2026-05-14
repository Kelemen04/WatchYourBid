import { useFormContext } from "react-hook-form";
import type { BuyerRegisterDTO } from "../../dto/user.dto";

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

export default function GeneralBuyerData({ setStep }: Props) {
  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext<BuyerRegisterDTO>();

  const handleNext = async () => {
    const fieldsToValidate = ["lastName", "firstName", "phoneNumber"] as const;
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  return (
    <div className="form-step">
      <h1>Personal Information</h1>

      <div>
        <label htmlFor="firstName">First Name:</label>
        <input type="text" id="firstName" {...register("firstName")} />
        {errors.firstName && (
          <p style={{ color: "red" }}>{errors.firstName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="lastName">Last Name:</label>
        <input type="text" id="lastName" {...register("lastName")} />
        {errors.lastName && (
          <p style={{ color: "red" }}>{errors.lastName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phoneNumber">Phone number:</label>
        <input type="text" id="phoneNumber" {...register("phoneNumber")} />
        {errors.phoneNumber && (
          <p style={{ color: "red" }}>{errors.phoneNumber.message}</p>
        )}
      </div>

      <button type="button" onClick={handleNext}>
        Next page
      </button>
    </div>
  );
}
