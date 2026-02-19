import { test, expect } from '@playwright/test';

test('Complete Project Flow - RePlastix Innovations & Salesforce Integration', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes timeout

    const email = 'm.chiranjeevi.adarsh+2@gmail.com';
    const password = 'Chiru@534';
    const courseName = 'Revolutionizing Agriculture with AgriEdge Or-Mange Ltd: A Salesforce-Driven Order';

    // ============================================================
    // 1️⃣ LOGIN & PRIVACY
    // ============================================================
    console.log('🔑 Step 1: Login');
    await page.goto('https://myskillwallet.ai/login');

    const privacyBuster = async () => {
        try {
            const acceptBtn = page.getByRole('button', { name: /Accept All/i });
            if (await acceptBtn.isVisible({ timeout: 2000 })) {
                await acceptBtn.click({ force: true });
                await page.waitForTimeout(1000);
            }
        } catch (e) { }
    };

    await privacyBuster();
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    await page.waitForURL(/.*dashboard.*/i, { timeout: 30000 });
    console.log('✅ Login successful');
    await privacyBuster();

    // ============================================================
    // 2️⃣ NAVIGATE & SEARCH (Robust)
    // ============================================================
    console.log('🏦 Step 2: Navigate to Skill Bank');
    await page.getByRole('link', { name: 'Skill Bank' }).first().click();
    await page.waitForTimeout(2000);
    await privacyBuster();

    // Search bar only appears after clicking "Capstone Projects"
    console.log('📂 Selecting Capstone Projects module...');
    await page.locator('div, p').filter({ hasText: /^Capstone Projects$/ }).first().click({ force: true });
    await page.waitForTimeout(2000);

    console.log(`🔍 Searching for: "${courseName}"`);
    const searchInput = page.getByPlaceholder(/Search by skill|Search/i).first();
    await searchInput.waitFor({ state: 'visible' });
    await searchInput.fill(courseName);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.waitForTimeout(3000);

    // ============================================================
    // 3️⃣ PURCHASE FLOW (Conditional)
    // ============================================================
    console.log('🛒 Step 3: Checking Purchase Status...');
    const addToCart = page.getByRole('button', { name: 'Add To Cart' }).first();
    const accessNow = page.getByRole('button', { name: 'Access Now' }).first();

    if (await addToCart.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('🛍️ Course not purchased. Starting purchase flow...');
        await addToCart.click({ force: true });
        await page.waitForTimeout(1000);

        await page.getByRole('button', { name: 'Proceed' }).click();
        await page.waitForTimeout(2000);

        await page.getByRole('button', { name: 'Pay Now' }).click();
        await page.waitForTimeout(2000);

        const confirm = page.getByRole('button', { name: 'Confirm' });
        if (await confirm.isVisible()) await confirm.click();
        await page.waitForTimeout(3000);
        console.log('✅ Purchase completed!');
    } else {
        console.log('✅ Course already purchased.');
    }

    // ============================================================
    // 4️⃣ ACCESS & REPO (Updated with Demo/Repo Logic)
    // ============================================================
    console.log('🚀 Accessing course content...');
    if (await accessNow.isVisible()) {
        await accessNow.click();
    } else {
        await page.locator('div, button').filter({ hasText: courseName }).first().click();
    }
    await page.waitForTimeout(4000);

    console.log('📹 Handling View Demo and View Repo...');

    // VIEW DEMO Logic
    const viewDemo = page.getByRole('button', { name: 'View Demo' });
    if (await viewDemo.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('   🎬 Found "View Demo", opening popup...');
        const page1Promise = page.waitForEvent('popup').catch(() => null);
        await viewDemo.click();
        const page1 = await page1Promise;
        if (page1) {
            await page1.waitForTimeout(2000);
            await page1.close();
        }
    }

    // VIEW REPO (GITHUB) Logic
    const viewRepo = page.getByRole('button', { name: 'View Repo' });
    const addGithubBtn = page.getByRole('button', { name: 'Add Github Link' });

    if (await addGithubBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('   🔗 Github link empty, adding it...');
        await addGithubBtn.click();
        await page.getByRole('textbox', { name: 'GitHub Repository URL' }).fill('https://github.com/project534/testing');
        await page.getByRole('button', { name: 'Update GitHub Link' }).click();
        await page.waitForTimeout(2000);
        console.log('   ✅ GitHub link added successfully.');
    }

    if (await viewRepo.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('   🔗 Found "View Repo", clicking to verify...');
        const pageRepoPromise = page.waitForEvent('popup').catch(() => null);
        await viewRepo.click();
        const pageRepo = await pageRepoPromise;
        if (pageRepo) {
            await pageRepo.waitForTimeout(3000); // Observe for 3 seconds
            await pageRepo.close();
            console.log('   ✅ Repo verification complete.');
        }
    }

    // ============================================================
    // 5️⃣ WORKSPACE & MODULES (User Codegen Steps)
    // ============================================================
    console.log('🧪 Entering Workspace...');
    // Support both header button and specific tabs
    const workspaceBtn = page.getByRole('button', { name: 'Workspace' }).or(page.getByText('Workspace', { exact: true }));
    await workspaceBtn.first().click();
    await page.waitForTimeout(3000);

    // List of modules to interact with (from codegen)
    const moduleFlow = [
        { name: 'Salesforce Credentials setup', items: ['Developer Account Creation', 'Account Verification'] },
        { name: 'Data Management-Objects', items: ['Object Creation-1', 'Object Creation-2', 'More Objects Creation'] },
        { name: 'Data Management-Tabs', items: ['Object Tab Creation', 'More Tabs Creation'] },
        { name: 'Data Management-App Manager', items: ['Create a Lightning App'] },
        { name: 'Data Management-Fields &', items: ['Field Creation-1', 'Field Creation-2', 'More Field Creation'] },
        { name: 'Data Management -Field Type', items: ['Formula Field-1', 'Formula Field-2', 'Validation Rule-3', 'Validation Rule-4'] }
    ];

    for (const mod of moduleFlow) {
        console.log(`📦 Opening Module: ${mod.name}`);
        const modBtn = page.getByRole('button', { name: new RegExp(mod.name, 'i') }).first();
        await modBtn.scrollIntoViewIfNeeded();
        if (await modBtn.isVisible()) {
            await modBtn.click();
            await page.waitForTimeout(1000);

            for (const item of mod.items) {
                console.log(`   🔹 Selecting: ${item}`);
                const itemTarget = page.getByText(item, { exact: true }).first();
                if (await itemTarget.isVisible()) {
                    await itemTarget.click();
                    await page.waitForTimeout(1000);

                    // User codegen showed changing status to Review
                    const statusDropdown = page.getByRole('combobox').first();
                    if (await statusDropdown.isVisible()) {
                        await statusDropdown.click();
                        // Use Role with exact name to avoid strict mode violation (multiple "Review" paragraphs)
                        await page.getByRole('option', { name: 'Review' }).click();
                        await page.waitForTimeout(1000);
                    }
                }
            }
        }
    }

    // ============================================================
    // 6️⃣ USE CASE & KANBAN (Final Steps)
    // ============================================================
    console.log('📊 Finalizing with Use Case and Kanban...');
    const useCaseBtn = page.getByRole('button', { name: 'Use Case' }).first();
    if (await useCaseBtn.isVisible()) {
        await useCaseBtn.click();
        await page.waitForTimeout(2000);
        // Select status for first item in Use Case
        const statusDropdown = page.getByRole('combobox').first();
        if (await statusDropdown.isVisible()) {
            await statusDropdown.click();
            await page.getByRole('option', { name: 'Review' }).click();
        }
    }

    const kanbanBtn = page.getByRole('button', { name: 'Kanban' });
    if (await kanbanBtn.isVisible()) {
        await kanbanBtn.click();
        await page.waitForTimeout(4000);
        console.log('🏁 Kanban reached. Starting card migration...');

        // 1. Locate the headers
        const todoHeader = page.locator('text=To-Do').first();
        const targetHeader = page.locator('text=To Be Reviewed').first();

        if (await todoHeader.isVisible() && await targetHeader.isVisible()) {
            const targetBox = await targetHeader.boundingBox();

            // 2. Continuous loop to move all cards currently in To-Do
            for (let i = 0; i < 30; i++) { // Up to 30 tasks
                // Re-scan for cards in the To-Do column area
                const todoBox = await todoHeader.boundingBox();
                if (!todoBox || !targetBox) break;

                const cards = page.locator('div, button').filter({ hasText: /\w/ });
                let cardToMove = null;

                const allItems = await cards.all();
                for (const item of allItems) {
                    const box = await item.boundingBox();
                    if (box && box.y > todoBox.y + 20 && box.x >= todoBox.x - 10 && box.x < todoBox.x + todoBox.width + 10) {
                        if (box.height > 40 && box.width > 100) {
                            cardToMove = item;
                            break;
                        }
                    }
                }

                if (cardToMove) {
                    console.log(`   📦 Dragging card ${i + 1} to "To Be Reviewed"...`);
                    const cardBox = await cardToMove.boundingBox();
                    if (cardBox) {
                        await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
                        await page.mouse.down();
                        await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + 200, { steps: 10 });
                        await page.mouse.up();
                        await page.waitForTimeout(1000);
                    }
                } else {
                    console.log('✅ All "To-Do" cards have been moved.');
                    break;
                }
            }
        }
    }

    // ============================================================
    // 7️⃣ VERIFY PROGRESS IN SKILL WALLET
    // ============================================================
    console.log('🏠 Step 7: Final Progress Verification in Skill Wallet');
    await page.getByRole('link', { name: 'Skill Wallet' }).first().click();
    await page.waitForTimeout(5000);

    // Observe percentage
    const progressSection = page.locator('div, section').filter({ hasText: courseName }).last();
    const progressText = await progressSection.innerText().catch(() => "Not found");

    console.log('----------------------------------------------------');
    console.log(`📈 PROJECT COMPLETION DATA for "${courseName}":`);
    console.log(progressText.includes('%') ? progressText.match(/\d+%/g)?.[0] : "Check UI manually for percentage.");
    console.log('----------------------------------------------------');

    console.log('✅ Mission Accomplished!');
});
