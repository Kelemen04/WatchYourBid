import { FormProvider, useForm } from "react-hook-form";
import { useMeData, useBuyerUpdate } from "../hooks/useUser"; // Feltételezem, van useBuyerUpdate hookod
import type { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { BuyerRegisterSchema, type BuyerRegisterDTO } from "../dto/user.dto";
import GeneralBuyerData from "../features/auth/GeneralBuyerData";
import AddressDataForm from "../features/auth/AddressDataFrom";
import UserPhotoDataForm from "../features/auth/UserPhotoDataForm";
import { useNavigate } from "react-router-dom";

export default function UpdateBuyerPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [existingImage, setExistingImage] = useState<string | null>(null);

  const { data: user, isLoading } = useMeData();
  const { mutate } = useBuyerUpdate(); // A frissítéshez tartozó mutáció
  const navigate = useNavigate();

  // Meglévő kép szinkronizálása a state-be
  useEffect(() => {
    if (user?.profilePicture && !existingImage) {
      const timeout = setTimeout(() => {
        setExistingImage(user.profilePicture);
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [user?.profilePicture]);

  const existingAddress = user?.buyer?.shippingAddress;

  const methods = useForm<BuyerRegisterDTO>({
    resolver: zodResolver(BuyerRegisterSchema),
    mode: "onTouched",
    // Ha be vannak töltve a user adatok, kitöltjük a formot
    values: user
      ? {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phoneNumber: user.phoneNumber || "",
          profilePicture: existingImage || "",

          country: existingAddress?.country || "",
          region: existingAddress?.region || "",
          city: existingAddress?.city || "",
          street: existingAddress?.street || "",
          number: existingAddress?.number || "",
          zipCode: existingAddress?.zipCode || "",

          building: existingAddress?.building || "",
          floor: existingAddress?.floor || "",
          apartment: existingAddress?.apartment || "",
        }
      : undefined,
  });

  const onSubmit = (data: BuyerRegisterDTO) => {
    // Az existingImage-t beletesszük a DTO-ba, ha megtartotta a user
    mutate(
      {
        buyerData: { ...data, profilePicture: existingImage || "" },
        image: selectedFile,
      },
      {
        onSuccess: () => navigate("/dashboard"),
        onError: (err) => {
          const serverError = err as AxiosError<{ error: string }>;
          methods.setError("root", {
            type: "server",
            message: serverError?.response?.data?.error,
          });
        },
      },
    );
  };

  const steps = [
    { id: 1, subtitle: "STEP 1", title: "Personal Info" },
    { id: 2, subtitle: "STEP 2", title: "Address" },
    { id: 3, subtitle: "STEP 3", title: "Profile Photo" },
  ];

  return (
    <div className="flex items-center justify-center w-full min-h-[calc(100vh-100px)] p-4 bg-slate-50">
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
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${isActive ? "bg-white/10" : ""}`}
              >
                <div
                  className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold border transition-colors ${isActive ? "bg-primary text-background border-transparent" : "border-white/30 text-white"}`}
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

        {/* Right Content */}
        <div className="w-2/3 px-10 py-6 flex flex-col h-full overflow-hidden justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-background"></div>
              <p className="font-inter text-text-muted text-sm font-medium">
                Loading user data...
              </p>
            </div>
          ) : (
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col flex-1 min-h-0"
              >
                {methods.formState.errors.root && (
                  <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl font-bold text-sm text-center border border-red-200">
                    {methods.formState.errors.root.message}
                  </div>
                )}
                {currentPage === 1 && (
                  <GeneralBuyerData setStep={setCurrentPage} />
                )}
                {currentPage === 2 && (
                  <AddressDataForm setStep={setCurrentPage} />
                )}
                {currentPage === 3 && (
                  <UserPhotoDataForm
                    file={selectedFile}
                    setFile={setSelectedFile}
                    setStep={setCurrentPage}
                    existingImage={existingImage}
                    setExistingImage={setExistingImage}
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
