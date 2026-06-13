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
    const isValid = await trigger([
      "country",
      "region",
      "city",
      "street",
      "number",
      "zipCode",
    ]);
    if (isValid) setStep((prev) => prev + 1);
  };

  const selectedCountry = watch("country");
  const selectedRegion = watch("region");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-6 flex-shrink-0">
        <h2 className="font-playfair text-background font-bold text-4xl mb-2">
          Address Information
        </h2>
        <p className="font-inter text-text-muted text-sm">
          Give us your address.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col w-full">
            <label
              htmlFor="country"
              className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
            >
              Country:
            </label>
            <select
              id="country"
              {...register("country")}
              className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors bg-white ${errors.country ? "border-red-500" : "border-gray-200"}`}
            >
              <option value="">Select country</option>
              {Country.getAllCountries().map((c) => (
                <option key={c.isoCode} value={c.isoCode}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="text-red-500 text-xs mt-1.5 font-bold">
                {errors.country.message}
              </p>
            )}
          </div>

          <div className="flex flex-col w-full">
            <label
              htmlFor="region"
              className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
            >
              Region / State:
            </label>
            <select
              id="region"
              {...register("region")}
              disabled={!selectedCountry}
              className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors bg-white disabled:bg-gray-100 ${errors.region ? "border-red-500" : "border-gray-200"}`}
            >
              <option value="">Select region</option>
              {selectedCountry &&
                State.getStatesOfCountry(selectedCountry).map((r) => (
                  <option key={r.isoCode} value={r.isoCode}>
                    {r.name}
                  </option>
                ))}
            </select>
            {errors.region && (
              <p className="text-red-500 text-xs mt-1.5 font-bold">
                {errors.region.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col w-full">
            <label
              htmlFor="city"
              className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
            >
              City:
            </label>
            <select
              id="city"
              {...register("city")}
              disabled={!selectedRegion}
              className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors bg-white disabled:bg-gray-100 ${errors.city ? "border-red-500" : "border-gray-200"}`}
            >
              <option value="">Select city</option>
              {selectedCountry &&
                selectedRegion &&
                City.getCitiesOfState(selectedCountry, selectedRegion).map(
                  (ci) => (
                    <option key={ci.name} value={ci.name}>
                      {ci.name}
                    </option>
                  ),
                )}
            </select>
            {errors.city && (
              <p className="text-red-500 text-xs mt-1.5 font-bold">
                {errors.city.message}
              </p>
            )}
          </div>

          <div className="flex flex-col w-full">
            <label
              htmlFor="zipCode"
              className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
            >
              Zip Code:
            </label>
            <input
              type="text"
              id="zipCode"
              {...register("zipCode")}
              className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.zipCode ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.zipCode && (
              <p className="text-red-500 text-xs mt-1.5 font-bold">
                {errors.zipCode.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col w-full col-span-2">
            <label
              htmlFor="street"
              className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
            >
              Street:
            </label>
            <input
              type="text"
              id="street"
              {...register("street")}
              className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.street ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.street && (
              <p className="text-red-500 text-xs mt-1.5 font-bold">
                {errors.street.message}
              </p>
            )}
          </div>

          <div className="flex flex-col w-full">
            <label
              htmlFor="number"
              className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
            >
              House Number:
            </label>
            <input
              type="text"
              id="number"
              {...register("number")}
              className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.number ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.number && (
              <p className="text-red-500 text-xs mt-1.5 font-bold">
                {errors.number.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pb-2">
          <div className="flex flex-col w-full">
            <label
              htmlFor="building"
              className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
            >
              Building (Optional):
            </label>
            <input
              type="text"
              id="building"
              {...register("building")}
              className="w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors border-gray-200"
            />
          </div>
          <div className="flex flex-col w-full">
            <label
              htmlFor="floor"
              className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
            >
              Floor (Optional):
            </label>
            <input
              type="text"
              id="floor"
              {...register("floor")}
              className="w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors border-gray-200"
            />
          </div>
          <div className="flex flex-col w-full">
            <label
              htmlFor="apartment"
              className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
            >
              Apt (Optional):
            </label>
            <input
              type="text"
              id="apartment"
              {...register("apartment")}
              className="w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors border-gray-200"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 flex justify-between items-center flex-shrink-0 bg-white border-t border-gray-100">
        <button
          type="button"
          onClick={() => setStep((p) => p - 1)}
          className="text-text-muted hover:text-background font-bold tracking-widest uppercase text-sm transition-colors"
        >
          Go Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="text-white bg-background hover:bg-primary-hover font-bold tracking-widest uppercase rounded-xl text-sm px-8 py-3.5 transition-all"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}
