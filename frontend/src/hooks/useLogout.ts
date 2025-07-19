import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/components/LanguageProvider";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const useLogout = () => {
  const { logout, isLoggingOut } = useAuth();
  const { t } = useLanguage();

  const handleLogout = async () => {
    MySwal.fire({
      title: t("confirmLogout"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("confirm"),
      cancelButtonText: t("cancel"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        await logout();
      }
    });
  };

  return { handleLogout, isLoggingOut };
};