import { FormProvider, useForm } from "react-hook-form";
import { useMeData, useBuyerUpdate } from "../hooks/useUser";
import type { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { BuyerRegisterSchema, type BuyerRegisterDTO } from "../dto/user.dto";
import GeneralBuyerData from "../features/auth/GeneralBuyerData";
import AddressDataForm from "../features/auth/AddressDataFrom";
import UserPhotoDataForm from "../features/auth/UserPhotoDataForm";
import { useNavigate } from "react-router-dom";

export default function UpdateBuyerPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File>();

  const { data: user, isLoading } = useMeData();
  const { mutate } = useBuyerUpdate();
  const navigate = useNavigate();

  const existingAddress = user?.buyer?.shippingAddress;

  const methods = useForm<BuyerRegisterDTO>({
    resolver: zodResolver(BuyerRegisterSchema),
    mode: "onTouched",
    values: user
      ? {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phoneNumber: user.phoneNumber || "",
          profilePicture: user.profilePicture || "",
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
    mutate(
      {
        buyerData: { ...data },
        image: selectedFile,
      },
      {
        onSuccess: async () => navigate("/dashboard"),
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
        <div className="w-1/3 bg-background rounded-l-2xl p-8 flex flex-col gap-6 relative overflow-hidden flex-shrink-0">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all ${currentPage === step.id ? "bg-white/10" : ""}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border ${currentPage === step.id ? "bg-primary text-background border-transparent" : "border-white/30 text-white"}`}
              >
                {step.id}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-white/60 uppercase tracking-widest">
                  {step.subtitle}
                </span>
                <span className="font-bold text-white tracking-widest text-sm uppercase">
                  {step.title}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="w-2/3 px-10 py-6 flex flex-col h-full overflow-hidden justify-center">
          {isLoading ? (
            <div className="text-center animate-pulse">
              Loading user data...
            </div>
          ) : (
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col flex-1 min-h-0"
              >
                {methods.formState.errors.root && (
                  <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl font-bold text-sm text-center">
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
                    existingImage={user?.profilePicture}
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
