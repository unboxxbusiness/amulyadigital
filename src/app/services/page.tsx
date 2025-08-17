import { getMemberServiceRequests } from "./actions";
import { ServicesClientPage } from "./client-page";

export default async function ServicesPage() {
  const serviceRequests = await getMemberServiceRequests();

  return <ServicesClientPage initialRequests={JSON.parse(JSON.stringify(serviceRequests))} />;
}
