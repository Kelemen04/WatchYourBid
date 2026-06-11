import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import type { AuctionInput } from "../../dto/auction.dto";

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

const useNumberField = (name: keyof AuctionInput) => {
  const { watch, setValue } = useFormContext<AuctionInput>();
  const value = watch(name);
  return {
    value: (value as number) ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setValue(name, e.target.valueAsNumber),
  };
};

const EnglishFields = () => {
  const {
    formState: { errors },
  } = useFormContext<AuctionInput>();
  return (
    <div className="grid grid-cols-2 gap-5 mt-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
      <div className="flex flex-col w-full">
        <label
          htmlFor="startingPrice"
          className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
        >
          Starting Price:
        </label>
        <input
          type="number"
          id="startingPrice"
          {...useNumberField("startingPrice")}
          className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.startingPrice ? "border-red-500" : "border-gray-200"}`}
        />
        {errors.startingPrice && (
          <p className="text-red-500 text-xs mt-1.5 font-bold">
            {errors.startingPrice.message}
          </p>
        )}
      </div>
      <div className="flex flex-col w-full">
        <label
          htmlFor="minBidIncrement"
          className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
        >
          Minimum Bid Increment:
        </label>
        <input
          type="number"
          id="minBidIncrement"
          {...useNumberField("minBidIncrement")}
          className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.minBidIncrement ? "border-red-500" : "border-gray-200"}`}
        />
        {errors.minBidIncrement && (
          <p className="text-red-500 text-xs mt-1.5 font-bold">
            {errors.minBidIncrement.message}
          </p>
        )}
      </div>
      <div className="flex flex-col w-full">
        <label
          htmlFor="reservePrice"
          className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
        >
          Reserve Price:
        </label>
        <input
          type="number"
          id="reservePrice"
          {...useNumberField("reservePrice")}
          className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.reservePrice ? "border-red-500" : "border-gray-200"}`}
        />
        {errors.reservePrice && (
          <p className="text-red-500 text-xs mt-1.5 font-bold">
            {errors.reservePrice.message}
          </p>
        )}
      </div>
      <div className="flex flex-col w-full">
        <label
          htmlFor="buyingPrice"
          className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
        >
          Instant Buying Price:
        </label>
        <input
          type="number"
          id="buyingPrice"
          {...useNumberField("buyingPrice")}
          className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.buyingPrice ? "border-red-500" : "border-gray-200"}`}
        />
        {errors.buyingPrice && (
          <p className="text-red-500 text-xs mt-1.5 font-bold">
            {errors.buyingPrice.message}
          </p>
        )}
      </div>
    </div>
  );
};

const DutchFields = () => {
  const {
    formState: { errors },
  } = useFormContext<AuctionInput>();
  return (
    <div className="grid grid-cols-2 gap-5 mt-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
      <div className="flex flex-col w-full">
        <label
          htmlFor="startingPrice"
          className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
        >
          Starting Price:
        </label>
        <input
          type="number"
          id="startingPrice"
          {...useNumberField("startingPrice")}
          className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.startingPrice ? "border-red-500" : "border-gray-200"}`}
        />
        {errors.startingPrice && (
          <p className="text-red-500 text-xs mt-1.5 font-bold">
            {errors.startingPrice.message}
          </p>
        )}
      </div>
      <div className="flex flex-col w-full">
        <label
          htmlFor="tickInterval"
          className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
        >
          Price Drop Interval (seconds):
        </label>
        <input
          type="number"
          id="tickInterval"
          {...useNumberField("tickInterval")}
          className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.tickInterval ? "border-red-500" : "border-gray-200"}`}
        />
        {errors.tickInterval && (
          <p className="text-red-500 text-xs mt-1.5 font-bold">
            {errors.tickInterval.message}
          </p>
        )}
      </div>
      <div className="flex flex-col w-full">
        <label
          htmlFor="moneyInterval"
          className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
        >
          Price Drop Amount:
        </label>
        <input
          type="number"
          id="moneyInterval"
          {...useNumberField("moneyInterval")}
          className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.moneyInterval ? "border-red-500" : "border-gray-200"}`}
        />
        {errors.moneyInterval && (
          <p className="text-red-500 text-xs mt-1.5 font-bold">
            {errors.moneyInterval.message}
          </p>
        )}
      </div>
      <div className="flex flex-col w-full">
        <label
          htmlFor="reservePrice"
          className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
        >
          Minimum Price (Reserve):
        </label>
        <input
          type="number"
          id="reservePrice"
          {...useNumberField("reservePrice")}
          className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.reservePrice ? "border-red-500" : "border-gray-200"}`}
        />
        {errors.reservePrice && (
          <p className="text-red-500 text-xs mt-1.5 font-bold">
            {errors.reservePrice.message}
          </p>
        )}
      </div>
    </div>
  );
};

