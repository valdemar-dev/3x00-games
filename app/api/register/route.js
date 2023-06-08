import hashText from "@/utils/hashText";
import prisma from "@/utils/prismaClient";
import crypto from "crypto";
import items from "@/utils/items";
import fs from "fs";
import path from "path";

export async function POST(request) {
	// convert the request to json for some reason?
	// this was purely a hail-mary but it seems to work.
	const req = await request.json()

	// to make absolutely sure that sensitive information isnt stored un-hashed in the db,
	// we hash the information one more time, just to be extra safe.
	const unsafePassword = req.password;
	const unsafeUsername = req.username;

	// complain if no username or password is provided
	if (!unsafePassword || !unsafeUsername) return new Response("Please provide a valid password and email.", {
		status: 400,
	});

	const hashedPassword = hashText(req.password);
	const hashedUsername = hashText(req.username);

	// check if the user already exists in the database.
	const user = await prisma.user.findUnique({
		where: {
			username: hashedUsername,
		},
	});

	if (user) return new Response("User already exists!", {
		status: 400,
	});

  const JSONitems = fs.readFileSync(path.join(process.cwd(), "utils/items.json"));
  const items = JSON.parse(JSONitems).items;

  const item = items.find(item => item.id === "red_t_shirt");

	await prisma.user.create({
		data: {
			id: crypto.randomUUID(),
			username: hashedUsername,
			password: hashedPassword,
			wallet: {
				create: {
					balance: 200,
				},
			},
			inventory: {
				create: {
					items: {
						create: [
							{
                itemId: item.id,
								name: item.name,
								category: item.category,
                description: item.description || null,
                itemCount: 1,
                value: item.value,
							},
						],
					},
				},
			},
		},
	});

	return new Response("Account registered. Please proceed to login.");
}
