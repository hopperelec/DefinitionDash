import type { User } from "@prisma/client";

declare global {
	declare namespace App {
		// interface Error {}
		interface Locals {
			user: User;
		}

		// interface PageData {}
		// interface Platform {}
	}
}
