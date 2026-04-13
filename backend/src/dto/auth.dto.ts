import { z } from "zod";
import { Country , State , City } from "country-state-city";

const PersonInfoSchema = z.object({
  firstName: z.string().min(2).max(100).trim(),
  lastName: z.string().min(2).max(100).trim(),
  phoneNumber: z.string().regex(/^\+?[0-9\s-]{7,20}$/, "Invalid phone number!"),
});

const AddressSchema = z.object({
  country: z.string().min(1).max(100),
  region: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  street: z.string().min(1).max(255),
  number: z.string().min(1).max(20),
  zipCode: z.string().min(1).max(20),
  building: z.string().max(50).optional(),
  floor: z.string().max(50).optional(),
  apartment: z.string().max(50).optional(),
})
.superRefine(
  (data,ctx) => {
    const countries = Country.getAllCountries().map(c => c.isoCode);

    if(!countries.includes(data.country)){
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid country!",
        path: ["country"],
      });

      return;
    }
    
    const states = State.getStatesOfCountry(data.country).map(s => s.isoCode);

    if(!states.includes(data.region)){
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid state/region!",
        path: ["region"],
      });
    
      return;
    }

    const cities = City.getCitiesOfState(data.country,data.region).map(ci => ci.name);

    if(!cities.includes(data.city)){
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid city!",
        path: ["city"],
      });
    
      return;
    }
  }
);

export const RegisterSchema = z.object({
  username: z.string().min(3, "Minimum 3 characters").max(30).trim(),
  password: z.string()
    .min(8, "Minimum 8 characters")
    .max(100, "Must contain atmost 100 characters!")
    .regex(/[a-z]/, "Must contain a lowercase letter!")
    .regex(/[A-Z]/, "Must contain an uppercase letter!")
    .regex(/[0-9]/, "Must contain a number!")
    .regex(/[!@#$%^&*.?_\-]/, "Must contain special characters!"),
  email: z.string().email("Invalid email!").toLowerCase().trim(),
});

export const LoginSchema = z.object({
  username: z.string().min(1, "Username is mandatory!"),
  password: z.string().min(1, "Password is mandatory!"),
});

export const BuyerRegisterSchema = PersonInfoSchema.merge(AddressSchema).extend({
  shippingAddressName: z.string().min(1).max(50).optional().default("Default Shipping"),
});

export const SellerRegisterSchema = PersonInfoSchema.merge(AddressSchema);

export type LoginDTO = z.infer<typeof LoginSchema>;
export type RegisterDTO = z.infer<typeof RegisterSchema>;
export type BuyerRegisterDTO = z.infer<typeof BuyerRegisterSchema>;
export type SellerRegisterDTO = z.infer<typeof SellerRegisterSchema>;