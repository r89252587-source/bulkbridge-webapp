import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile as firebaseUpdateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

export type UserType = "shopkeeper" | "wholesaler" | null;

interface User {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  phone?: string;
  businessName?: string;
  address?: string;
  gstNumber?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  setUserType: (type: UserType) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch additional user data from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            // Self-healing: If doc doesn't exist (e.g. signup failed due to rules), create it now
            const userData: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || "Anonymous User",
              userType: null,
            };
            try {
              await setDoc(doc(db, "users", firebaseUser.uid), userData);
            } catch (err) {
              console.error("Failed to create missing user document:", err);
            }
            setUser(userData);
          }
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        // Even if firestore fails, we have the firebase auth user potentially
        if (firebaseUser) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || "",
            userType: null,
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Check if user already exists in Firestore
      try {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (!userDoc.exists()) {
          const userData: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || "",
            userType: null,
          };
          await setDoc(doc(db, "users", firebaseUser.uid), userData);
        }
      } catch (fsError) {
        console.warn("Firestore error during Google login (user may already exist or permissions issue):", fsError);
        // We still return true because the authentication itself succeeded
      }
      return true;
    } catch (error) {
      console.error("Google login error:", error);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      await firebaseUpdateProfile(firebaseUser, { displayName: name });
      
      const userData: User = {
        id: firebaseUser.uid,
        email,
        name,
        userType: null,
      };
      
      await setDoc(doc(db, "users", firebaseUser.uid), userData);
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const setUserType = async (type: UserType) => {
    if (user) {
      try {
        // Try to update Firestore
        await updateDoc(doc(db, "users", user.id), { userType: type });
      } catch (error) {
        console.error("Set user type firestore error:", error);
        console.warn("Updating local state only. Fix firestore rules to persist this change.");
      }
      // Always update local state so the user can proceed in the current session
      setUser({ ...user, userType: type });
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.id), data as any);
        setUser({ ...user, ...data });
      } catch (error) {
        console.error("Update profile error:", error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        loginWithGoogle,
        signup,
        logout,
        setUserType,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
