import { Link as RouterLink } from "react-router-dom";
import { canonicalLink } from "./pageSeo.js";

export function Link({to,...props}) {
  return <RouterLink to={canonicalLink(to)} {...props} />;
}
