import { z } from "zod"
import { Country, State, City } from "country-state-city"

const PersonInfoSchema = z.object({
  firstName: z.string().min(2).max(100).trim(),
  lastName: z.string().min(2).max(100).trim(),
  phoneNumber: z.string().regex(/^\+?[0-9\s-]{7,20}$/, "Invalid phone number!"),
  profilePicture: z.string(),
});

const BaseAddressSchema = z.object({
  country: z.string().min(1).max(100),
  region: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  street: z.string().min(1).max(255),
  number: z.string().min(1).max(20),
  zipCode: z.string().min(1).max(20),
  building: z.string().max(50).optional(),
  floor: z.string().max(50).optional(),
  apartment: z.string().max(50).optional(),
});

const ValidatedAddressSchema = BaseAddressSchema.superRefine(
  (data, ctx) => {
    const countries = Country.getAllCountries().map(c => c.isoCode);

    if (!countries.includes(data.country)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid country!",
        path: ["country"],
      });
      return;
    }

    const states = State.getStatesOfCountry(data.country).map(s => s.isoCode);

    if (!states.includes(data.region)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid state/region!",
        path: ["region"],
      });
      return;
    }

    const cities = City.getCitiesOfState(data.country, data.region).map(ci => ci.name);

    if (!cities.includes(data.city)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid city!",
        path: ["city"],
      });
      return;
    }
  }
);

export const BuyerRegisterSchema = PersonInfoSchema.merge(ValidatedAddressSchema).extend({
  shippingAddressName: z.string().min(1).max(50).optional().default("Default Shipping"),
});

export const SellerRegisterSchema = PersonInfoSchema.merge(ValidatedAddressSchema).extend({
  description: z.string().min(50).max(3000).default("No description.")
});

export const MeResponseSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  profilePicture: z.string().nullable(),

  buyer: z.object({
    shippingAddressName: z.string(),
    shippingAddress: BaseAddressSchema
  }).nullable(),

  seller: z.object({
    description: z.string(),
    address: BaseAddressSchema,
  }).nullable()
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(2).max(100).trim().nullable(),
  lastName: z.string().min(2).max(100).trim().nullable(),
  phoneNumber: z.string().regex(/^\+?[0-9\s-]{7,20}$/).nullable(),
  profilePicture: z.string().min(2).nullable(),
}).partial();

export const UpdateBuyerSchema = PersonInfoSchema.merge(BaseAddressSchema).extend({
  shippingAddressName: z.string().min(1).max(50).optional(),
}).partial();

export const UpdateSellerSchema = PersonInfoSchema.merge(BaseAddressSchema).extend({
  description: z.string().min(50).max(3000).optional()
}).partial();

export const NavbarSchema = z.object({
  username: z.string(),
  profilePicture: z.string().nullable(),
  balance: z.number(),
});

export const PublicProfileSchema = z.object({
  username: z.string(),
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