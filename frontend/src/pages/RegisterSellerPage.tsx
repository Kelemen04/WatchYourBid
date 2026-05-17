import { FormProvider, useForm } from "react-hook-form";
import { useMeData, useSellerRegister } from "../hooks/useUser";
import type { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { SellerRegisterSchema, type SellerRegisterDTO } from "../dto/user.dto";
import AddressDataForm from "../features/auth/AddressDataFrom";
import UserPhotoDataForm from "../features/auth/UserPhotoDataForm";
import GeneralSellerData from "../features/auth/GeneralSellerData";

export default function RegisterSellerPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File>();
  const { mutate } = useSellerRegister();
  const { data: user, isLoading } = useMeData();

  const existingAddress = user?.seller?.address || user?.buyer?.shippingAddress;

  const methods = useForm<SellerRegisterDTO>({
    resolver: zodResolver(SellerRegisterSchema),
    mode: "onTouched",
    values: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNumber: user?.phoneNumber || "",
      profilePicture: user?.profilePicture || "",
      description: "",

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

  const onSubmit = (data: SellerRegisterDTO) => {
    mutate(
      { sellerData: data, image: selectedFile },
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
        <form
          onSubmit={methods.handleSubmit(onSubmit, (validationErrors) =>
            console.log("❌ SÉMA HIBÁK:", validationErrors),
          )}
          noValidate
        >
          {currentPage === 1 && <GeneralSellerData setStep={setCurrentPage} />}
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
