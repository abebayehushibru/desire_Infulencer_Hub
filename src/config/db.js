import Dexie from "dexie";

const mediaDB =
  new Dexie(
    "influencer_hub"
  );

mediaDB.version(1).stores({
  media:
    "id,url,type,updatedAt",
});

export default mediaDB;