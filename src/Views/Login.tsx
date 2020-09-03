import * as React from "react";
import * as firebase from "firebase/app";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";

export const Login: React.FC = () => {
  React.useEffect(() => {
    // FirebaseUI config.
    const uiConfig = {
      signInSuccessUrl: "/start",
      signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
    };

    const ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start("#auth-container", uiConfig);
  });

  return <div id="auth-container" />;
};
