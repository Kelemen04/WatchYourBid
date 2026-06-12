import { z } from "zod"
import { Country, State, City } from "country-state-city"

const PersonInfoSchema = z.object({
  firstName: z.string().min(2).max(100).trim().nullable(),
  lastName: z.string().min(2).max(100).trim().nullable(),
  phoneNumber: z.string().regex(/^\+?[0-9\s-]{7,20}$/, "Invalid phone number!").nullable(),
  profilePicture: z.string().optional(),
});

const BaseAddressSchema = z.object({
  country: z.string().min(1).max(100),
  region: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  street: z.string().min(1).max(255),
  number: z.string().min(1).max(20),
  zipCode: z.string().min(1).max(20),
  building: z.string().max(50).optional().nullable(),
  floor: z.string().max(50).optional().nullable(),
  apartment: z.string().max(50).optional().nullable(),
});

const addressRefinement = (data: any, ctx: z.RefinementCtx) => {
  const countries = Country.getAllCountries().map(c => c.isoCode);

  if (!countries.includes(data.country)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid country!", path: ["country"] });
    return;
  }

  const states = State.getStatesOfCountry(data.country).map(s => s.isoCode);

  if (!states.includes(data.region)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid state/region!", path: ["region"] });
    return;
  }

  const cities = City.getCitiesOfState(data.country, data.region).map(ci => ci.name);

  if (!cities.includes(data.city)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid city!", path: ["city"] });
    return;
  }
};

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

export const BuyerRegisterSchema = PersonInfoSchema.merge(BaseAddressSchema).extend({
  shippingAddressName: z.string().min(1).max(50).optional().default("Default Shipping"),
}).superRefine(addressRefinement);

export const SellerRegisterSchema = PersonInfoSchema.merge(BaseAddressSchema).extend({
  description: z.string().min(50).max(3000).default("No description.")
}).superRefine(addressRefinement);

export const MeResponseSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  profilePicture: z.string().nullable(),
  balance: z.number().default(0),
  
  buyer: z.object({
    id: z.number(),
    userId: z.number(),
    shippingAddressId: z.number(),
    shippingAddress: BaseAddressSchema
  }).nullable(),
  seller: z.object({
    id: z.number(),
    userId: z.number(),
    addressId: z.number(),
    rating: z.number(),
    description: z.string().nullable(),
    address: BaseAddressSchema,
  }).nullable()
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(2).max(100).trim().nullable(),
  lastName: z.string().min(2).max(100).trim().nullable(),
  phoneNumber: z.string().regex(/^\+?[0-9\s-]{7,20}$/).nullable(),
  profilePicture: z.string().nullable(),
}).partial();

export const UpdateBuyerSchema = PersonInfoSchema.merge(BaseAddressSchema).extend({
  shippingAddressName: z.string().min(1).max(50).optional(),
}).partial();

export const UpdateSellerSchema = PersonInfoSchema.merge(BaseAddressSchema).extend({
  description: z.string().min(50).max(3000).optional()
}).partial();

export type BuyerRegisterDTO = z.infer<typeof BuyerRegisterSchema>;
export type SellerRegisterDTO = z.infer<typeof SellerRegisterSchema>;
export type MeResponse = z.infer<typeof MeResponseSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UpdateSeller = z.infer<typeof UpdateSellerSchema>;
export type UpdateBuyer = z.infer<typeof UpdateBuyerSchema>;
export type PublicProfileDTO = z.infer<typeof PublicProfileSchema>;