import ReactDOM from "react-dom";

export const PortalContainer = () => {
  return <div id="portal" />;
};

export const Portal = ({ children }: { children: React.ReactNode }) => {
  const portal = document.getElementById("portal");
  if (portal == null) {
    return null;
  }
  return ReactDOM.createPortal(children, portal);
};
