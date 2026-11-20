import { HALAI_PRODUCT } from "./halai-product.ts";

export * from "../packages/phone-protocol/src/default-bot.ts";
export { DEFAULT_BOT_NAME as LEGACY_DEFAULT_BOT_NAME } from "../packages/phone-protocol/src/default-bot.ts";

export const DEFAULT_BOT_NAME = HALAI_PRODUCT.defaultAssistantName;
