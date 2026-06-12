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
    const isValid = await trigger(["lastName", "firstName", "phoneNumber"]);
    if (isValid) setStep((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Fejléc - Fix */}
      <div className="mb-6 flex-shrink-0">
        <h2 className="font-playfair text-background font-bold text-4xl mb-2">
          Personal Information
        </h2>
        <p className="font-inter text-text-muted text-sm">
          Provide your basic contact details.
        </p>
      </div>

      {/* Görgethető tartalom */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col w-full">
            <label
              htmlFor="firstName"
              className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
            >
              First Name:
            </label>
            <input
              type="text"
              id="firstName"
              {...register("firstName")}
              className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.firstName ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1.5 font-bold">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className="flex flex-col w-full">
            <label
              htmlFor="lastName"
              className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
            >
              Last Name:
            </label>
            <input
              type="text"
              id="lastName"
              {...register("lastName")}
              className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.lastName ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1.5 font-bold">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col w-full">
          <label
            htmlFor="phoneNumber"
            className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
          >
            Phone Number:
          </label>
          <input
            type="text"
            id="phoneNumber"
            {...register("phoneNumber")}
            className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.phoneNumber ? "border-red-500" : "border-gray-200"}`}
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-xs mt-1.5 font-bold">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>
      </div>

      {/* Gomb - Fix alul */}
      <div className="mt-4 pt-4 flex justify-end flex-shrink-0 bg-white border-t border-gray-100">
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
