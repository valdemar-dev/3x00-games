import prisma from "@/utils/prismaClient";
import updateUserBalance from "@/utils/updateUserBalance";
import validateSessionData from "@/utils/validateSessionData";
import fs from "fs";
import path from "path";

export async function POST(req) {
  const sessionToken = req.cookies.get("sessionToken")?.value;
  const userId = req.cookies.get("userId")?.value;
  const username = req.cookies.get("username")?.value;

  if (await validateSessionData(sessionToken, userId, username) === false) {
    return new Response("Invalid session token.", {
      status: 401,
    });
  }

  const reqJSON = await req.json();

  const itemId = reqJSON.item;
  const amount = parseInt(reqJSON.amount);

  if(!amount || isNaN(amount)) {
    return new Response("Incorrect form information.", {
      status: 400,
    });
  }
  
  const itemsJSON = fs.readFileSync(path.join(process.cwd(), "utils/items.json"));

  const items = JSON.parse(itemsJSON).items;

  const item = items.find(item => item.id === itemId);

  if (!item) {
    return new Response("Couldn't find selected item.", {
      status: 400,
    });
  }

  // remove 25% of price for selling
  const totalCost = item.value * amount * 0.75;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    include: {
      wallet: true,
      inventory: {
        select: {
          items: true,
        }
      },
    }
  }) || null;

  if (!user || !user.wallet || !user.inventory) {
    return new Response("Could not find selected user! Try logging in again.", {
      status: 401,
    });
  }

  const userInventory = user.inventory;

  const itemInInventory = userInventory.items.find(item => item.itemId === itemId);

  if (!itemInInventory || itemInInventory.itemCount < 1 || itemInInventory.itemCount < amount) {
    return new Response("You don't have enough of this item!", {
      status: 403,
    });
  } else {
    await prisma.item.updateMany({
      where: {
        AND: [
          {
            inventoryId: userInventory.id,
          },
          {
            itemId: item.id,
          },
        ],
      },

      data: {
        itemCount: {
          decrement: amount,
        },
      },
    });
  }

  updateUserBalance(userId, (totalCost * 1) /*inverted*/, "store", "sell");

  return new Response(`You sold ${amount} of ${item.name} for ${totalCost}`);
}

