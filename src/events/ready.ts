import { client } from "../index";

export default {
  name: "ready",
  once: true,
  run: async () => {
    client.user?.setActivity("Dota 2", { type: "PLAYING" });
  },
};
