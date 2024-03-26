export default function (user: { id: number; name: string | null }) {
  return user.name || "User  " + user.id;
}
