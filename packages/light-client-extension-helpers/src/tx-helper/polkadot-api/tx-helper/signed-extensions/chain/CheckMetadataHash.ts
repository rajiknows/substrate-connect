import { of } from "rxjs"
import type { GetChainSignedExtension } from "../internal-types.js"

export const CheckMetadataHash: GetChainSignedExtension = () =>
  of({
    value: Uint8Array.from([0]),
    additionalSigned: Uint8Array.from([0]),
  })
