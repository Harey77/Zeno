import type { Metadata } from "next";
import View from "./view";

export const metadata: Metadata = { title: "Stock Reader" };

export default function Page() {
  return <View />;
}
