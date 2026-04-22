import { Metadata } from "next"
import { VerifyClient } from "./verify-client"

export const metadata: Metadata = {
  title: "Verify Certificate | WorkforceReady",
  description: "Verify the authenticity of a WorkforceReady digital credential",
}

export default function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  return <VerifyClient searchParamsPromise={searchParams} />
}
