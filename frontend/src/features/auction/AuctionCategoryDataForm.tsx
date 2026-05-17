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
    <>
      <div>
        <label>Movement Type:</label>
        <input type="text" {...register("watchItem.wristwatch.movementType")} />
      </div>
      <div>
        <label>Case Diameter (mm):</label>
        <input
          type="number"
          {...register("watchItem.wristwatch.caseDiameter", {
            valueAsNumber: true,
          })}
        />
        {errors.watchItem?.wristwatch?.caseDiameter && (
          <p style={{ color: "red" }}>
            {errors.watchItem.wristwatch.caseDiameter.message}
          </p>
        )}
      </div>
      <div>
        <label>Water Resistance:</label>
        <input
          type="text"
          {...register("watchItem.wristwatch.waterResistance")}
        />
      </div>
      <div>
        <label>Strap Material:</label>
        <input
          type="text"
          {...register("watchItem.wristwatch.strapMaterial")}
        />
      </div>
      <div>
        <label>Glass Type:</label>
        <input type="text" {...register("watchItem.wristwatch.glassType")} />
      </div>
    </>
  );
};

// --- POCKET WATCH ---
const PocketWatchFields = () => {
  const { register } = useFormContext<AuctionInput>();
  return (
    <>
      <div>
        <label>Case Type:</label>
        <input type="text" {...register("watchItem.pocketWatch.caseType")} />
      </div>
      <div>
        <label>Movement Type:</label>
        <input
          type="text"
          {...register("watchItem.pocketWatch.movementType")}
        />
      </div>
      <div>
        <label>Has Chain:</label>
        <input
          type="checkbox"
          {...register("watchItem.pocketWatch.hasChain")}
        />
      </div>
      <div>
        <label>Complications:</label>
        <input
          type="text"
          {...register("watchItem.pocketWatch.complications")}
        />
      </div>
    </>
  );
};

// --- SMARTWATCH ---
const SmartwatchFields = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<AuctionInput>();
  return (
    <>
      <div>
        <label>OS:</label>
        <input type="text" {...register("watchItem.smartwatch.os")} />
      </div>
      <div>
        <label>Battery Life (hours):</label>
        <input
          type="number"
          {...register("watchItem.smartwatch.batteryLife", {
            valueAsNumber: true,
          })}
        />
        {errors.watchItem?.smartwatch?.batteryLife && (
          <p style={{ color: "red" }}>
            {errors.watchItem.smartwatch.batteryLife.message}
          </p>
        )}
      </div>
      <div>
        <label>Screen Type:</label>
        <input type="text" {...register("watchItem.smartwatch.screenType")} />
      </div>
      <div>
        <label>Sensors:</label>
        <input type="text" {...register("watchItem.smartwatch.sensors")} />
      </div>
      <div>
        <label>Compatibility:</label>
        <input
          type="text"
          {...register("watchItem.smartwatch.compatibility")}
        />
      </div>
    </>
  );
};

// --- CLOCK ---
const ClockFields = () => {
  const { register } = useFormContext<AuctionInput>();
  return (
    <>
      <div>
        <label>Clock Type:</label>
        <input type="text" {...register("watchItem.clock.clockType")} />
      </div>
      <div>
        <label>Power Source:</label>
        <input type="text" {...register("watchItem.clock.powerSource")} />
      </div>
      <div>
        <label>Chime Type:</label>
        <input type="text" {...register("watchItem.clock.chimeType")} />
      </div>
      <div>
        <label>Dimensions:</label>
        <input type="text" {...register("watchItem.clock.dimensions")} />
      </div>
    </>
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
    <div className="form-step">
      <h1>Watch Item Data</h1>

      <div>
        <label>Brand:</label>
        <input type="text" {...register("watchItem.brand")} />
        {errors.watchItem?.brand && (
          <p style={{ color: "red" }}>{errors.watchItem.brand.message}</p>
        )}
      </div>

      <div>
        <label>Model:</label>
        <input type="text" {...register("watchItem.model")} />
        {errors.watchItem?.model && (
          <p style={{ color: "red" }}>{errors.watchItem.model.message}</p>
        )}
      </div>

      <div>
        <label>Production Year:</label>
        <input
          type="number"
          {...register("watchItem.productionYear", { valueAsNumber: true })}
        />
      </div>

      <div>
        <label>Material:</label>
        <input type="text" {...register("watchItem.material")} />
        {errors.watchItem?.material && (
          <p style={{ color: "red" }}>{errors.watchItem.material.message}</p>
        )}
      </div>

      <div>
        <label>Condition:</label>
        <input type="text" {...register("watchItem.condition")} />
        {errors.watchItem?.condition && (
          <p style={{ color: "red" }}>{errors.watchItem.condition.message}</p>
        )}
      </div>

      <div>
        <label>Weight(OPTIONAL):</label>
        <input
          type="number"
          {...register("watchItem.weight", { valueAsNumber: true })}
        />
      </div>

      <div>
        <label>Category:</label>
        <select {...register("watchItem.category")}>
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

      <hr />

      <div>
        <label>Original:</label>
        <input type="checkbox" {...register("watchItem.isOriginal")} />
      </div>
      <div>
        <label>Has Box:</label>
        <input type="checkbox" {...register("watchItem.hasBox")} />
      </div>
      <div>
        <label>Has Papers:</label>
        <input type="checkbox" {...register("watchItem.hasPapers")} />
      </div>

      <button type="button" onClick={() => setStep((p) => p - 1)}>
        Previous
      </button>
      <button type="button" onClick={handleNext}>
        Next
      </button>
    </div>
  );
}
