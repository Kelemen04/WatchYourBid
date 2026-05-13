import { FormProvider, useForm } from "react-hook-form";
import CommonAuctionDataForm from "../features/auction/CommonAuctionDataForm";
import { useAuctionCreate } from "../hooks/useAuctions";
import { AuctionSchema, type AuctionInput } from "../dto/auction.dto";
import type { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import AuctionTypeDataForm from "../features/auction/AuctionTypeDataForm";
import AuctionCategoryDataForm from "../features/auction/AuctionCategoryDataForm";
import AuctionPhotoDataForm from "../features/auction/AuctionPhotoDataForm";

export default function CreateAuctionPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { mutate } = useAuctionCreate();

  const methods = useForm<AuctionInput>({
    resolver: zodResolver(AuctionSchema),
    mode: "onTouched",
  });

  const onSubmit = (data: AuctionInput) => {
    mutate(
      { auctionData: data, images: selectedFiles },
      {
        onError: (err) => {
          const serverError = err as AxiosError<{ error: string }>;
          const msg = serverError?.response?.data?.error;

          methods.setError("root", {
            type: "server",
            message: msg,
          });
        },
      },
    );
  };

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
          {currentPage === 1 && (
            <CommonAuctionDataForm setStep={setCurrentPage} />
          )}
          {currentPage === 2 && (
            <AuctionTypeDataForm setStep={setCurrentPage} />
          )}
          {currentPage === 3 && (
            <AuctionCategoryDataForm setStep={setCurrentPage} />
          )}
          {currentPage === 4 && (
            <AuctionPhotoDataForm
              files={selectedFiles}
              setFiles={setSelectedFiles}
              setStep={setCurrentPage}
            />
          )}
        </form>
      </FormProvider>
    </>
  );
}
