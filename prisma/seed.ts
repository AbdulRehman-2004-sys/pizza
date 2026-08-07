import { PrismaClient, Role, OrderStatus, OrderType, TableStatus, PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("🌱 Seeding Pizza POS Phase 6 Database...");

  // Clean existing tables
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.kitchenStatusHistory.deleteMany();
  await prisma.kitchenOrder.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.menuItemPrice.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.pizzaSize.deleteMany();
  await prisma.extraTopping.deleteMany();
  await prisma.extraCheese.deleteMany();
  await prisma.table.deleteMany();
  await prisma.restaurantSettings.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Restaurant Settings
  const settings = await prisma.restaurantSettings.create({
    data: {
      restaurantName: "SliceMaster Pizzeria",
      logoUrl: null,
      address: "Main Boulevard, Gulberg III, Lahore, Pakistan",
      phone: "+92 42 111 749 922",
      receiptFooter: "Thank you for dining with SliceMaster! Visit again.",
      currency: "PKR",
      timezone: "Asia/Karachi",
      taxPercentage: 16.0,
    },
  });
  console.log(`✅ Seeded Restaurant Settings: ${settings.restaurantName}`);

  // 2. Seed Users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const cashierPassword = await bcrypt.hash("cashier123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Marco Rossi (Admin)",
      email: "admin@pizzapos.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const cashier = await prisma.user.create({
    data: {
      name: "Sofia Bellucci",
      email: "cashier@pizzapos.com",
      password: cashierPassword,
      role: Role.CASHIER,
    },
  });

  console.log(`✅ Created Admin user: ${admin.email}`);
  console.log(`✅ Created Cashier user: ${cashier.email}`);

  // 3. Seed Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: "John Doe",
      phone: "+92 300 1234567",
      address: "House 45, Street 12, DHA Phase 5, Lahore",
    },
  });
  console.log(`✅ Created Demo Customer: ${customer1.name}`);

  // 4. Seed Tables
  const table1 = await prisma.table.create({
    data: {
      tableNumber: 1,
      tableName: "Table 01 (Window View)",
      capacity: 4,
      status: TableStatus.AVAILABLE,
      notes: "Near front window",
    },
  });

  await prisma.table.create({
    data: {
      tableNumber: 2,
      tableName: "Table 02 (Booth)",
      capacity: 6,
      status: TableStatus.AVAILABLE,
      notes: "Family booth seating",
    },
  });

  await prisma.table.create({
    data: {
      tableNumber: 3,
      tableName: "Table 03 (Center)",
      capacity: 2,
      status: TableStatus.AVAILABLE,
      notes: "Couples seating",
    },
  });

  console.log("✅ Seeded dining tables (All AVAILABLE)");

  // 5. Seed Pizza Sizes
  const sizeSmall = await prisma.pizzaSize.create({
    data: { name: "Small (9 inch)", displayOrder: 1, isActive: true },
  });
  const sizeMedium = await prisma.pizzaSize.create({
    data: { name: "Medium (12 inch)", displayOrder: 2, isActive: true },
  });
  const sizeLarge = await prisma.pizzaSize.create({
    data: { name: "Large (14 inch)", displayOrder: 3, isActive: true },
  });
  const sizeFamily = await prisma.pizzaSize.create({
    data: { name: "Family XL (16 inch)", displayOrder: 4, isActive: true },
  });

  console.log("✅ Seeded 4 Pizza Sizes (Small, Medium, Large, Family)");

  // 6. Seed Extra Toppings
  await prisma.extraTopping.create({ data: { name: "Grilled Chicken", price: 300, displayOrder: 1, isAvailable: true } });
  await prisma.extraTopping.create({ data: { name: "Double Pepperoni", price: 250, displayOrder: 2, isAvailable: true } });
  await prisma.extraTopping.create({ data: { name: "Black Olives", price: 150, displayOrder: 3, isAvailable: true } });
  await prisma.extraTopping.create({ data: { name: "Fresh Mushrooms", price: 150, displayOrder: 4, isAvailable: true } });
  await prisma.extraTopping.create({ data: { name: "Spicy Jalapenos", price: 120, displayOrder: 5, isAvailable: true } });
  await prisma.extraTopping.create({ data: { name: "Green Capsicum", price: 100, displayOrder: 6, isAvailable: true } });
  await prisma.extraTopping.create({ data: { name: "Red Onion", price: 80, displayOrder: 7, isAvailable: true } });

  console.log("✅ Seeded Extra Toppings");

  // 7. Seed Extra Cheese Configuration
  const extraCheese = await prisma.extraCheese.create({
    data: {
      name: "Extra Mozzarella Cheese",
      extraPrice: 250,
      isAvailable: true,
    },
  });
  console.log(`✅ Seeded Extra Cheese Config: ${extraCheese.name} (Rs. ${extraCheese.extraPrice})`);

  // 8. Seed Categories
  const categoryPizzas = await prisma.category.create({
    data: { name: "Signature Pizzas", description: "Hand-tossed brick oven pizzas", displayOrder: 1, isActive: true },
  });
  const categorySides = await prisma.category.create({
    data: { name: "Sides & Appetizers", description: "Crispy wings, garlic bread, appetizers", displayOrder: 2, isActive: true },
  });
  const categoryDrinks = await prisma.category.create({
    data: { name: "Beverages", description: "Cold soft drinks and water", displayOrder: 3, isActive: true },
  });

  // 9. Seed Menu Items with Customization Settings
  const pizza1 = await prisma.menuItem.create({
    data: {
      categoryId: categoryPizzas.id,
      name: "Pepperoni Supreme",
      description: "Double pepperoni, mozzarella cheese, and rich marinara sauce.",
      basePrice: 1450,
      isCustomizable: true,
      allowSizes: true,
      allowExtraCheese: true,
      allowExtraToppings: true,
      allowNotes: true,
      itemPrices: {
        create: [
          { sizeId: sizeSmall.id, price: 1200 },
          { sizeId: sizeMedium.id, price: 1800 },
          { sizeId: sizeLarge.id, price: 2500 },
          { sizeId: sizeFamily.id, price: 3200 },
        ],
      },
    },
  });

  const pizza2 = await prisma.menuItem.create({
    data: {
      categoryId: categoryPizzas.id,
      name: "BBQ Chicken Feast",
      description: "Grilled chicken breast, red onion, smoky BBQ sauce drizzle.",
      basePrice: 1550,
      isCustomizable: true,
      allowSizes: true,
      allowExtraCheese: true,
      allowExtraToppings: true,
      allowNotes: true,
      itemPrices: {
        create: [
          { sizeId: sizeSmall.id, price: 1300 },
          { sizeId: sizeMedium.id, price: 1950 },
          { sizeId: sizeLarge.id, price: 2700 },
          { sizeId: sizeFamily.id, price: 3400 },
        ],
      },
    },
  });

  await prisma.menuItem.create({
    data: {
      categoryId: categorySides.id,
      name: "Garlic Parmesan Wings (10pcs)",
      description: "Crispy oven-baked wings coated in garlic butter & parmesan.",
      basePrice: 1199,
      isCustomizable: false,
      allowSizes: false,
      allowExtraCheese: false,
      allowExtraToppings: false,
      allowNotes: true,
    },
  });

  await prisma.menuItem.create({
    data: {
      categoryId: categoryDrinks.id,
      name: "San Pellegrino Sparkling (500ml)",
      description: "Refreshing Italian mineral water.",
      basePrice: 350,
      isCustomizable: false,
      allowSizes: false,
      allowExtraCheese: false,
      allowExtraToppings: false,
      allowNotes: false,
    },
  });

  console.log("✅ Seeded customizable pizzas & standard menu items with relational price matrix");

  // 10. Seed Demo Order & Automatic KOT Ticket
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "ORD-1001",
      status: OrderStatus.READY,
      type: OrderType.DINE_IN,
      subtotal: 3000,
      taxAmount: 480,
      discountAmount: 0,
      totalAmount: 3480,
      customerNotes: "Cut into 8 slices",
      customerId: customer1.id,
      tableId: table1.id,
      tableNumber: table1.tableNumber,
      cashierId: cashier.id,
      items: {
        create: [
          {
            productId: pizza1.id,
            productName: pizza1.name,
            sizeId: sizeLarge.id,
            sizeName: sizeLarge.name,
            extraCheese: true,
            cheesePrice: 250,
            selectedToppings: [{ id: "top1", name: "Double Pepperoni", price: 250 }],
            itemNotes: "Extra crispy crust",
            quantity: 1,
            unitPrice: 3000,
            totalPrice: 3000,
          },
        ],
      },
    },
  });

  // Seed Kitchen Order Ticket (KOT)
  const kot1 = await prisma.kitchenOrder.create({
    data: {
      kotNumber: "KOT-1001",
      orderId: order1.id,
      status: OrderStatus.READY,
      startedAt: new Date(Date.now() - 15 * 60000),
      readyAt: new Date(Date.now() - 5 * 60000),
      statusHistory: {
        create: [
          {
            status: OrderStatus.PENDING,
            changedById: cashier.id,
          },
          {
            status: OrderStatus.READY,
            changedById: cashier.id,
          },
        ],
      },
    },
  });

  console.log(`✅ Seeded demo order: ${order1.orderNumber} with READY status`);
  console.log("🎉 Phase 6 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
