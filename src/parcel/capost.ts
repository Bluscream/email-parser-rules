import { CourierRule } from "../types";

export const rule: CourierRule = {
  id: "capost",
  name: "Canada Post",
  domains: ["canadapost.ca", "postescanada.ca"],
  statusRules: {
    delivered: {
      email: ["exact-nocase:donotreply@canadapost.postescanada.ca"],
      subject: ["nocase:Delivery Notification"]
    },
    arriving: {
      email: ["exact-nocase:donotreply@canadapost.postescanada.ca"]
    }
  }
};

export default rule;
