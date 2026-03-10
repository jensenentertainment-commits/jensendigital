import TransmissionClient from "./TransmissionClient";

export const metadata = {
  title: "Elephant Transmission",
  description: "Continuous signal from Elephant Records.",
};

export default function Page() {
  return <TransmissionClient />;
}
