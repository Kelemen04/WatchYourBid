import { FormProvider, useForm } from "react-hook-form";
import { useBuyerRegister, useMeData } from "../hooks/useUser";
import type { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { BuyerRegisterSchema, type BuyerRegisterDTO } from "../dto/user.dto";
import GeneralBuyerData from "../features/auth/GeneralBuyerData";
import AddressDataForm from "../features/auth/AddressDataFrom";
import UserPhotoDataForm from "../features/auth/UserPhotoDataForm";

export default function RegisterBuyerPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File>();
  const { mutate } = useBuyerRegister();
  const { data: user, isLoading } = useMeData();

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

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
          {currentPage === 1 && <GeneralBuyerData setStep={setCurrentPage} />}
          {currentPage === 2 && <AddressDataForm setStep={setCurrentPage} />}
          {currentPage === 3 && (
            <UserPhotoDataForm
              file={selectedFile}
              setFile={setSelectedFile}
              setStep={setCurrentPage}
            />
          )}
        </form>
      </FormProvider>
    </>
  );
}
