import { remultApi } from "remult/remult-sveltekit";
import { Task } from "../demo/todo/Task";
import { auth } from "../demo/auth/server/index";
  
export const api = remultApi({
  admin: true,
  entities: [Task],
  modules: [
    auth({
      // Add some roles to some users with env variable.
      // SUPER_ADMIN_EMAILS
    }),
  ],
});