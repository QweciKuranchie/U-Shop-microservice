import { type SchemaTypeDefinition } from 'sanity'
import { attributeType } from './attributeType'
import { productClassificationType } from './productClassificationType'
import { categoryType } from './categoryType'
import { addressType } from './addressType'
import { brandType } from './brandType'
import { productType } from './productType'
import { orderType } from './orderType'
import { storeType } from './storeType'
import { locationType } from './locationType'
import { bannerType } from "./bannerType";
import { contactType } from "./contactType";
import { sentNotificationType } from "./sentNotificationType";
import { userType } from "./userType";
import { userAccessRequestType } from "./userAccessRequestType";
import { reviewType } from "./reviewType";
import { subscriptionType } from "./subscriptionType";
import { universityType } from "./universityType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    attributeType,
    productClassificationType,
    categoryType,
    addressType,
    brandType,
    productType,
    orderType,
    storeType,
    locationType,
    universityType,
    bannerType,
    contactType,
    sentNotificationType,
    userType,
    userAccessRequestType,
    reviewType,
    subscriptionType,
  ],
}
