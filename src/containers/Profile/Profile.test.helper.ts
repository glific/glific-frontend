import { GET_CURRENT_USER } from "../../graphql/queries/User";

export const LOGGED_IN_USER_MOCK = [
  {
    request: {
      query: GET_CURRENT_USER
    },
    result: {
      data: {
        user: {
          user: {
            id: "1",
            name: "John Doe",
            phone: "+919820198765",
            roles: [
              "admin"
            ]
          }
        }
      }
    },
  }
];
