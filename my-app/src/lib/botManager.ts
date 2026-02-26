import TelegramBot from "node-telegram-bot-api";
import { prisma } from "./prisma";

const db = prisma as any; // Bot models not in generated types until prisma generate succeeds

interface BotRegistry {
    [token: string]: {
        bot: TelegramBot;
        userId: string;
    };
}

const globalForBots = globalThis as unknown as {
    botRegistry: BotRegistry | undefined;
};

const botRegistry = globalForBots.botRegistry ?? {};

if (process.env.NODE_ENV !== "production") {
    globalForBots.botRegistry = botRegistry;
}

export async function startBotForToken(token: string) {
    if (botRegistry[token]) {
        try {
            botRegistry[token].bot.stopPolling();
        } catch (e) {
            console.warn("Error stopping bot", e);
        }
        delete botRegistry[token];
    }

    try {
        const botIntegration = await prisma.botIntegration.findFirst({
            where: { telegramToken: token, status: "ACTIVE" },
        });

        if (!botIntegration) {
            console.error(`No active merchant found for token ${token.substring(0, 10)}... Skipping.`);
            return;
        }

        const merchantId = botIntegration.userId;
        const bot = new TelegramBot(token, { polling: true });

        // ─── Helper: Ensure customer exists ───────────────────────────────────
        const ensureCustomer = async (from: TelegramBot.User | undefined, chatId: number) => {
            if (!from) return null;
            const telegramId = from.id.toString();

            // Enforce and increment merchant botClicksUsed
            const merchant = await db.user.findUnique({ where: { id: merchantId }, select: { botClicksUsed: true, botClicksQuota: true } });

            if (merchant && merchant.botClicksUsed >= merchant.botClicksQuota) {
                bot.sendMessage(chatId, "❌ Bot limits reached. The merchant has exceeded their free quota. Please try again later.");
                return null;
            }

            await db.user.updateMany({
                where: { id: merchantId },
                data: { botClicksUsed: { increment: 1 } }
            });

            let customer = await db.botCustomer.findUnique({
                where: { telegramId_userId: { telegramId, userId: merchantId } },
            });

            if (!customer) {
                customer = await db.botCustomer.create({
                    data: {
                        telegramId,
                        username: from.username,
                        firstName: from.first_name,
                        lastName: from.last_name,
                        userId: merchantId,
                        balance: 0.0,
                    },
                });
            } else {
                customer = await db.botCustomer.update({
                    where: { id: customer.id },
                    data: { username: from.username, firstName: from.first_name },
                });
            }
            return customer;
        };

        // ─── Main keyboard (shown at the bottom of chat) ───────────────────────
        const replyKeyboardOpts: TelegramBot.SendMessageOptions = {
            reply_markup: {
                keyboard: [
                    [{ text: "🛍️ Buy" }, { text: "👤 Profile" }, { text: "📋 Availability" }],
                    [{ text: "💌 Write to support" }, { text: "❓ FAQ" }],
                ],
                resize_keyboard: true,
            },
        };

        // ─── /start ────────────────────────────────────────────────────────────
        bot.onText(/\/start/, async (msg) => {
            const chatId = msg.chat.id;
            await ensureCustomer(msg.from, chatId);
            bot.sendMessage(chatId, "Welcome to Imesh cloud store ! \\[New Bot\\] ☁️\n\nSelect an option below:", replyKeyboardOpts);
        });

        // ─── Text message handler ──────────────────────────────────────────────
        bot.on("message", async (msg) => {
            try {
                const chatId = msg.chat.id;
                const text = msg.text?.trim() ?? "";
                console.log(`[DEBUG] Bot received message from ${chatId}: "${text}"`);
                if (text.startsWith("/start")) return;

                const customer = await ensureCustomer(msg.from, chatId);
                if (!customer) return;

                console.log(`[Bot] Message from ${chatId}: "${text}", lastAction: ${customer.lastAction}`);

                // ── Awaiting deposit amount ──
                if (customer.lastAction === "awaiting_deposit_amount") {
                    const amount = parseFloat(text);

                    if (isNaN(amount) || amount <= 0) {
                        await bot.sendMessage(chatId, "❌ Invalid amount. Please enter a valid number (e.g., 20).");
                        return;
                    }

                    await db.botCustomer.update({
                        where: { id: customer.id },
                        data: { lastAction: null },
                    });

                    const payment = await db.botPayment.create({
                        data: {
                            customerId: customer.id,
                            amount: amount,
                            paymentMethod: "main_gateway",
                            status: "pending",
                            userId: merchantId
                        }
                    });
                    console.log(`[Bot] Payment record created: ${payment.id}`);

                    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://gateway.imesh.cloud";
                    console.log(`[Bot] Generating payment for amount ${amount}, baseUrl: ${baseUrl}`);

                    const responseMsg =
                        `💰 Top-up: Crypto Gateway\n` +
                        `➖➖➖➖➖➖➖➖➖➖\n` +
                        `▪️ To recharge, click on the button below\n` +
                        `Pay easily via our native crypto checkout.\n` +
                        `▪️ Top-up amount: $${amount}\n` +
                        `➖➖➖➖➖➖➖➖➖➖\n` +
                        `⚠️ After payment, click on Check payment`;

                    await bot.sendMessage(chatId, responseMsg, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "💎 Pay with crypto", url: `${baseUrl}/pay/deposit?id=${customer.id}&amount=${amount}` }],
                                [{ text: "🔄 Check payment", callback_data: `check_payment_${payment.id}` }],
                            ],
                        },
                    }).catch(err => {
                        console.error("[Bot] Error sending payment link:", err.message);
                        bot.sendMessage(chatId, `⚠️ Error generating payment link: ${err.message}\n\nPlease contact support.`);
                    });
                    return;
                }

                // ── Menu buttons ──
                if (text === "🛍️ Buy" || text === "📋 Availability") {
                    const products = await db.botProduct.findMany({
                        where: { userId: merchantId, status: "available" },
                        include: { credentials: { where: { status: "available" } } },
                    });
                    const availableProducts = products.filter((p: any) => p.credentials.length > 0);

                    if (availableProducts.length === 0) {
                        await bot.sendMessage(chatId, "Sorry, no accounts available right now.");
                        return;
                    }

                    if (text === "📋 Availability") {
                        const grouped: Record<string, typeof availableProducts> = {};
                        for (const p of availableProducts) {
                            if (!grouped[p.type]) grouped[p.type] = [];
                            grouped[p.type].push(p);
                        }
                        let response = "📋 *Product Availability*\n\n";
                        for (const [cat, items] of Object.entries(grouped)) {
                            response += `➖➖➖ *${cat} 🛍️* ➖➖➖\n`;
                            for (const item of items) {
                                response += `${item.name} | $${Number(item.price).toFixed(2)} | In stock ${item.credentials.length} pcs\n`;
                            }
                            response += "\n";
                        }
                        await bot.sendMessage(chatId, response, { parse_mode: "Markdown" });
                        return;
                    }

                    const categories = Array.from(new Set(availableProducts.map((p: any) => p.type)));
                    const keyboard = categories.map((cat) => [{ text: cat as string, callback_data: `cat_${cat}` }]);
                    await bot.sendMessage(chatId, "🛍️ Select the product you need", {
                        reply_markup: { inline_keyboard: keyboard },
                    });
                    return;
                }

                if (text === "👤 Profile") {
                    const freshCustomer = await db.botCustomer.findUnique({ where: { id: customer.id } }) ?? customer;
                    const ordersCount = await db.botOrder.count({ where: { customerId: customer.id } });
                    const balanceUSD = Number(freshCustomer.balance).toFixed(2);
                    await bot.sendMessage(
                        chatId,
                        `👤 Your profile [v2]\n➖➖➖➖➖➖➖➖➖➖\n🫆 ID: ${freshCustomer.telegramId}\n💵 Balance: ${balanceUSD}$\n🛍️ Purchased goods: ${ordersCount}pcs`,
                        {
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: "💰 Add funds", callback_data: "add_funds_imesh" },
                                        { text: "📜 Purchase history", callback_data: "purchase_history_imesh" },
                                    ],
                                ],
                            },
                            parse_mode: "Markdown",
                        }
                    );
                    return;
                }

                if (text === "💌 Write to support") {
                    const supportUser = botIntegration.botUsername ? `${botIntegration.botUsername}` : "rochana_imesh";
                    bot.sendMessage(chatId, `💌 For support, please contact:`, {
                        reply_markup: {
                            inline_keyboard: [[{ text: `💌 Write to support`, url: `https://t.me/${supportUser}` }]],
                        },
                    });
                    return;
                }

                if (text === "❓ FAQ") {
                    const term = customer.firstName ?? "User";
                    bot.sendMessage(chatId, `❓ FAQs\n\nFor any questions, please contact our support team.\nHello ${term}, welcome!\n\nCheck our website or write to support for help.`);
                    return;
                }
            } catch (err) {
                console.error("[Bot] Error in message handler:", err);
            }
        });

        // ─── Callback query handler ────────────────────────────────────────────
        bot.on("callback_query", async (query) => {
            const chatId = query.message?.chat.id;
            const msgId = query.message?.message_id;
            if (!chatId || !msgId || !query.message) return;

            const customer = await ensureCustomer(query.from, chatId);
            if (!customer) return;

            const data = query.data ?? "";

            try {
                // ── Add Funds: ask for amount directly ──
                if (data === "add_funds_imesh") {
                    bot.deleteMessage(chatId, msgId).catch(() => { });
                    await bot.sendMessage(chatId, `💰 Enter amount to deposit (USD):\n\nSend a number (e.g., 20) in the chat.`, {
                        parse_mode: "Markdown",
                    });
                    await db.botCustomer.update({
                        where: { id: customer.id },
                        data: { lastAction: "awaiting_deposit_amount" },
                    });
                    console.log(`[Bot] lastAction set to awaiting_deposit_amount for customer ${customer.id}`);
                }

                // ── Copy helpers ──
                else if (data.startsWith("copy_userid_")) {
                    const val = data.substring(12);
                    await bot.sendMessage(chatId, `\`${val}\``, { parse_mode: "Markdown" });
                    await bot.sendMessage(chatId, "✅ User ID sent! Long-press to copy.");
                    bot.answerCallbackQuery(query.id);
                }

                else if (data.startsWith("copy_payid_")) {
                    const val = data.substring(11);
                    await bot.sendMessage(chatId, `\`${val}\``, { parse_mode: "Markdown" });
                    await bot.sendMessage(chatId, "✅ Pay ID sent! Long-press to copy.");
                    bot.answerCallbackQuery(query.id);
                }

                // ── Check payment ──
                else if (data.startsWith("check_payment")) {
                    // Check for any pending payment for this customer
                    const pending = await db.botPayment.findFirst({
                        where: { customerId: customer.id, status: "pending" },
                        orderBy: { createdAt: "desc" },
                    });
                    if (pending) {
                        await bot.answerCallbackQuery(query.id, {
                            text: "⏳ Payment still pending. Please wait for confirmation.",
                            show_alert: true,
                        });
                    } else {
                        await bot.answerCallbackQuery(query.id, {
                            text: "No pending payments found. If you paid, contact support.",
                            show_alert: true,
                        });
                    }
                }

                // ── Profile refresh ──
                else if (data === "profile_refresh") {
                    const latest = (await db.botCustomer.findUnique({ where: { id: customer.id } })) ?? customer;
                    const ordersCount = await db.botOrder.count({ where: { customerId: customer.id } });
                    const balanceUSD = Number(latest.balance).toFixed(2);
                    await bot.editMessageText(
                        `👤 Your profile\n➖➖➖➖➖➖➖➖➖➖\n🫆 ID: ${latest.telegramId}\n💵 Balance: ${balanceUSD}$\n🛍️ Purchased goods: ${ordersCount}pcs`,
                        {
                            chat_id: chatId,
                            message_id: msgId,
                            parse_mode: "Markdown",
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        { text: "💰 Add funds", callback_data: "add_funds_imesh" },
                                        { text: "📜 Purchase history", callback_data: "purchase_history_imesh" },
                                    ],
                                ],
                            },
                        }
                    );
                }

                // ── Purchase history ──
                else if (data === "purchase_history_imesh") {
                    const orders = await db.botOrder.findMany({
                        where: { customerId: customer.id },
                        include: { product: true, credential: true },
                        orderBy: { createdAt: "desc" },
                        take: 5,
                    });

                    if (orders.length === 0) {
                        await bot.editMessageText("You have no previous orders.", {
                            chat_id: chatId,
                            message_id: msgId,
                            reply_markup: { inline_keyboard: [[{ text: "🔙 Back to profile", callback_data: "profile_refresh" }]] },
                        });
                    } else {
                        let hist = "📜 *Purchase history (Last 5)*\n\n";
                        for (const o of orders) {
                            hist += `📅 ${o.createdAt.toLocaleDateString()}\n🛍️ ${o.product?.name ?? "Unknown"}\n🔑 \`${o.credential?.content ?? "N/A"}\`\n\n`;
                        }
                        await bot.editMessageText(hist, {
                            chat_id: chatId,
                            message_id: msgId,
                            parse_mode: "Markdown",
                            reply_markup: { inline_keyboard: [[{ text: "🔙 Back to profile", callback_data: "profile_refresh" }]] },
                        });
                    }
                }

                // ── Category selection ──
                else if (data.startsWith("cat_")) {
                    const category = data.substring(4);
                    const products = await db.botProduct.findMany({
                        where: { userId: merchantId, status: "available", type: category },
                        include: { credentials: { where: { status: "available" } } },
                    });
                    const available = products.filter((p: any) => p.credentials.length > 0);
                    const keyboard = available.map((p: any) => [
                        {
                            text: `${p.name} | $${Number(p.price).toFixed(2)} | ${p.credentials.length} pcs`,
                            callback_data: `prod_${p.id}`,
                        },
                    ]);
                    keyboard.push([{ text: "🔙 Back", callback_data: "shop_back" }]);
                    await bot.editMessageText(
                        `🛍️ *Select product*\n➖➖➖➖➖➖➖➖➖➖\nCategory: ${category}`,
                        {
                            chat_id: chatId,
                            message_id: msgId,
                            parse_mode: "Markdown",
                            reply_markup: { inline_keyboard: keyboard },
                        }
                    );
                }

                // ── Shop back ──
                else if (data === "shop_back") {
                    const products = await db.botProduct.findMany({
                        where: { userId: merchantId, status: "available" },
                        include: { credentials: { where: { status: "available" } } },
                    });
                    const avail = products.filter((p: any) => p.credentials.length > 0);
                    const cats = Array.from(new Set(avail.map((p: any) => p.type)));
                    const keyboard = cats.map((cat) => [{ text: cat as string, callback_data: `cat_${cat}` }]);
                    await bot.editMessageText("🛍️ Select the product you need", {
                        chat_id: chatId,
                        message_id: msgId,
                        reply_markup: { inline_keyboard: keyboard },
                    });
                }

                // ── Product detail ──
                else if (data.startsWith("prod_")) {
                    const productId = data.substring(5);
                    const product = await db.botProduct.findUnique({
                        where: { id: productId },
                        include: { credentials: { where: { status: "available" } } },
                    });
                    if (!product) return;
                    const stock = product.credentials.length;
                    await bot.editMessageText(
                        `📜 *Product details*\n➖➖➖➖➖➖➖➖➖➖\n🛍️ Title: ${product.name}\n📋 Description: ${product.description ?? "N/A"}\n\n💵 Price: $${Number(product.price).toFixed(2)}\n📦 In stock: ${stock} pcs`,
                        {
                            chat_id: chatId,
                            message_id: msgId,
                            parse_mode: "Markdown",
                            reply_markup: {
                                inline_keyboard: [
                                    ...(stock > 0
                                        ? [[{ text: `🛒 Buy ($${Number(product.price).toFixed(2)})`, callback_data: `buy_${product.id}` }]]
                                        : []),
                                    [{ text: "🔙 Back", callback_data: `cat_${product.type}` }],
                                ],
                            },
                        }
                    );
                }

                // ── Buy now ──
                else if (data.startsWith("buy_")) {
                    const productId = data.substring(4);
                    const p = await db.botProduct.findUnique({ where: { id: productId } });
                    const c = await db.botCustomer.findUnique({ where: { id: customer.id } });
                    if (!p || !c) return;

                    const price = Number(p.price);
                    const balance = Number(c.balance);

                    if (balance < price) {
                        await bot.answerCallbackQuery(query.id, {
                            text: `❌ Insufficient balance! Price: $${price.toFixed(2)}, Your Balance: $${balance.toFixed(2)}`,
                            show_alert: true,
                        });
                        return;
                    }

                    const result = await prisma.$transaction(async (tx) => {
                        const credential = await tx.botCredential.findFirst({
                            where: { productId, status: "available" },
                        });
                        if (!credential) return null;

                        await tx.botCredential.update({ where: { id: credential.id }, data: { status: "sold" } });
                        await tx.botCustomer.update({ where: { id: c.id }, data: { balance: balance - price } });
                        const order = await tx.botOrder.create({
                            data: { productId, credentialId: credential.id, customerId: c.id, status: "completed", userId: merchantId },
                        });
                        return { order, credential };
                    });

                    if (!result) {
                        await bot.answerCallbackQuery(query.id, { text: "❌ Sorry, this item is out of stock.", show_alert: true });
                        return;
                    }

                    await bot.sendMessage(
                        chatId,
                        `✅ *Successful purchase!*\n\nProduct: ${p.name}\nQuantity: 1\nTotal: $${price.toFixed(2)}\n\nYour item:\n\`\`\`\n${result.credential.content}\n\`\`\``,
                        { parse_mode: "Markdown" }
                    );
                    await bot.answerCallbackQuery(query.id, { text: "✅ Purchase successful!" });
                    return;
                }

                await bot.answerCallbackQuery(query.id).catch(() => { });
            } catch (err) {
                console.error("Callback query error:", err);
                await bot.answerCallbackQuery(query.id, { text: "An error occurred.", show_alert: true }).catch(() => { });
            }
        });

        bot.on("polling_error", (error: any) => {
            console.error(`Polling error [${token.substring(0, 5)}...]:`, error.code ?? error.message);
        });

        botRegistry[token] = { bot, userId: merchantId };
        console.log(`✅ Telegram Bot started for merchant ${merchantId}`);
    } catch (err) {
        console.error(`Failed to start Telegram Bot for token ${token}`, err);
    }
}

export function stopBotForToken(token: string) {
    if (botRegistry[token]) {
        try {
            botRegistry[token].bot.stopPolling();
        } catch (e) {
            console.warn("Error stopping bot", e);
        }
        delete botRegistry[token];
        console.log(`Bot stopped for token ${token.substring(0, 10)}...`);
    }
}
