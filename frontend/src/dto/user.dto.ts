import { z } from "zod"
import { Country, State, City } from "country-state-city"

const PersonInfoSchema = z.object({
  firstName: z.string({
    error: "First name is required.",
  })
    .min(2, "First name must be at least 2 characters long.")
    .max(100, "First name cannot exceed 100 characters.")
    .trim(),
    
  lastName: z.string({
    error: "Last name is required.",
  })
    .min(2, "Last name must be at least 2 characters long.")
    .max(100, "Last name cannot exceed 100 characters.")
    .trim(),
    
  phoneNumber: z.string({
    error: "Phone number is required.",
  })
    .regex(/^\+?[0-9\s-]{7,20}$/, "Please enter a valid phone number (e.g., +123456789)."),
    
  profilePicture: z.string({
    error: "Please upload a profile picture.",
  }),
});

const BaseAddressSchema = z.object({
  country: z.string({
    error: "Please select your country.",
  })
    .min(1, "Please select your country.")
    .max(100, "Country name is too long."),
    
  region: z.string({
    error: "Please select your state or region.",
  })
    .min(1, "Please select your state or region.")
    .max(100, "State/region name is too long."),
    
  city: z.string({
    error: "Please select or enter your city.",
  })
    .min(1, "Please select or enter your city.")
    .max(100, "City name is too long."),
    
  street: z.string({
    error: "Street address is required.",
  })
    .min(1, "Street address is required.")
    .max(255, "Street address is too long."),
    
  number: z.string({
    error: "House or building number is required.",
  })
    .min(1, "House or building number is required.")
    .max(20, "Number is too long."),
    
  zipCode: z.string({
    error: "ZIP or postal code is required.",
  })
    .min(1, "ZIP or postal code is required.")
    .max(20, "ZIP code is too long."),
    
  building: z.string().max(50, "Building name is too long.").optional(),
  floor: z.string().max(50, "Floor details are too long.").optional(),
  apartment: z.string().max(50, "Apartment details are too long.").optional(),
});

const ValidatedAddressSchema = BaseAddressSchema.superRefine(
  (data, ctx) => {
    const countries = Country.getAllCountries().map(c => c.isoCode);

    if (!countries.includes(data.country)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a valid country from the list.",
        path: ["country"],
      });
      return;
    }

    const states = State.getStatesOfCountry(data.country).map(s => s.isoCode);

    if (!states.includes(data.region)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a valid state/region for this country.",
        path: ["region"],
      });
      return;
    }

    const cities = City.getCitiesOfState(data.country, data.region).map(ci => ci.name);

    if (!cities.includes(data.city)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a valid city from the list.",
        path: ["city"],
      });
      return;
    }
  }
);

export const BuyerRegisterSchema = PersonInfoSchema.merge(ValidatedAddressSchema).extend({
  shippingAddressName: z.string()
    .min(1, "Address name is required.")
    .max(50, "Address name cannot exceed 50 characters.")
    .optional()
    .default("Default Shipping"),
});

export const SellerRegisterSchema = PersonInfoSchema.merge(ValidatedAddressSchema).extend({
  description: z.string({
    error: "Please write a short introduction about yourself.",
  })
    .min(50, "Your description must be at least 50 characters long.")
    .max(3000, "Your description cannot exceed 3000 characters.")
    .default("No description.")
});

export const MeResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  profilePicture: z.string().nullable(),
  balance: z.number(),

  buyer: z.object({
    shippingAddressName: z.string(),
    shippingAddress: BaseAddressSchema
  }).nullable(),

  seller: z.object({
    description: z.string(),
    address: BaseAddressSchema,
    rating: z.number(),
  }).nullable()
});

export const UpdateUserSchema = z.object({
  firstName: z.string()
    .min(2, "First name must be at least 2 characters long.")
    .max(100, "First name is too long.")
    .trim()
    .nullable(),
  lastName: z.string()
    .min(2, "Last name must be at least 2 characters long.")
    .max(100, "Last name is too long.")
    .trim()
    .nullable(),
  phoneNumber: z.string()
    .regex(/^\+?[0-9\s-]{7,20}$/, "Please enter a valid phone number.")
    .nullable(),
  profilePicture: z.string().min(2).nullable(),
}).partial();

export const UpdateBuyerSchema = PersonInfoSchema.merge(BaseAddressSchema).extend({
  shippingAddressName: z.string()
    .min(1, "Address name cannot be empty.")
    .max(50, "Address name is too long.")
    .optional(),
}).partial();

export const UpdateSellerSchema = PersonInfoSchema.merge(BaseAddressSchema).extend({
  description: z.string()
    .min(50, "Please write at least 50 characters.")
    .max(3000, "Description is too long.")
    .optional()
}).partial();

export const NavbarSchema = z.object({
  username: z.string(),
  profilePicture: z.string().nullable(),
  balance: z.number(),
});

export const PublicProfileSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  profilePicture: z.string().nullable(),
  seller: z.object({
    address: BaseAddressSchema,
    description: z.string().nullable(),
    rating: z.number(),
  }).nullable(),
});

export const AdminUserItemSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  role: z.enum(["USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"]),
  status: z.enum(["PENDING", "VERIFIED", "REJECTED", "BANNED"]),
  seller: z.object({ id: z.number() }).nullable().optional(),
});

export const UpdateRoleSchema = z.object({
    userId: z.number(),
    newRole: z.enum(["USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"])
})

export const VerifyUserSchema = z.object({
    userId: z.number(),
    status: z.enum(['VERIFIED', 'REJECTED', 'BANNED', 'PENDING'])
})

export type VerifyUserDTO = z.infer<typeof VerifyUserSchema>;
export type AdminUserItemData = z.infer<typeof AdminUserItemSchema>;
export type UpdateRoleDTO = z.infer<typeof UpdateRoleSchema>;

export type BuyerRegisterDTO = z.input<typeof BuyerRegisterSchema>;
export type SellerRegisterDTO = z.input<typeof SellerRegisterSchema>;
export type MeResponse = z.infer<typeof MeResponseSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UpdateSeller = z.infer<typeof UpdateSellerSchema>;
export type UpdateBuyer = z.infer<typeof UpdateBuyerSchema>;
export type NavbarDTO = z.infer<typeof NavbarSchema>;
export type PublicProfileDTO = z.infer<typeof PublicProfileSchema>;