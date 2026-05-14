import { useFormContext } from "react-hook-form";
import type { BuyerRegisterDTO, SellerRegisterDTO } from "../../dto/user.dto";
import { Country, State, City } from "country-state-city";

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

export default function AddressDataForm({ setStep }: Props) {
  const {
    register,
    trigger,
    watch,
    formState: { errors },
  } = useFormContext<BuyerRegisterDTO | SellerRegisterDTO>();

  const handleNext = async () => {
    const fieldsToValidate = [
      "country",
      "region",
      "city",
      "street",
      "number",
      "zipCode",
    ] as const;

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const selectedCountry = watch("country");
  const selectedRegion = watch("region");

  return (
    <div className="form-step">
      <h1>Address Information</h1>

      <div>
        <label htmlFor="country">Country:</label>
        <select id="country" {...register("country")}>
          <option value="">Select country</option>
          {Country.getAllCountries().map((c) => (
            <option key={c.isoCode} value={c.isoCode}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.country && (
          <p style={{ color: "red" }}>{errors.country.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="region">Region / State:</label>
        <select id="region" {...register("region")}>
          <option value="">Select region</option>
          {State.getStatesOfCountry(selectedCountry).map((r) => (
            <option key={r.isoCode} value={r.isoCode}>
              {r.name}
            </option>
          ))}
        </select>
        {errors.region && (
          <p style={{ color: "red" }}>{errors.region.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="city">City:</label>
        <select id="city" {...register("city")}>
          <option value="">Select region</option>
          {City.getCitiesOfState(selectedCountry, selectedRegion).map((ci) => (
            <option key={ci.name} value={ci.name}>
              {ci.name}
            </option>
          ))}
        </select>
        {errors.city && <p style={{ color: "red" }}>{errors.city.message}</p>}
      </div>

      <div>
        <label htmlFor="zipCode">Zip Code:</label>
        <input type="text" id="zipCode" {...register("zipCode")} />
        {errors.zipCode && (
          <p style={{ color: "red" }}>{errors.zipCode.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="street">Street:</label>
        <input type="text" id="street" {...register("street")} />
        {errors.street && (
          <p style={{ color: "red" }}>{errors.street.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="number">House Number:</label>
        <input type="text" id="number" {...register("number")} />
        {errors.number && (
          <p style={{ color: "red" }}>{errors.number.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="building">Building (Optional):</label>
        <input type="text" id="building" {...register("building")} />
      </div>

      <div>
        <label htmlFor="floor">Floor (Optional):</label>
        <input type="text" id="floor" {...register("floor")} />
      </div>

      <div>
        <label htmlFor="apartment">Apartment (Optional):</label>
        <input type="text" id="apartment" {...register("apartment")} />
      </div>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button type="button" onClick={() => setStep((prev) => prev - 1)}>
          Back
        </button>
        <button type="button" onClick={handleNext}>
          Next page
        </button>
      </div>
    </div>
  );
}
