import { getCommunities } from "./community";

// export const addCommunityApplicationUser = (applicationUserId, communityId) => {
//   return async (dispatch) => {
//     try {
//       const response = await fetch(
//         "https://localhost:7105/api/CommunityApplicationUser",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             createCommunityApplicationUserRequestDto: {
//               ApplicationUserId: applicationUserId,
//               CommunityId: communityId,
//               IsDeleted: false,
//             },
//           }),
//         }
//       );
//       console.log("response", response);
//       if (response.ok) {
//         const data = await response.json();
//         console.log("Membro aggiunto con successo:", data);
//         dispatch(getCommunities());
//         return true;
//       } else {
//         throw new Error("Errore nella response di addCommunityApplicationUser");
//       }
//     } catch (error) {
//       console.error("ERRORE FETCH:" + error);
//       return false;
//     }
//   };
// };

export const addCommunityApplicationUser = (applicationUserId, communityId) => {
  return async (dispatch) => {
    try {
      const requestBody = {
        applicationUserId: applicationUserId,
        communityId: communityId,
        isDeleted: false,
      };

      console.log("Invio richiesta con body:", JSON.stringify(requestBody));

      const response = await fetch(
        "https://localhost:7105/api/CommunityApplicationUser",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("response", response);

      if (response.ok) {
        const data = await response.json();
        console.log("Membro aggiunto con successo:", data);
        dispatch(getCommunities());
        return true;
      } else {
        const errorText = await response.text();
        console.error("Errore risposta server:", errorText);
        throw new Error("Errore nella response di addCommunityApplicationUser");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
      return false;
    }
  };
};

export const removeCommunityApplicationUser = (communityApplicationUserId) => {
  return async (dispatch) => {
    try {
      const response = await fetch(
        "https://localhost:7105/api/CommunityApplicationUser/" +
          communityApplicationUserId,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("response", response);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        dispatch(getCommunities());
        return true;
      } else {
        throw new Error(
          "Errore nella response di removeCommunityApplicationUser"
        );
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
      return false;
    }
  };
};
