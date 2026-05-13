import { useFormContext } from "react-hook-form";
import type { AuctionInput } from "../../dto/auction.dto";

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

export default function CommonAuctionDataForm({ setStep }: Props) {
  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext<AuctionInput>();

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
    <div className="form-step">
      <h1>Auction Data</h1>

      <div>
        <label htmlFor="startTime">Auction start:</label>
        <input
          type="datetime-local"
          id="startTime"
          {...register("startTime")}
        />
        {errors.startTime && (
          <p style={{ color: "red" }}>{errors.startTime.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="endTime">Auction end:</label>
        <input type="datetime-local" id="endTime" {...register("endTime")} />
        {errors.endTime && <p>{errors.endTime.message}</p>}
      </div>

      <div>
        <label htmlFor="title">Cím:</label>
        <input
          type="text"
          id="title"
          {...register("title")}
          placeholder="Title..."
        />
        {errors.title && <p>{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          {...register("description")}
          placeholder="Description..."
        />
        {errors.description && <p>{errors.description.message}</p>}
      </div>

      <button type="button" onClick={handleNext}>
        Next page
      </button>
    </div>
  );
}
