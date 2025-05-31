
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard as the main page
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return null;
}
