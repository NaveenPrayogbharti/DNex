import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./admin/context/AuthContext";

// Always enable full app including Admin/CRM and AuthProvider
const PUBLIC_ONLY = false;

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