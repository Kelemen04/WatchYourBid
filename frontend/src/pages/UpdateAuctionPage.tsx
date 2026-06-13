import { FormProvider, useForm } from "react-hook-form";
import CommonAuctionDataForm from "../features/auction/CommonAuctionDataForm";
import { useAuctionData, useAuctionUpdate } from "../hooks/useAuctions";
import { AuctionSchema, type AuctionInput } from "../dto/auction.dto";
import type { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import AuctionTypeDataForm from "../features/auction/AuctionTypeDataForm";
import AuctionCategoryDataForm from "../features/auction/AuctionCategoryDataForm";
import AuctionPhotoDataForm from "../features/auction/AuctionPhotoDataForm";
import { useParams } from "react-router-dom";

export default function UpdateAuctionPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const { id } = useParams<{ id: string }>();
  const auctionId = Number(id);

  const { data: auction, isLoading } = useAuctionData(auctionId);
  const { mutate } = useAuctionUpdate(auctionId);

  useEffect(() => {
    if (auction?.images && existingImages.length === 0) {
      const timeout = setTimeout(() => {
        setExistingImages(auction.images);
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [auction?.images]);

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
      {
        auctionData: { ...data, existingImages },
        images: selectedFiles,
      },
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

  const steps = [
    { id: 1, subtitle: "STEP 1", title: "General Info" },
    { id: 2, subtitle: "STEP 2", title: "Auction Type" },
    { id: 3, subtitle: "STEP 3", title: "Watch Details" },
    { id: 4, subtitle: "STEP 4", title: "Upload Photos" },
  ];

  return (
    <div className="flex items-center justify-center w-full min-h-[calc(100vh-100px)] p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md border border-gray-100 flex h-[620px] overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 bg-background rounded-l-2xl p-8 flex flex-col gap-6 relative overflow-hidden flex-shrink-0">
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

          {steps.map((step) => {
            const isActive = currentPage === step.id;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${
                  isActive ? "bg-white/10" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold border transition-colors ${
                    isActive
                      ? "bg-primary text-background border-transparent"
                      : "border-white/30 text-white"
                  }`}
                >
                  {step.id}
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-white/60 font-inter uppercase tracking-widest mb-0.5">
                    {step.subtitle}
                  </span>
                  <span className="font-bold text-white tracking-widest text-sm uppercase">
                    {step.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right side */}
        <div className="w-2/3 px-10 py-6 flex flex-col h-full overflow-hidden justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-background"></div>
              <p className="font-inter text-text-muted text-sm font-medium">
                Loading auction data...
              </p>
            </div>
          ) : (
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit(onSubmit, (validationErrors) =>
                  console.log("Schema erros:", validationErrors),
                )}
                noValidate
                className="flex flex-col flex-1 min-h-0"
              >
                {methods.formState.errors.root && (
                  <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl font-bold text-sm text-center border border-red-200">
                    {methods.formState.errors.root.message}
                  </div>
                )}

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
                    existingImages={existingImages}
                    setExistingImages={setExistingImages}
                  />
                )}
              </form>
            </FormProvider>
          )}
        </div>
      </div>
    </div>
  );
}
