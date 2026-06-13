import { useFormContext } from "react-hook-form";
import type { AuctionInput } from "../../dto/auction.dto";
import { useEffect } from "react";

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

// --- WRISTWATCH ---
const WristwatchFields = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<AuctionInput>();

  return (
    <div className="grid grid-cols-2 gap-5 mt-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
      <div className="flex flex-col w-full">
        <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
          Movement Type:
        </label>
        <input
          type="text"
          {...register("watchItem.wristwatch.movementType")}
          className="w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors border-gray-200"
        />
      </div>
      <div className="flex flex-col w-full">
        <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
          Case Diameter (mm):
        </label>
        <input
          type="number"
          {...register("watchItem.wristwatch.caseDiameter", {
            valueAsNumber: true,
          })}
          className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.watchItem?.wristwatch?.caseDiameter ? "border-red-500" : "border-gray-200"}`}
        />
        {errors.watchItem?.wristwatch?.caseDiameter && (
          <p className="text-red-500 text-xs mt-1.5 font-bold">
            {errors.watchItem.wristwatch.caseDiameter.message}
          </p>
        )}
      </div>
      <div className="flex flex-col w-full">
        <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
          Water Resistance:
        </label>
        <input
          type="text"
          {...register("watchItem.wristwatch.waterResistance")}
          className="w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors border-gray-200"
        />
      </div>
      <div className="flex flex-col w-full">
        <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
          Strap Material:
        </label>
        <input
          type="text"
          {...register("watchItem.wristwatch.strapMaterial")}
          className="w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors border-gray-200"
        />
      </div>
      <div className="flex flex-col w-full col-span-2">
        <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
          Glass Type:
        </label>
        <input
          type="text"
          {...register("watchItem.wristwatch.glassType")}
          className="w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors border-gray-200"
        />
      </div>
    </div>
  );
};

// --- POCKET WATCH ---
const PocketWatchFields = () => {
  const { register } = useFormContext<AuctionInput>();
  return (
    <div className="grid grid-cols-2 gap-5 mt-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
      <div className="flex flex-col w-full">
        <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
          Case Type:
        </label>
        <input
          type="text"
          {...register("watchItem.pocketWatch.caseType")}
          className="w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors border-gray-200"
        />
      </div>
      <div className="flex flex-col w-full">
        <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
          Movement Type:
        </label>
        <input
          type="text"
          {...register("watchItem.pocketWatch.movementType")}
          className="w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors border-gray-200"
        />
      </div>
      <div className="flex flex-col w-full col-span-2">
        <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
          Complications:
        </label>
        <input
          type="text"
          {...register("watchItem.pocketWatch.complications")}
          className="w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors border-gray-200"
        />
      </div>
      <div className="flex items-center gap-3 mt-2 col-span-2">
        <input
          type="checkbox"
          id="hasChain"
          {...register("watchItem.pocketWatch.hasChain")}
          className="w-5 h-5 accent-background rounded cursor-pointer"
        />
        <label
          htmlFor="hasChain"
          className="font-inter text-sm font-bold text-text-muted cursor-pointer"
        >
          Has Chain
        </label>
      </div>
    </div>
  );
};

// --- SMARTWATCH ---
const SmartwatchFields = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<AuctionInput>();
  return (
    <div className="grid grid-cols-2 gap-5 mt-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
      <div className="flex flex-col w-full">
        <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
          OS:
        </label>
        <input
          type="text"
          {...register("watchItem.smartwatch.os")}
          className="w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors border-gray-200"
        />
      </div>
      <div className="flex flex-col w-full">
        <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
          Battery Life (hours):
        </label>
        <input
          type="number"
          {...register("watchItem.smartwatch.batteryLife", {
            valueAsNumber: true,
          })}
          className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.watchItem?.smartwatch?.batteryLife ? "border-red-500" : "border-gray-200"}`}
        />
        {errors.watchItem?.smartwatch?.batteryLife && (
          <p className="text-red-500 text-xs mt-1.5 font-bold">
            {errors.watchItem.smartwatch.batteryLife.message}
          </p>
        )}
      </div>
      <div className="flex flex-col w-full">
        <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
          Screen Type:
        </label>
        <input
          type="text"
          {...register("watchItem.smartwatch.screenType")}
          className="w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors border-gray-200"
        />
      </div>
      <div className="flex flex-col w-full">
        <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
          Sensors:
        </label>
        <input
          type="text"
          {...register("watchItem.smartwatch.sensors")}
          className="w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors border-gray-200"
        />
      </div>
      <div className="flex flex-col w-full col-span-2">
        <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
          Compatibility:
        </label>
        <input
          type="text"
          {...register("watchItem.smartwatch.compatibility")}
          className="w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors border-gray-200"
        />
      </div>
    </div>
  );
};

// --- CLOCK ---
const ClockFields = () => {
  const { register } = useFormContext<AuctionInput>();
  return (
    <div className="grid grid-cols-2 gap-5 mt-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
      <div className="flex flex-col w-full">
        <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
          Clock Type:
        </label>
        <input
          type="text"
          {...register("watchItem.clock.clockType")}
          className="w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors border-gray-200"
        />
      </div>
      <div className="flex flex-col w-full">
        <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
          Power Source:
        </label>
        <input
          type="text"
          {...register("watchItem.clock.powerSource")}
          className="w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors border-gray-200"
        />
      </div>
      <div className="flex flex-col w-full">
        <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
          Chime Type:
        </label>
        <input
          type="text"
          {...register("watchItem.clock.chimeType")}
          className="w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors border-gray-200"
        />
      </div>
      <div className="flex flex-col w-full">
        <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
          Dimensions:
        </label>
        <input
          type="text"
          {...register("watchItem.clock.dimensions")}
          className="w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors border-gray-200"
        />
      </div>
    </div>
  );
};