const JapaneseFields = () => {
  const {
    formState: { errors },
  } = useFormContext<AuctionInput>();
  return (
    <div className="grid grid-cols-2 gap-5 mt-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
      <div className="flex flex-col w-full">
        <label
          htmlFor="startingPrice"
          className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
        >
          Starting Price:
        </label>
        <input
          type="number"
          id="startingPrice"
          {...useNumberField("startingPrice")}
          className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.startingPrice ? "border-red-500" : "border-gray-200"}`}
        />
        {errors.startingPrice && (
          <p className="text-red-500 text-xs mt-1.5 font-bold">
            {errors.startingPrice.message}
          </p>
        )}
      </div>
      <div className="flex flex-col w-full">
        <label
          htmlFor="tickInterval"
          className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
        >
          Price Increase Interval (seconds):
        </label>
        <input
          type="number"
          id="tickInterval"
          {...useNumberField("tickInterval")}
          className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.tickInterval ? "border-red-500" : "border-gray-200"}`}
        />
        {errors.tickInterval && (
          <p className="text-red-500 text-xs mt-1.5 font-bold">
            {errors.tickInterval.message}
          </p>
        )}
      </div>
      <div className="flex flex-col w-full">
        <label
          htmlFor="moneyInterval"
          className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
        >
          Price Increase Amount:
        </label>
        <input
          type="number"
          id="moneyInterval"
          {...useNumberField("moneyInterval")}
          className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.moneyInterval ? "border-red-500" : "border-gray-200"}`}
        />
        {errors.moneyInterval && (
          <p className="text-red-500 text-xs mt-1.5 font-bold">
            {errors.moneyInterval.message}
          </p>
        )}
      </div>
      <div className="flex flex-col w-full">
        <label
          htmlFor="buyingPrice"
          className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
        >
          Instant Buying Price:
        </label>
        <input
          type="number"
          id="buyingPrice"
          {...useNumberField("buyingPrice")}
          className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.buyingPrice ? "border-red-500" : "border-gray-200"}`}
        />
        {errors.buyingPrice && (
          <p className="text-red-500 text-xs mt-1.5 font-bold">
            {errors.buyingPrice.message}
          </p>
        )}
      </div>
    </div>
  );
};

const VickreyFields = () => {
  const {
    formState: { errors },
  } = useFormContext<AuctionInput>();
  return (
    <div className="grid grid-cols-2 gap-5 mt-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
      <div className="flex flex-col w-full">
        <label
          htmlFor="reservePrice"
          className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
        >
          Reserve Price:
        </label>
        <input
          type="number"
          id="reservePrice"
          {...useNumberField("reservePrice")}
          className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.reservePrice ? "border-red-500" : "border-gray-200"}`}
        />
        {errors.reservePrice && (
          <p className="text-red-500 text-xs mt-1.5 font-bold">
            {errors.reservePrice.message}
          </p>
        )}
      </div>
      <div className="flex flex-col w-full">
        <label
          htmlFor="buyingPrice"
          className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
        >
          Instant Buying Price:
        </label>
        <input
          type="number"
          id="buyingPrice"
          {...useNumberField("buyingPrice")}
          className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.buyingPrice ? "border-red-500" : "border-gray-200"}`}
        />
        {errors.buyingPrice && (
          <p className="text-red-500 text-xs mt-1.5 font-bold">
            {errors.buyingPrice.message}
          </p>
        )}
      </div>
    </div>
  );
};

