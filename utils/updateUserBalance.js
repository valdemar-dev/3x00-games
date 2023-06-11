import prisma from "./prismaClient";
import fs from "fs";
import path from "path";

//
// READ: the purpose of this function is to provide a global easy to use method
// for updating a users balance.
// this function takes into account upgrades that the user has purchased.
//

export default async function updateUserBalance(userId, amount, incomeCategory, incomeSource,) {
  const userInventory = await prisma.userInventory.findUnique({
    where: {
      userId: userId,
    },

    include: {
      items: true,
    },
  }) || null;
  
  if(!userInventory) return false;

  const JSONitems = fs.readFileSync(path.join(process.cwd(), "utils/items.json"));

  const itemList = JSON.parse(JSONitems).items;

  const userUpgrades = [];

  userInventory.items.forEach(async (item) => {
    const itemInList = itemList.find((listItem) => listItem.id === item.itemId);

    if (!itemInList ) return;

    if (itemInList.category === "Upgrades") {
      const itemExpiresAt = parseInt(item.boughtAt) + (itemInList.dataModifiers.duration * 1000);
      
      // get rid of the item if it is expired
      // * 1000 to convert to seconds
      // itemDuration of 0 means that the item is permanent and should not be deleted.
      if (itemInList.duration < 1) return userUpgrades.push(itemInList);

      if (Date.now() > itemExpiresAt) {
        await prisma.item.deleteMany({
          where: {
            AND: [
              {
                inventoryId: userInventory.id,
              },
              {
                itemId: item.itemId,
              }
            ]
          }
        });
      } else {
        userUpgrades.push(itemInList );
      }
    }
  });

  let adjustedAmount = amount;
  userUpgrades.forEach((item) => {
    const itemAppliesTo = item.dataModifiers.appliesTo;

    // make sure that the item applies to the correct categories valid sources
    // EG. Item applies to "games" category, and "blackjack" game.
    // Then, this only triggers if the incomeCategory is "games", and the incomeSource is "blackjack".
    // For these to apply, the provided incomeCategory and incomeSource must be exact. 
    //
    // REFER TO ITEMS.JSON FOR THE CATEGORIES AND SOURCES
    if (itemAppliesTo[incomeCategory].includes(incomeSource) || itemAppliesTo[incomeCategory].includes("all")) {
      adjustedAmount *= item.dataModifiers.multiplier;
    }
  });

  await prisma.userWallet.update({
    where: {
      userId: userId,
    },

    data: {
      balance: {
        increment: Math.round(adjustedAmount),
      },
    },
  })

  return adjustedAmount;
}
