import { useFormContext } from "react-hook-form";
import type { SellerRegisterDTO } from "../../dto/user.dto";

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

export default function GeneralSellerData({ setStep }: Props) {
  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext<SellerRegisterDTO>();

  const handleNext = async () => {
    const fieldsToValidate = [
      "lastName",
      "firstName",
      "phoneNumber",
      "description",
    ] as const;
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  return (
    <div className="form-step">
      <h1>Seller Details</h1>

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

      <div>
        <label htmlFor="description">Shop / Seller Description:</label>
        <textarea
          id="description"
          {...register("description")}
          placeholder="Tell us about what you sell (min. 50 characters)..."
          rows={5}
        />
        {errors.description && (
          <p style={{ color: "red" }}>{errors.description.message}</p>
        )}
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <button type="button" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
}