const FpsbFields = () => {
  const {
    formState: { errors },
  } = useFormContext<AuctionInput>();
  return (
    <div className="grid grid-cols-2 gap-5 mt-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
      <div className="flex flex-col w-full">
        <label
          htmlFor="reservePrice"
          className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
        >
          Reserve Price:
        </label>
        <input
          type="number"
          id="reservePrice"
          {...useNumberField("reservePrice")}
          className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.reservePrice ? "border-red-500" : "border-gray-200"}`}
        />
        {errors.reservePrice && (
          <p className="text-red-500 text-xs mt-1.5 font-bold">
            {errors.reservePrice.message}
          </p>
        )}
      </div>
      <div className="flex flex-col w-full">
        <label
          htmlFor="buyingPrice"
          className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
        >
          Instant Buying Price:
        </label>
        <input
          type="number"
          id="buyingPrice"
          {...useNumberField("buyingPrice")}
          className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors ${errors.buyingPrice ? "border-red-500" : "border-gray-200"}`}
        />
        {errors.buyingPrice && (
          <p className="text-red-500 text-xs mt-1.5 font-bold">
            {errors.buyingPrice.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default function AuctionTypeDataForm({ setStep }: Props) {
  const {
    register,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<AuctionInput>();

  const selectedType = watch("auctionType");

  useEffect(() => {
    switch (selectedType) {
      case "VICKREY":
      case "FPSB":
        setValue("startingPrice", 0);
        setValue("tickInterval", undefined);
        setValue("moneyInterval", undefined);
        setValue("minBidIncrement", undefined);
        break;
      case "ENGLISH":
        setValue("tickInterval", undefined);
        setValue("moneyInterval", undefined);
        setValue("isAscending", undefined);
        break;
      case "DUTCH":
        setValue("minBidIncrement", undefined);
        setValue("buyingPrice", undefined);
        setValue("isAscending", undefined);
        break;
      case "JAPANESE":
        setValue("minBidIncrement", undefined);
        setValue("reservePrice", undefined);
        break;
    }
  }, [selectedType, setValue]);

  const handleNext = async () => {
    const fieldsByAuctionType = {
      ENGLISH: [
        "startingPrice",
        "minBidIncrement",
        "reservePrice",
        "buyingPrice",
      ],
      DUTCH: ["startingPrice", "tickInterval", "moneyInterval", "reservePrice"],
      JAPANESE: [
        "startingPrice",
        "tickInterval",
        "moneyInterval",
        "buyingPrice",
      ],
      VICKREY: ["reservePrice", "buyingPrice"],
      FPSB: ["reservePrice", "buyingPrice"],
    } as const;

    const specificFields =
      fieldsByAuctionType[selectedType as keyof typeof fieldsByAuctionType] ||
      [];
    const isValid = await trigger(specificFields);
    if (isValid) setStep((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-6 flex-shrink-0">
        <h2 className="font-playfair text-background font-bold text-4xl mb-2">
          Auction Settings
        </h2>
        <p className="font-inter text-text-muted text-sm">
          Select the type of auction and configure pricing rules.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="flex flex-col w-full mb-2">
          <label
            htmlFor="selectType"
            className="text-left font-inter text-text-muted text-xs font-bold tracking-widest uppercase mb-1.5"
          >
            Select type:
          </label>
          <select
            id="selectType"
            {...register("auctionType")}
            className={`w-full border-2 rounded-xl p-3 text-black focus:outline-none focus:border-primary transition-colors bg-white ${errors.auctionType ? "border-red-500" : "border-gray-200"}`}
          >
            <option value="ENGLISH">English</option>
            <option value="DUTCH">Dutch</option>
            <option value="VICKREY">Vickrey</option>
            <option value="FPSB">FPSB</option>
            <option value="JAPANESE">Japanese</option>
          </select>
          {errors.auctionType && (
            <p className="text-red-500 text-xs mt-1.5 font-bold">
              {errors.auctionType.message}
            </p>
          )}
        </div>
        {selectedType === "ENGLISH" && <EnglishFields />}
        {selectedType === "DUTCH" && <DutchFields />}
        {selectedType === "VICKREY" && <VickreyFields />}
        {selectedType === "FPSB" && <FpsbFields />}
        {selectedType === "JAPANESE" && <JapaneseFields />}
      </div>
      <div className="mt-4 pt-4 flex justify-between items-center flex-shrink-0 bg-white border-t border-gray-100">
        <button
          type="button"
          onClick={() => setStep((prev) => prev - 1)}
          className="text-text-muted hover:text-background font-bold tracking-widest uppercase text-sm transition-colors"
        >
          Previous page
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="text-white bg-background hover:bg-primary-hover font-bold tracking-widest uppercase rounded-xl text-sm px-8 py-3.5 transition-all"
        >
          Next page
        </button>
      </div>
    </div>
  );
}
