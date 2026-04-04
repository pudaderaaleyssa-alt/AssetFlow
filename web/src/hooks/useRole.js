import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export const useRole = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      }
      setLoading(false);
    };
    fetchRole();
  }, []);

  return { role, loading };
};