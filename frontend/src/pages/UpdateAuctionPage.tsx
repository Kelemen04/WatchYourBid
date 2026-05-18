import { FormProvider, useForm } from "react-hook-form";
import CommonAuctionDataForm from "../features/auction/CommonAuctionDataForm";
import { useAuctionData, useAuctionUpdate } from "../hooks/useAuctions";
import { AuctionSchema, type AuctionInput } from "../dto/auction.dto";
import type { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import AuctionTypeDataForm from "../features/auction/AuctionTypeDataForm";
import AuctionCategoryDataForm from "../features/auction/AuctionCategoryDataForm";
import AuctionPhotoDataForm from "../features/auction/AuctionPhotoDataForm";
import { useParams } from "react-router-dom";

export default function UpdateAuctionPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { id } = useParams<{ id: string }>();
  const auctionId = Number(id);

  const { data: auction, isLoading } = useAuctionData(auctionId);

  const { mutate } = useAuctionUpdate(auctionId);

  const methods = useForm<AuctionInput>({
    resolver: zodResolver(AuctionSchema),
    mode: "onTouched",
    values: auction
      ? {
          title: auction.title,
          description: auction.description,
          startTime: new Date(auction.startTime),
          endTime: new Date(auction.endTime),
          startingPrice: auction.startingPrice,
          auctionType: auction.auctionType,
          reservePrice: auction.reservePrice ?? undefined,
          buyingPrice: auction.buyingPrice ?? undefined,
          tickInterval: auction.tickInterval ?? undefined,
          moneyInterval: auction.moneyInterval ?? undefined,
          watchItem: auction.watchItem
            ? {
                brand: auction.watchItem.brand,
                model: auction.watchItem.model,
                material: auction.watchItem.material,
                condition: auction.watchItem.condition,
                category: auction.watchItem.category,
                productionYear: auction.watchItem.productionYear ?? undefined,
                weight: auction.watchItem.weight ?? undefined,
                hasBox: auction.watchItem.hasBox,
                hasPapers: auction.watchItem.hasPapers,
                isOriginal: auction.watchItem.isOriginal,

                wristwatch: auction.watchItem.wristwatch
                  ? {
                      movementType: auction.watchItem.wristwatch.movementType,
                      caseDiameter: auction.watchItem.wristwatch.caseDiameter,
                      waterResistance:
                        auction.watchItem.wristwatch.waterResistance,
                      strapMaterial: auction.watchItem.wristwatch.strapMaterial,
                      glassType: auction.watchItem.wristwatch.glassType,
                    }
                  : undefined,

                pocketWatch: auction.watchItem.pocketWatch
                  ? {
                      caseType: auction.watchItem.pocketWatch.caseType,
                      movementType: auction.watchItem.pocketWatch.movementType,
                      hasChain: auction.watchItem.pocketWatch.hasChain,
                      complications:
                        auction.watchItem.pocketWatch.complications ??
                        undefined,
                    }
                  : undefined,

                smartwatch: auction.watchItem.smartwatch
                  ? {
                      os: auction.watchItem.smartwatch.os,
                      batteryLife: auction.watchItem.smartwatch.batteryLife,
                      screenType: auction.watchItem.smartwatch.screenType,
                      sensors: auction.watchItem.smartwatch.sensors,
                      compatibility: auction.watchItem.smartwatch.compatibility,
                    }
                  : undefined,

                clock: auction.watchItem.clock
                  ? {
                      clockType: auction.watchItem.clock.clockType,
                      powerSource: auction.watchItem.clock.powerSource,
                      dimensions: auction.watchItem.clock.dimensions,
                      chimeType: auction.watchItem.clock.chimeType ?? undefined,
                    }
                  : undefined,
              }
            : undefined,
        }
      : undefined,
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

  if (isLoading) {
    return (
      <div className="text-center py-20 font-bold text-xl">
        Loading auction data...
      </div>
    );
  }

  return (
    <>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit, (validationErrors) =>
            console.log("SÉMA HIBÁK:", validationErrors),
          )}
          noValidate
        >
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
