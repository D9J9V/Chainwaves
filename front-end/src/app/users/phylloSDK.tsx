import { createUser, createUserToken } from './phylloServiceAPIs';

class PhylloSDK {
  async initializeSDK() {
    const config = await this.getConfig();
    const phylloConnect = window.PhylloConnect.initialize(config);
    this.setupEventListeners(phylloConnect);
    phylloConnect.open();
  }

  async getConfig() {
    const timeStamp = new Date();
    const userId = await createUser("Test App", timeStamp.getTime());
    const token = await createUserToken(userId);
    return {
      clientDisplayName: "Test App",
      environment: "staging",
      userId: userId,
      token: token,
      workPlatformId: null,
    };
  }

  setupEventListeners(phylloConnect) {
    phylloConnect.on("accountConnected", (accountId, workplatformId, userId) => {
      console.log(`onAccountConnected: ${accountId}, ${workplatformId}, ${userId}`);
      window.location.href = "/users";
    });

    phylloConnect.on("accountDisconnected", (accountId, workplatformId, userId) => {
      console.log(`onAccountDisconnected: ${accountId}, ${workplatformId}, ${userId}`);
    });

    phylloConnect.on("tokenExpired", (userId) => {
      console.log(`onTokenExpired: ${userId}`);
      if (window.confirm("Your session has expired, but we can help you fix it")) {
        localStorage.removeItem("PHYLLO_SDK_TOKEN");
        this.initializeSDK();
      } else {
        window.location.href = "/";
      }
    });

    phylloConnect.on("exit", (reason, userId) => {
      console.log(`onExit: ${reason}, ${userId}`);
      alert("Phyllo SDK exit reason: " + reason);
    });

    phylloConnect.on("connectionFailure", (reason, workplatformId, userId) => {
      console.log(`onConnectionFailure: ${reason}, ${workplatformId}, ${userId}`);
      alert("WorkPlatform connection failure reason: " + reason);
    });
  }
}

export default PhylloSDK;