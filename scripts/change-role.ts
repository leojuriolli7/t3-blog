import { PrismaClient } from "@prisma/client";

const id = process.argv[2];
const role = process.argv[3];

const usage = () => {
  console.log("yarn change-role <id> <admin|user>");
  process.exit(1);
};

const main = async () => {
  if (
    id === undefined ||
    role === undefined ||
    !["user", "admin"].includes(role)
  ) {
    usage();
  }

  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    usage();
  }

  await prisma.user.update({
    where: {
      id: user?.id,
    },
    data: {
      role: role === "admin" ? role : undefined,
    },
  });

  console.log(`Changed ${id as string} to have role ${role as string}`);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
