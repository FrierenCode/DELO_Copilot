import "server-only";
import { Polar } from "@polar-sh/sdk";

let _polar: Polar | null = null;

export function getPolar(): Polar {
  if (!process.env.POLAR_ACCESS_TOKEN) {
    throw new Error("POLAR_ACCESS_TOKEN is not configured");
  }
  if (!_polar) {
    _polar = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });
  }
  return _polar;
}

export function getWebhookSecret(): string {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) throw new Error("POLAR_WEBHOOK_SECRET is not configured");
  return secret;
}

export function getProductId(): string {
  const productId = process.env.POLAR_PRODUCT_ID;
  if (!productId) throw new Error("POLAR_PRODUCT_ID is not configured");
  return productId;
}
