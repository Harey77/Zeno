import type { Metadata } from "next";
import View from "./view";

export const metadata: Metadata = { title: "Life Happens" };

export default function Page() {
  return <View />;
}
