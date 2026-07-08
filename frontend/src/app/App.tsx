import { RouterProvider } from "react-router";
import { router } from "./routes";

// Only load AuthProvider when running full mode (not public-only Netlify build)
const PUBLIC_ONLY = import.meta.env.VITE_PUBLIC_ONLY === 'true';

function AppContent() {
  return <RouterProvider router={router} />;
}

export default function App() {
  if (PUBLIC_ONLY) {
    // Skip AuthProvider entirely — it imports Supabase auth context
    // which is not needed for the public website
    return <AppContent />;
  }

  // Dynamically import AuthProvider so it's tree-shaken in public builds
  const { AuthProvider } = require("./admin/context/AuthContext");
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}