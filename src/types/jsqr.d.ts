declare module "jsqr" {
  export interface QRCodeLocation {
    topRightCorner: { x: number; y: number };
    topLeftCorner: { x: number; y: number };
    bottomRightCorner: { x: number; y: number };
    bottomLeftCorner: { x: number; y: number };
    topRightFinderPattern?: unknown;
    topLeftFinderPattern?: unknown;
    bottomLeftFinderPattern?: unknown;
  }

  export interface QRCode {
    binaryData: number[];
    data: string;
    chunks: unknown[];
    version: number;
    location: QRCodeLocation;
  }

  export interface Options {
    inversionAttempts?: "dontInvert" | "onlyInvert" | "attemptBoth" | "invertFirst";
    greyScaleWeights?: { red: number; green: number; blue: number; useIntegerApproximation?: boolean };
  }

  export default function jsQR(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options?: Options
  ): QRCode | null;
}
