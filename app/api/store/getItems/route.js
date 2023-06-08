import validateSessionData from "@/utils/validateSessionData";
import fs from "fs";
import path from "path";

export async function GET(req) {
  const sessionToken = req.cookies.get("sessionToken")?.value;
  const userId = req.cookies.get("userId")?.value;
  const username = req.cookies.get("username")?.value;

  if (await validateSessionData(sessionToken, userId, username) === false) {
    return new Response("Invalid session info.", {
      status: 401,
    });
  }

  const JSONitems = fs.readFileSync(path.join(process.cwd(), "utils/items.json"));
  const items = JSON.parse(JSONitems).items;


  return new Response(JSON.stringify(items));
}
