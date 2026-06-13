import { useFormContext } from "react-hook-form";
import type { AuctionInput } from "../../dto/auction.dto";

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

const formatDateForInput = (date: Date | string | undefined) => {
  if (!date) return "";
  const d = new Date(date);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
};

export default function CommonAuctionDataForm({ setStep }: Props) {
  const {
    register,
    trigger,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<AuctionInput>();

  const startTime = watch("startTime") as Date | string | undefined;
  const endTime = watch("endTime") as Date | string | undefined;

  const handleNext = async () => {
    const fieldsToValidate = [
      "title",
      "description",
      "startTime",
      "endTime",
    ] as const;
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Title */}
      <div className="mb-6 flex-shrink-0">
        <h2 className="font-playfair text-background font-bold text-4xl mb-2">
          General Information
        </h2>
        <p className="font-inter text-text-muted text-sm">
          Please provide the title, description, and timing for your auction.
        </p>
      </div>

      {/* FORM */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-5">
        <div className="flex flex-col w-full">
          <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
            Title:
          </label>
          <input
            type="text"
            {...register("title")}
            className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.title ? "border-red-500" : "border-gray-200"}`}
          />
          {errors.title && (
            <span className="text-red-500 text-xs mt-1.5 font-bold">
              {errors.title.message}
            </span>
          )}
        </div>

        <div className="flex flex-col w-full">
          <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
            Description:
          </label>
          <textarea
            {...register("description")}
            rows={4}
            className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors resize-none ${errors.description ? "border-red-500" : "border-gray-200"}`}
          />
          {errors.description && (
            <span className="text-red-500 text-xs mt-1.5 font-bold">
              {errors.description.message}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col w-full">
            <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
              Start Time:
            </label>
            <input
              type="datetime-local"
              value={formatDateForInput(startTime)}
              onChange={(e) => setValue("startTime", new Date(e.target.value))}
              className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.startTime ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.startTime && (
              <span className="text-red-500 text-xs mt-1.5 font-bold">
                {errors.startTime.message}
              </span>
            )}
          </div>

          <div className="flex flex-col w-full">
            <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
              End Time:
            </label>
            <input
              type="datetime-local"
              value={formatDateForInput(endTime)}
              onChange={(e) => setValue("endTime", new Date(e.target.value))}
              className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.endTime ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.endTime && (
              <span className="text-red-500 text-xs mt-1.5 font-bold">
                {errors.endTime.message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* GOMBOK - Fix */}
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
