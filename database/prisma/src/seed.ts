import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.info('🌱 Seeding database...');

  await prisma.requestHistory.deleteMany();
  await prisma.variable.deleteMany();
  await prisma.environment.deleteMany();
  await prisma.apiRequest.deleteMany();
  await prisma.folder.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.user.deleteMany();

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@nuvro.dev',
      username: 'demo',
      displayName: 'Demo User',
      emailVerified: true,
    },
  });

  console.info(`✅ Created user: ${demoUser.email}`);

  const workspace = await prisma.workspace.create({
    data: {
      name: 'Demo Workspace',
      slug: 'demo-workspace',
      description: 'A starter workspace for exploring NUVRO API Studio',
      ownerId: demoUser.id,
      members: {
        create: {
          userId: demoUser.id,
          role: 'OWNER',
        },
      },
    },
  });

  console.info(`✅ Created workspace: ${workspace.name}`);

  const collection = await prisma.collection.create({
    data: {
      name: 'JSONPlaceholder API',
      description: 'Sample requests against the JSONPlaceholder REST API',
      workspaceId: workspace.id,
    },
  });

  console.info(`✅ Created collection: ${collection.name}`);

  const postsFolder = await prisma.folder.create({
    data: {
      name: 'Posts',
      description: 'Post-related endpoints',
      collectionId: collection.id,
      sortOrder: 0,
    },
  });

  const requests = await prisma.apiRequest.createMany({
    data: [
      {
        name: 'List Posts',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts',
        collectionId: collection.id,
        folderId: postsFolder.id,
        headers: JSON.stringify([{ key: 'Accept', value: 'application/json', enabled: true }]),
        queryParams: JSON.stringify([]),
        sortOrder: 0,
      },
      {
        name: 'Get Post by ID',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/{{postId}}',
        collectionId: collection.id,
        folderId: postsFolder.id,
        headers: JSON.stringify([{ key: 'Accept', value: 'application/json', enabled: true }]),
        queryParams: JSON.stringify([]),
        sortOrder: 1,
      },
      {
        name: 'Create Post',
        method: 'POST',
        url: 'https://jsonplaceholder.typicode.com/posts',
        collectionId: collection.id,
        folderId: postsFolder.id,
        headers: JSON.stringify([
          { key: 'Content-Type', value: 'application/json', enabled: true },
          { key: 'Accept', value: 'application/json', enabled: true },
        ]),
        queryParams: JSON.stringify([]),
        bodyType: 'JSON',
        bodyContent: JSON.stringify(
          { title: 'Hello NUVRO', body: 'Testing the API Studio', userId: 1 },
          null,
          2,
        ),
        sortOrder: 2,
      },
    ],
  });

  console.info(`✅ Created ${requests.count} sample requests`);

  const environment = await prisma.environment.create({
    data: {
      name: 'Development',
      workspaceId: workspace.id,
      isDefault: true,
      variables: {
        createMany: {
          data: [
            {
              key: 'baseUrl',
              value: 'https://jsonplaceholder.typicode.com',
              description: 'Base URL for JSONPlaceholder API',
              enabled: true,
            },
            {
              key: 'postId',
              value: '1',
              description: 'Sample post ID for parameterised requests',
              enabled: true,
            },
          ],
        },
      },
    },
  });

  console.info(`✅ Created environment: ${environment.name}`);
  console.info('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
