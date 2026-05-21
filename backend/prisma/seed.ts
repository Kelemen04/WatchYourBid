// prisma/seed.ts
import "dotenv/config"; // EZ LEGYEN AZ ELSŐ SOR
import { prisma } from "../src/db/client"; // <--- ÍRD ÁT A PONTOS ELÉRÉSI ÚTRA HA MÁSHOL VAN!
import * as argon2 from "argon2";

async function main() {
  console.log('--- Seeding started using Driver Adapter ---');

  // Ellenőrizzük, hogy látja-e az adatbázist
  try {
    await prisma.$connect();
    console.log("Kapcsolat az adatbázissal: OK");
  } catch (err) {
    console.error("Adatbázis kapcsolódási hiba! Fut a Docker?", err);
    process.exit(1);
  }

  await prisma.trendings.deleteMany({});
  await prisma.wristwatch.deleteMany({});
  await prisma.pocketWatch.deleteMany({});
  await prisma.smartwatch.deleteMany({});
  await prisma.clock.deleteMany({});
  await prisma.watchItem.deleteMany({});
  await prisma.auction.deleteMany({});
  await prisma.user.deleteMany({}); // Címek (Address) automatikusan törlődnek, ha jól van beállítva a cascade

  const adminPassword = await argon2.hash('Admin123!');
  const userPassword = await argon2.hash('User123!');

  // --- 1. SUPER ADMIN LÉTREHOZÁSA (Eladó is egyben, hogy lehessenek aukciói) ---
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@watchyourbid.com',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      status: 'VERIFIED',
      emailVerified: true, // 🔥 Emiatt azonnal be tudsz lépni!
      seller: {
        create: {
          description: "Premium watch seller (Admin)",
          rating: 5,
          address: {
            create: {
              country: "HU",
              region: "Pest",
              city: "Budapest",
              street: "Fő utca",
              number: "1",
              zipCode: "1011"
            }
          }
        }
      }
    },
  });

  // --- 2. SIMA USER LÉTREHOZÁSA (Ő csak vásárló) ---
  await prisma.user.create({
    data: {
      username: 'user1',
      email: 'user1@example.com',
      password: userPassword,
      role: 'USER',
      status: 'VERIFIED',
      emailVerified: true, // 🔥 Emiatt azonnal be tudsz lépni!
      buyer: {
        create: {
          shippingAddress: {
            create: {
              country: "HU",
              region: "Pest",
              city: "Budapest",
              street: "Vásárló utca",
              number: "10",
              zipCode: "1022"
            }
          }
        }
      }
    },
  });

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // --- 3. AUKCIÓK LÉTREHOZÁSA (Mind az adminhoz van kötve) ---

  // 1. Wristwatch
  await prisma.auction.create({
    data: {
      title: 'Patek Philippe Nautilus 5711',
      description: 'The legendary blue dial Nautilus. A masterpiece of steel and sapphire.',
      auctionType: 'ENGLISH',
      startTime: now,
      endTime: nextWeek,
      startingPrice: 85000,
      currentPrice: 85000,
      status: 'ACTIVE',
      userId: adminUser.id, // 🔥 Hozzárendelve az adminhoz
      watchItem: {
        create: {
          category: 'WRISTWATCH',
          brand: 'Patek Philippe',
          model: '5711/1A',
          material: 'Steel',
          condition: 'NEW',
          productionYear: 2024,
          wristwatch: {
            create: {
              movementType: 'Automatic',
              caseDiameter: 40,
              waterResistance: '120m',
              strapMaterial: 'Steel',
              glassType: 'Sapphire'
            }
          }
        }
      }
    }
  });

  // 2. Pocketwatch
  await prisma.auction.create({
    data: {
      title: 'Vacheron Constantin Antique',
      description: 'Rare 19th-century masterpiece with gold casing and hand-painted dial.',
      auctionType: 'ENGLISH',
      startTime: now,
      endTime: nextWeek,
      startingPrice: 12000,
      currentPrice: 12000,
      status: 'ACTIVE',
      userId: adminUser.id, // 🔥 Hozzárendelve az adminhoz
      watchItem: {
        create: {
          category: 'POCKETWATCH',
          brand: 'Vacheron Constantin',
          model: 'Antique Gold',
          material: '18K Gold',
          condition: 'VINTAGE',
          productionYear: 1890,
          pocketWatch: {
            create: {
              caseType: 'Hunter',
              movementType: 'Manual',
              hasChain: true
            }
          }
        }
      }
    }
  });

  // 3. Smartwatch
  await prisma.auction.create({
    data: {
      title: 'TAG Heuer Connected E4',
      description: 'Luxury meets digital precision. High-performance smartwatch in titanium.',
      auctionType: 'ENGLISH',
      startTime: now,
      endTime: nextWeek,
      startingPrice: 2100,
      currentPrice: 2100,
      status: 'ACTIVE',
      userId: adminUser.id, // 🔥 Hozzárendelve az adminhoz
      watchItem: {
        create: {
          category: 'SMARTWATCH',
          brand: 'TAG Heuer',
          model: 'Connected E4',
          material: 'Titanium',
          condition: 'NEW',
          productionYear: 2025,
          smartwatch: {
            create: {
              os: 'Wear OS',
              batteryLife: 24,
              screenType: 'AMOLED',
              sensors: 'GPS, Heart Rate',
              compatibility: 'Android/iOS'
            }
          }
        }
      }
    }
  });

  // 4. Clock
  await prisma.auction.create({
    data: {
      title: 'Antique Atmos Clock',
      description: 'A clock that lives on air. Jaeger-LeCoultre Atmos, perpetual motion.',
      auctionType: 'ENGLISH',
      startTime: now,
      endTime: nextWeek,
      startingPrice: 6500,
      currentPrice: 6500,
      status: 'ACTIVE',
      userId: adminUser.id, // 🔥 Hozzárendelve az adminhoz
      watchItem: {
        create: {
          category: 'CLOCK',
          brand: 'Jaeger-LeCoultre',
          model: 'Atmos Classic',
          material: 'Gold Plated',
          condition: 'USED',
          productionYear: 2010,
          clock: {
            create: {
              clockType: 'Table Clock',
              powerSource: 'Atmospheric pressure',
              dimensions: '22x18x13 cm'
            }
          }
        }
      }
    }
  });

  console.log('--- Seeding successfully finished ---');
}

main()
  .catch((e) => {
    console.error("SEED VÉGZETES HIBA:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });