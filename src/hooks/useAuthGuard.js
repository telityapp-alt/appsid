import { useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Returns { requireAuth(callback) }.
 * If the user is logged in, runs callback() immediately.
 * If not, opens the existing AuthModal and queues the callback
 * to run after successful login.
 *
 * Usage:
 *   const { requireAuth } = useAuthGuard();
 *   <button onClick={() => requireAuth(() => handleUpvote())}>Upvote</button>
 */
export function useAuthGuard() {
  const { user, openAuthModal } = useContext(AuthContext);

  const requireAuth = useCallback(
    (callback) => {
      if (user) {
        callback();
      } else {
        // openAuthModal accepts an optional onSuccess callback
        // which AuthContext will call after successful login
        if (typeof openAuthModal === "function") {
          openAuthModal(callback);
        }
      }
    },
    [user, openAuthModal],
  );

  return { requireAuth };
}
