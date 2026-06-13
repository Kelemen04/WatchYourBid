import { FormProvider, useForm } from "react-hook-form";
import { useBuyerRegister, useMeData } from "../hooks/useUser";
import type { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { BuyerRegisterSchema, type BuyerRegisterDTO } from "../dto/user.dto";
import GeneralBuyerData from "../features/auth/GeneralBuyerData";
import AddressDataForm from "../features/auth/AddressDataFrom";
import UserPhotoDataForm from "../features/auth/UserPhotoDataForm";
import { useNavigate } from "react-router-dom";

export default function RegisterBuyerPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File>();
  const { mutate } = useBuyerRegister();
  const { data: user, isLoading } = useMeData();
  const navigate = useNavigate();

  const existingAddress = user?.seller?.address || user?.buyer?.shippingAddress;

  const methods = useForm<BuyerRegisterDTO>({
    resolver: zodResolver(BuyerRegisterSchema),
    mode: "onTouched",
    values: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNumber: user?.phoneNumber || "",
      profilePicture: user?.profilePicture || "",

      country: existingAddress?.country || "",
      region: existingAddress?.region || "",
      city: existingAddress?.city || "",
      street: existingAddress?.street || "",
      number: existingAddress?.number || "",
      zipCode: existingAddress?.zipCode || "",

      building: existingAddress?.building || "",
      floor: existingAddress?.floor || "",
      apartment: existingAddress?.apartment || "",
    },
  });

  const onSubmit = (data: BuyerRegisterDTO) => {
    mutate(
      { buyerData: data, image: selectedFile },
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

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <span className="font-playfair text-2xl text-primary animate-pulse">
          Loading data...
        </span>
      </div>
    );

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
        <div className="w-2/3 px-10 py-6 flex flex-col h-full overflow-hidden">
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
                  existingImage={user?.profilePicture}
                />
              )}
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