export default function AuctionCategoryDataForm({ setStep }: Props) {
  const {
    register,
    trigger,
    watch,
    formState: { errors },
    unregister,
  } = useFormContext<AuctionInput>();

  const selectedCategory = watch("watchItem.category");

  useEffect(() => {
    if (selectedCategory !== "WRISTWATCH") unregister("watchItem.wristwatch");
    if (selectedCategory !== "POCKETWATCH") unregister("watchItem.pocketWatch");
    if (selectedCategory !== "SMARTWATCH") unregister("watchItem.smartwatch");
    if (selectedCategory !== "CLOCK") unregister("watchItem.clock");
  }, [selectedCategory, unregister]);

  const handleNext = async () => {
    const fieldsByCategory = {
      WRISTWATCH: [
        "watchItem.brand",
        "watchItem.model",
        "watchItem.material",
        "watchItem.condition",
        "watchItem.category",
        "watchItem.wristwatch",
      ],
      POCKETWATCH: [
        "watchItem.brand",
        "watchItem.model",
        "watchItem.material",
        "watchItem.condition",
        "watchItem.category",
        "watchItem.pocketWatch",
      ],
      SMARTWATCH: [
        "watchItem.brand",
        "watchItem.model",
        "watchItem.material",
        "watchItem.condition",
        "watchItem.category",
        "watchItem.smartwatch",
      ],
      CLOCK: [
        "watchItem.brand",
        "watchItem.model",
        "watchItem.material",
        "watchItem.condition",
        "watchItem.category",
        "watchItem.clock",
      ],
    } as const;

    const category = watch("watchItem.category");
    const fields =
      fieldsByCategory[category as keyof typeof fieldsByCategory] || [];
    const isValid = await trigger(fields);

    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      {/* Title */}
      <div className="mb-6 flex-shrink-0">
        <h2 className="font-playfair text-background font-bold text-4xl mb-2">
          Watch Item Data
        </h2>
        <p className="font-inter text-text-muted text-sm">
          Provide specific details about the watch structure and model.
        </p>
      </div>

      {/* FORM */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col w-full">
            <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
              Brand:
            </label>
            <input
              type="text"
              {...register("watchItem.brand")}
              className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.watchItem?.brand ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.watchItem?.brand && (
              <p className="text-red-500 text-xs mt-1.5 font-bold">
                {errors.watchItem.brand.message}
              </p>
            )}
          </div>

          <div className="flex flex-col w-full">
            <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
              Model:
            </label>
            <input
              type="text"
              {...register("watchItem.model")}
              className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.watchItem?.model ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.watchItem?.model && (
              <p className="text-red-500 text-xs mt-1.5 font-bold">
                {errors.watchItem.model.message}
              </p>
            )}
          </div>

          <div className="flex flex-col w-full">
            <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
              Production Year:
            </label>
            <input
              type="number"
              {...register("watchItem.productionYear", { valueAsNumber: true })}
              className="w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors border-gray-200"
            />
          </div>

          <div className="flex flex-col w-full">
            <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
              Material:
            </label>
            <input
              type="text"
              {...register("watchItem.material")}
              className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.watchItem?.material ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.watchItem?.material && (
              <p className="text-red-500 text-xs mt-1.5 font-bold">
                {errors.watchItem.material.message}
              </p>
            )}
          </div>

          <div className="flex flex-col w-full">
            <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
              Condition:
            </label>
            <input
              type="text"
              {...register("watchItem.condition")}
              className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.watchItem?.condition ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.watchItem?.condition && (
              <p className="text-red-500 text-xs mt-1.5 font-bold">
                {errors.watchItem.condition.message}
              </p>
            )}
          </div>

          <div className="flex flex-col w-full">
            <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
              Weight (OPTIONAL):
            </label>
            <input
              type="number"
              {...register("watchItem.weight", { valueAsNumber: true })}
              className="w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors border-gray-200"
            />
          </div>
        </div>

        {/* KCategories */}
        <div className="flex flex-col w-full mt-5">
          <label className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5">
            Category:
          </label>
          <select
            {...register("watchItem.category")}
            className="w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors bg-white border-gray-200"
          >
            <option value="WRISTWATCH">Wristwatch</option>
            <option value="POCKETWATCH">Pocket Watch</option>
            <option value="SMARTWATCH">Smartwatch</option>
            <option value="CLOCK">Clock</option>
          </select>
        </div>

        {selectedCategory === "WRISTWATCH" && <WristwatchFields />}
        {selectedCategory === "POCKETWATCH" && <PocketWatchFields />}
        {selectedCategory === "SMARTWATCH" && <SmartwatchFields />}
        {selectedCategory === "CLOCK" && <ClockFields />}

        {/* More data */}
        <div className="flex gap-6 mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100 justify-center mb-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isOriginal"
              {...register("watchItem.isOriginal")}
              className="w-5 h-5 accent-background rounded cursor-pointer"
            />
            <label
              htmlFor="isOriginal"
              className="font-inter text-sm font-bold text-text-muted cursor-pointer"
            >
              Original
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasBox"
              {...register("watchItem.hasBox")}
              className="w-5 h-5 accent-background rounded cursor-pointer"
            />
            <label
              htmlFor="hasBox"
              className="font-inter text-sm font-bold text-text-muted cursor-pointer"
            >
              Has Box
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasPapers"
              {...register("watchItem.hasPapers")}
              className="w-5 h-5 accent-background rounded cursor-pointer"
            />
            <label
              htmlFor="hasPapers"
              className="font-inter text-sm font-bold text-text-muted cursor-pointer"
            >
              Has Papers
            </label>
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
