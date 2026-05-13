import { useFormContext } from "react-hook-form";
import type { AuctionInput } from "../../dto/auction.dto";

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

const EnglishFields = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<AuctionInput>();
  return (
    <>
      <div>
        <label htmlFor="minBidIncrement">Minimum Bid Increment:</label>
        <input
          type="number"
          id="minBidIncrement"
          {...register("minBidIncrement", { valueAsNumber: true })}
        />
        {errors.minBidIncrement && (
          <p style={{ color: "red" }}>{errors.minBidIncrement.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="reservePrice">Reserve Price:</label>
        <input
          type="number"
          id="reservePrice"
          {...register("reservePrice", { valueAsNumber: true })}
        />
        {errors.reservePrice && (
          <p style={{ color: "red" }}>{errors.reservePrice.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="buyingPrice">Instant Buying Price:</label>
        <input
          type="number"
          id="buyingPrice"
          {...register("buyingPrice", { valueAsNumber: true })}
        />
        {errors.buyingPrice && (
          <p style={{ color: "red" }}>{errors.buyingPrice.message}</p>
        )}
      </div>
    </>
  );
};

// --- DUTCH ---
const DutchFields = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<AuctionInput>();
  return (
    <>
      <div>
        <label htmlFor="tickInterval">Price Drop Interval (seconds):</label>
        <input
          type="number"
          id="tickInterval"
          {...register("tickInterval", { valueAsNumber: true })}
        />
        {errors.tickInterval && (
          <p style={{ color: "red" }}>{errors.tickInterval.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="moneyInterval">Price Drop Amount:</label>
        <input
          type="number"
          id="moneyInterval"
          {...register("moneyInterval", { valueAsNumber: true })}
        />
        {errors.moneyInterval && (
          <p style={{ color: "red" }}>{errors.moneyInterval.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="reservePrice">Minimum Price (Reserve):</label>
        <input
          type="number"
          id="reservePrice"
          {...register("reservePrice", { valueAsNumber: true })}
        />
        {errors.reservePrice && (
          <p style={{ color: "red" }}>{errors.reservePrice.message}</p>
        )}
      </div>
    </>
  );
};

// --- JAPANESE ---
const JapaneseFields = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<AuctionInput>();
  return (
    <>
      <div>
        <label htmlFor="tickInterval">Price Increase Interval (seconds):</label>
        <input
          type="number"
          id="tickInterval"
          {...register("tickInterval", { valueAsNumber: true })}
        />
        {errors.tickInterval && (
          <p style={{ color: "red" }}>{errors.tickInterval.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="moneyInterval">Price Increase Amount:</label>
        <input
          type="number"
          id="moneyInterval"
          {...register("moneyInterval", { valueAsNumber: true })}
        />
        {errors.moneyInterval && (
          <p style={{ color: "red" }}>{errors.moneyInterval.message}</p>
        )}
      </div>
    </>
  );
};

// --- VICKREY (Sealed Bid) ---
const VickreyFields = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<AuctionInput>();
  return (
    <>
      <div>
        <label htmlFor="reservePrice">Reserve Price:</label>
        <input
          type="number"
          id="reservePrice"
          {...register("reservePrice", { valueAsNumber: true })}
        />
        {errors.reservePrice && (
          <p style={{ color: "red" }}>{errors.reservePrice.message}</p>
        )}
      </div>
    </>
  );
};

// --- FPSB (First Price Sealed Bid) ---
const FpsbFields = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<AuctionInput>();
  return (
    <>
      <div>
        <label htmlFor="reservePrice">Reserve Price:</label>
        <input
          type="number"
          id="reservePrice"
          {...register("reservePrice", { valueAsNumber: true })}
        />
        {errors.reservePrice && (
          <p style={{ color: "red" }}>{errors.reservePrice.message}</p>
        )}
      </div>
    </>
  );
};

export default function AuctionTypeDataForm({ setStep }: Props) {
  const {
    register,
    trigger,
    watch,
    formState: { errors },
  } = useFormContext<AuctionInput>();

  const selectedType = watch("auctionType");

  const handleNext = async () => {
    const fieldsByAuctionType = {
      ENGLISH: ["minBidIncrement", "reservePrice", "buyingPrice"],
      DUTCH: ["tickInterval", "moneyInterval", "reservePrice"],
      JAPANESE: ["tickInterval", "moneyInterval"],
      VICKREY: ["reservePrice"],
      FPSB: ["reservePrice"],
    } as const;

    const currentType = watch("auctionType");
    const specificFields =
      fieldsByAuctionType[currentType as keyof typeof fieldsByAuctionType] ||
      [];

    const isValid = await trigger(specificFields);

    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevious = async () => {
    setStep((prev) => prev - 1);
  };

  return (
    <div className="form-step">
      <h1>Auction Type Data</h1>

      <div>
        <label htmlFor="selectType">Select type:</label>
        <select id="selectType" {...register("auctionType")}>
          <option value="ENGLISH">English</option>
          <option value="DUTCH">Dutch</option>
          <option value="VICKREY">Vickrey</option>
          <option value="FPSB">FPSB</option>
          <option value="JAPANESE">Japanese</option>
        </select>
        {errors.auctionType && <p>{errors.auctionType.message}</p>}
      </div>

      {selectedType === "ENGLISH" && <EnglishFields />}
      {selectedType === "DUTCH" && <DutchFields />}
      {selectedType === "VICKREY" && <VickreyFields />}
      {selectedType === "FPSB" && <FpsbFields />}
      {selectedType === "JAPANESE" && <JapaneseFields />}

      <button type="button" onClick={handlePrevious}>
        Previous page
      </button>

      <button type="button" onClick={handleNext}>
        Next page
      </button>
    </div>
  );
}
