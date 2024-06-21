import { redirect } from "@sveltejs/kit";

// In the future, this will be a home page;
// however, a home page does not exist yet, so it redirects the user straight to the game
export const GET = async () => {
	redirect(301, "game");
};
