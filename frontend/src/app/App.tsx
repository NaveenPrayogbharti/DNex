import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./admin/context/AuthContext";

// VITE_PUBLIC_ONLY=true  → set in netlify.toml  → hides Admin/CRM on Netlify
// VITE_PUBLIC_ONLY unset → default for own server → full app including Admin/CRM
const PUBLIC_ONLY = import.meta.env.VITE_PUBLIC_ONLY === 'true';

export default function App() {
  if (PUBLIC_ONLY) {
    // On Netlify: skip AuthProvider (admin/CRM not needed)
    return <RouterProvider router={router} />;
  }

  // Own server: full app with auth context
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}