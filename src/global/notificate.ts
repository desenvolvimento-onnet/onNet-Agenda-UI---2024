import ReactNotification, { store } from "react-notifications-component";

import "react-notifications-component/dist/theme.css";
import "animate.css/animate.compat.css";

type NotificationType = "success" | "danger" | "info" | "warning";

interface NotificateProps {
  title?: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

export function notificate({
  title = "",
  message,
  type,
  duration = 3000,
}: NotificateProps) {
  const emoji = {
    success: "😄",
    danger: "😳",
    info: "🤦‍♀️",
    warning: "😐",
  };

  title = `${emoji[type]} ${title}`;

  store.addNotification({
    title,
    message,
    type: type || undefined,
    insert: "top",
    container: "top-right",
    animationIn: ["animated", "jackInTheBox"],
    animationOut: ["animated", "zoomOut"],
    dismiss: {
      duration,
      pauseOnHover: true,
      onScreen: true,
      waitForAnimation: true,
    },
  });
}

export default ReactNotification;
