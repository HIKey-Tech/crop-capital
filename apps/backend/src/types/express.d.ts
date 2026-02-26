import { IUser } from "../modules/users/user.model";
import { ITenant } from "../modules/tenants/tenant.model";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      tenant?: ITenant;
    }
  }
}
