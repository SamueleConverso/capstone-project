import { getPosts } from "./post";
import { getUserById } from "./user";
import { getOtherUserById } from "./user";

export const addApplicationUserFriend = (
  friendId,
  friendListId,
  accepted,
  userId,
  needToUpdateUserPage = null
) => {
  return async (dispatch) => {
    try {
      if (friendId === userId) {
        console.error("Non puoi aggiungere te stesso come amico.");
        return false;
      }
      const response = await fetch(
        "https://localhost:7105/api/ApplicationUserFriend",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicationUserId: friendId,
            friendListId: friendListId,
            sent: true,
            accepted: accepted,
          }),
        }
      );
      console.log("response", response);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        dispatch(getPosts());
        dispatch(getUserById(userId));
        if (needToUpdateUserPage) {
          dispatch(getOtherUserById(friendId));
        }
        return true;
      } else {
        throw new Error("Errore nella response di addApplicationUserFriend");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
      return false;
    }
  };
};

export const acceptApplicationUserFriend = (
  id,
  accept,
  userFriendListId,
  friendId,
  userId = null,
  navigate = null,
  needToUpdateCurrentUserPage = null,
  acceptingRequestFromOtherUserPage = null
) => {
  return async (dispatch) => {
    try {
      const response = await fetch(
        "https://localhost:7105/api/ApplicationUserFriend/" + id,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accepted: accept,
          }),
        }
      );
      console.log("response", response);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        dispatch(
          addApplicationUserFriend(friendId, userFriendListId, true, userId)
        );
        if (userId) {
          dispatch(getUserById(userId));
        }
        if (needToUpdateCurrentUserPage && acceptingRequestFromOtherUserPage) {
          dispatch(getOtherUserById(friendId));
        } else if (
          needToUpdateCurrentUserPage &&
          !acceptingRequestFromOtherUserPage
        ) {
          dispatch(getOtherUserById(userId));
        }
        console.log(userId);
        if (navigate) {
          navigate("/other-user/" + userId);
        }
      } else {
        throw new Error("Errore nella response di acceptApplicationUserFriend");
      }
    } catch (error) {
      console.error("ERRORE FETCH:" + error);
    }
  };
};

export const removeApplicationUserFriend = (
  friendshipId,
  user,
  needToUpdateCurrentUserPage = null,
  removingRequestFromOtherUserPage = null,
  otherUserId = null
) => {
  return async (dispatch, getState) => {
    try {
      console.log("Removing friendship with ID:", friendshipId);

      const currentUser = user || getState().user.applicationUser;

      if (!currentUser) {
        console.error("Nessun utente trovato nello stato");
        return false;
      }

      let friendId = null;
      let otherFriendshipId = null;

      if (currentUser?.friendList?.applicationUserFriends) {
        const friendship = currentUser.friendList.applicationUserFriends.find(
          (f) => f.applicationUserFriendId === friendshipId
        );

        if (friendship) {
          if (friendship.applicationUser) {
            friendId = friendship.applicationUser.applicationUserId;
            console.log("Friend ID found in friendList:", friendId);
          } else {
            console.log("Amicizia trovata ma applicationUser non presente");
          }
        }
      }

      if (!friendId && currentUser?.applicationUserFriends) {
        const reverseFriendship = currentUser.applicationUserFriends.find(
          (f) => f.applicationUserFriendId === friendshipId
        );

        if (reverseFriendship?.friendList?.applicationUser) {
          friendId =
            reverseFriendship.friendList.applicationUser.applicationUserId;
          console.log("Friend ID found in applicationUserFriends:", friendId);
        }
      }

      if (friendId && currentUser?.applicationUserFriends) {
        for (const f of currentUser.applicationUserFriends) {
          if (f?.friendList?.applicationUser?.applicationUserId === friendId) {
            otherFriendshipId = f.applicationUserFriendId;
            console.log("Found reverse friendship:", otherFriendshipId);
            break;
          }
        }
      }

      console.log("Attempting to delete friendship with ID:", friendshipId);

      const response = await fetch(
        `https://localhost:7105/api/ApplicationUserFriend/${friendshipId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Errore nella rimozione della prima amicizia");
      }

      const data = await response.json();
      console.log("Prima amicizia rimossa con successo:", data);

      if (otherFriendshipId) {
        console.log("Deleting reverse friendship with ID:", otherFriendshipId);

        const responseOther = await fetch(
          `https://localhost:7105/api/ApplicationUserFriend/${otherFriendshipId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!responseOther.ok) {
          console.error("Errore nella rimozione della seconda amicizia");
        } else {
          const dataOther = await responseOther.json();
          console.log("Seconda amicizia rimossa con successo:", dataOther);
        }
      }

      const userId = currentUser.applicationUserId;
      if (userId) {
        console.log("Aggiornamento dei dati dell'utente con ID:", userId);
        dispatch(getUserById(userId));
      } else {
        console.log("ID utente non disponibile, impossibile aggiornare i dati");
      }

      if (
        needToUpdateCurrentUserPage &&
        removingRequestFromOtherUserPage &&
        otherUserId
      ) {
        dispatch(getOtherUserById(otherUserId));
      } else if (
        needToUpdateCurrentUserPage &&
        !removingRequestFromOtherUserPage &&
        !otherUserId
      ) {
        dispatch(getOtherUserById(userId));
      }

      return true;
    } catch (error) {
      console.error("ERRORE nella rimozione dell'amicizia:", error);
      return false;
    }
  };
};

export const rejectApplicationUserFriend = (
  friendshipId,
  userId = null,
  needToUpdateCurrentUserPage = null,
  navigate = null,
  rejectingRequestFromOtherUserPage = null,
  otherUserId = null
) => {
  return async (dispatch) => {
    try {
      console.log("Rifiuto richiesta di amicizia con ID:", friendshipId);

      const response = await fetch(
        `https://localhost:7105/api/ApplicationUserFriend/${friendshipId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Errore nel rifiuto della richiesta di amicizia");
      }

      const data = await response.json();
      console.log("Richiesta di amicizia rifiutata con successo:", data);

      if (userId && navigate === null) {
        dispatch(getUserById(userId));
      } else {
        console.log("ID utente non disponibile, impossibile aggiornare i dati");
      }

      if (
        needToUpdateCurrentUserPage &&
        rejectingRequestFromOtherUserPage &&
        otherUserId
      ) {
        dispatch(getOtherUserById(otherUserId));
      } else if (
        needToUpdateCurrentUserPage &&
        !rejectingRequestFromOtherUserPage &&
        !otherUserId
      ) {
        dispatch(getOtherUserById(userId));
      }

      if (userId && navigate) {
        navigate("/other-user/" + userId);
      }

      return true;
    } catch (error) {
      console.error("ERRORE nel rifiuto della richiesta di amicizia:", error);
      return false;
    }
  };
};
