export const load = async ({ locals }) => {
	return { userId: locals.user.id };
};
