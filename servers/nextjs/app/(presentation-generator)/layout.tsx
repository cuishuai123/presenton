import React from "react";
import { ConfigurationInitializer } from "../ConfigurationInitializer";
import { UserCodeGate } from "./components/UserCodeGate";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <ConfigurationInitializer>
        <UserCodeGate>{children}</UserCodeGate>
      </ConfigurationInitializer>
    </div>
  );
};

export default layout;
