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

  const totalCost = item.value * amount;

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

  if (!user) {
    return new Response("Could not find selected user! Try logging in again.", {
      status: 401,
    });
  }

  const userWallet = user.wallet;
  const userInventory = user.inventory;

  if (!userWallet) {
    return new Response("Couldn't find user wallet.", {
      status: 403
    });
  }

  if(!totalCost > userWallet.balance) {
    return new Response("You don't have that much money!", {
      status: 403,
    });
  }

  if (!userInventory) {
    return new Response("No inventory found", {
      status: 404,
    })
  }

  const itemInInventory = userInventory.items.find(item => item.itemId === itemId);

  if (itemInInventory) {
    if (itemInInventory.itemCount + 1 > item.maxCount) {
      return new Response("You cannot purchase any more of this item!", {
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
              itemId: itemId,
            },
          ],
        },
        data: {
          itemCount: {
            increment: amount,
          },
          boughtAt: Date.now().toString(),
        },
      });
    }
  } else {
    await prisma.userInventory.update({
      where: {
        userId: userId,
      },

      data: {
        items: {
          create: [
            {
              itemId: item.id,
              itemCount: amount,
            },
          ]
        }
      }
    })
  }

  updateUserBalance(userId, (totalCost * -1), "store", "buy");

  return new Response(`You bought ${amount} of ${item.name}`);
}

