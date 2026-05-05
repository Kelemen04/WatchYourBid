import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { useAuctionCreate } from "../../hooks/useAuctions";
import {
  AuctionSchema,
  type AuctionInput,
  type AuctionOutput,
} from "../../dto/auction.dto";
import { FormWrapper } from "../../components/ui/FormWrapper";
import { FormSelect } from "../../components/ui/FormSelect";
import { FormInput } from "../../components/ui/FormInput";

export default function CreateAuctionForm() {
  const methods = useForm<AuctionInput>({
    resolver: zodResolver(AuctionSchema),
    mode: "onTouched",
    defaultValues: {
      minBidIncrement: 1,
      watchItem: {
        hasBox: false,
        hasPapers: false,
        isOriginal: true,
      },
    },
  });

  const { setError, watch } = methods;
  const selectedCategory = watch("watchItem.category");

  const { mutate, isPending, isSuccess } = useAuctionCreate();

  const onSubmit: SubmitHandler<AuctionInput> = (data) => {
    const validatedData = data as unknown as AuctionOutput;
    mutate(validatedData, {
      onError: (err) => {
        const axiosError = err as AxiosError<{ error: string }>;
        const msg =
          axiosError?.response?.data?.error || "Something went wrong!";
        setError("root", { type: "server", message: msg });
      },
    });
  };

  if (isSuccess) {
    return (
      <div className="text-center p-10 bg-primary rounded-2xl border-2 border-green-500">
        <h2 className="text-2xl font-bold text-green-500 uppercase italic">
          Success!
        </h2>
        <p className="text-text-muted mt-4 font-bold">
          Auction created successfully!
        </p>
      </div>
    );
  }

  return (
    <FormWrapper<AuctionInput>
      methods={methods}
      onSubmit={onSubmit}
      className="max-w-2xl mx-auto p-8"
    >
      <div className="space-y-6">
        {methods.formState.errors.root && (
          <div className="bg-red-100 text-red-600 p-4 rounded-xl font-bold border-2 border-red-500">
            {methods.formState.errors.root.message}
          </div>
        )}

        {/* --- BASIC AUCTION INFO --- */}
        <FormInput<AuctionInput> label="Auction Title" name="title" />
        <FormInput<AuctionInput> label="Description" name="description" />

        <div className="grid grid-cols-2 gap-4">
          <FormSelect<AuctionInput>
            label="Auction Type"
            name="auctionType"
            options={["ENGLISH", "DUTCH", "VICKREY", "FPSB", "JAPANESE"]}
          />
          <FormInput<AuctionInput>
            label="Starting Price"
            name="startingPrice"
            type="number"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput<AuctionInput>
            label="Reserve Price"
            name="reservePrice"
            type="number"
          />
          <FormInput<AuctionInput>
            label="Buying Price"
            name="buyingPrice"
            type="number"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput<AuctionInput>
            label="Start Time"
            name="startTime"
            type="datetime-local"
          />
          <FormInput<AuctionInput>
            label="End Time"
            name="endTime"
            type="datetime-local"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 border-b pb-6">
          <FormInput<AuctionInput>
            label="Tick (Dutch)"
            name="tickInterval"
            type="number"
          />
          <FormInput<AuctionInput>
            label="Money (Dutch)"
            name="moneyInterval"
            type="number"
          />
          <FormInput<AuctionInput>
            label="Min Increment"
            name="minBidIncrement"
            type="number"
          />
        </div>

        <h3 className="font-bold uppercase italic border-l-4 border-black pl-2">
          Watch Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <FormInput<AuctionInput> label="Brand" name="watchItem.brand" />
          <FormInput<AuctionInput> label="Model" name="watchItem.model" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput<AuctionInput>
            label="Production Year"
            name="watchItem.productionYear"
            type="number"
          />
          <FormInput<AuctionInput> label="Material" name="watchItem.material" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput<AuctionInput>
            label="Condition"
            name="watchItem.condition"
          />
          <FormInput<AuctionInput>
            label="Weight (g)"
            name="watchItem.weight"
            type="number"
          />
        </div>

        <div className="flex gap-6 py-2">
          <FormInput<AuctionInput>
            label="Box"
            name="watchItem.hasBox"
            type="checkbox"
          />
          <FormInput<AuctionInput>
            label="Papers"
            name="watchItem.hasPapers"
            type="checkbox"
          />
          <FormInput<AuctionInput>
            label="Original"
            name="watchItem.isOriginal"
            type="checkbox"
          />
        </div>

        <FormSelect<AuctionInput>
          label="Category"
          name="watchItem.category"
          options={["WRISTWATCH", "POCKET_WATCH", "SMARTWATCH", "CLOCK"]}
        />

        {selectedCategory === "WRISTWATCH" && (
          <div className="bg-gray-50 p-4 rounded-xl space-y-4">
            <FormInput<AuctionInput>
              label="Movement"
              name="watchItem.wristwatch.movementType"
            />
            <FormInput<AuctionInput>
              label="Diameter (mm)"
              name="watchItem.wristwatch.caseDiameter"
              type="number"
            />
            <FormInput<AuctionInput>
              label="Water Resistance"
              name="watchItem.wristwatch.waterResistance"
            />
            <FormInput<AuctionInput>
              label="Strap Material"
              name="watchItem.wristwatch.strapMaterial"
            />
            <FormInput<AuctionInput>
              label="Glass Type"
              name="watchItem.wristwatch.glassType"
            />
          </div>
        )}

        {selectedCategory === "POCKETWATCH" && (
          <div className="bg-gray-50 p-4 rounded-xl space-y-4">
            <FormInput<AuctionInput>
              label="Case Type"
              name="watchItem.pocketWatch.caseType"
            />
            <FormInput<AuctionInput>
              label="Movement"
              name="watchItem.pocketWatch.movementType"
            />
            <FormInput<AuctionInput>
              label="Has Chain"
              name="watchItem.pocketWatch.hasChain"
              type="checkbox"
            />
            <FormInput<AuctionInput>
              label="Complications"
              name="watchItem.pocketWatch.complications"
            />
          </div>
        )}

        {selectedCategory === "SMARTWATCH" && (
          <div className="bg-gray-50 p-4 rounded-xl space-y-4">
            <FormInput<AuctionInput>
              label="OS"
              name="watchItem.smartwatch.os"
            />
            <FormInput<AuctionInput>
              label="Battery Life (h)"
              name="watchItem.smartwatch.batteryLife"
              type="number"
            />
            <FormInput<AuctionInput>
              label="Screen Type"
              name="watchItem.smartwatch.screenType"
            />
            <FormInput<AuctionInput>
              label="Sensors"
              name="watchItem.smartwatch.sensors"
            />
            <FormInput<AuctionInput>
              label="Compatibility"
              name="watchItem.smartwatch.compatibility"
            />
          </div>
        )}

        {selectedCategory === "CLOCK" && (
          <div className="bg-gray-50 p-4 rounded-xl space-y-4">
            <FormInput<AuctionInput>
              label="Clock Type"
              name="watchItem.clock.clockType"
            />
            <FormInput<AuctionInput>
              label="Power Source"
              name="watchItem.clock.powerSource"
            />
            <FormInput<AuctionInput>
              label="Chime Type"
              name="watchItem.clock.chimeType"
            />
            <FormInput<AuctionInput>
              label="Dimensions"
              name="watchItem.clock.dimensions"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full text-white bg-black hover:bg-gray-800 font-black uppercase italic rounded-2xl py-4 transition-all active:scale-95 disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create Auction"}
        </button>
      </div>
    </FormWrapper>
  );
}
