import { test, expect } from '@playwright/test';

test('Course Content Validation - Production Stable Version', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes total timeout

    const courseName = 'Security in the cloud';
    const email = 'm.chiranjeevi.adarsh+2@gmail.com';
    const password = 'Chiru@534';

    // ============================================================
    // 1️⃣ INITIAL SETUP & PRIVACY HANDLING
    // ============================================================
    console.log('🌐 Navigating to Login...');
    await page.goto('https://myskillwallet.ai/login');

    const privacyBuster = async () => {
        const acceptBtn = page.getByRole('button', { name: /Accept All/i });
        try {
            if (await acceptBtn.isVisible({ timeout: 2000 })) {
                await acceptBtn.click({ force: true });
                console.log('✅ Privacy popup dismissed');
                await page.waitForTimeout(1000);
            }
        } catch (e) { }
    };

    await privacyBuster();
    await page.waitForLoadState('domcontentloaded');
    await privacyBuster();

    if (page.url().includes('/dashboard')) {
        console.log('✅ Already logged in, skipping login steps.');
    } else {
        console.log('🔑 Performing login...');
        const emailField = page.getByRole('textbox', { name: 'Email' });
        await privacyBuster();
        await emailField.waitFor({ state: 'visible', timeout: 15000 });
        await emailField.fill(email);
        await page.getByRole('textbox', { name: 'Password' }).fill(password);
        await page.getByRole('button', { name: 'Login', exact: true }).click();
    }

    await page.waitForURL(/.*dashboard.*/i, { timeout: 30000 });
    console.log('✅ Dashboard reached');
    await privacyBuster();

    // ============================================================
    // 2️⃣ SEARCH & ACCESS COURSE
    // ============================================================
    console.log('🔍 Navigating to Skill Bank...');
    await page.getByRole('link', { name: /Skill Bank/i }).first().click();
    await privacyBuster();

    console.log('📂 Opening Courses module...');
    await page.locator('div, p').filter({ hasText: /^Courses$/ }).first().click({ force: true });
    await page.getByPlaceholder(/Search by skill|Search/i).first().fill(courseName);
    await page.getByRole('button', { name: 'Search', exact: true }).first().click({ force: true });

    const courseCard = page.locator('.cursor-pointer, .card-container').filter({ hasText: courseName }).first();
    await courseCard.waitFor({ state: 'visible' });

    console.log('🚀 Accessing course content...');
    const accessNow = page.getByRole('button', { name: 'Access Now' }).first();
    if (await accessNow.isVisible({ timeout: 5000 }).catch(() => false)) {
        await accessNow.click();
    } else {
        await courseCard.click();
    }

    await page.waitForTimeout(3000);
    await privacyBuster();

    // ============================================================
    // 3️⃣ MASTER PROCESSING LOOP (State-Aware & Recursive)
    // ============================================================
    console.log('🚀 Starting Universal Topic Processor...');

    // We use a high-numbered loop instead of while(true) for safety
    const processedThisRun = new Set<string>();

    for (let attempt = 0; attempt < 150; attempt++) {
        // A. RE-EXPAND SIDEBAR (Important: Sidebar collapses after lesson completion)
        const chapterToggles = page.locator('i.fa-chevron-right, .ant-collapse-header');
        const toggleCount = await chapterToggles.count();
        for (let j = 0; j < toggleCount; j++) {
            const toggle = chapterToggles.nth(j);
            // Check if it's actually collapsed (only has the "right" class)
            const classAttr = await toggle.getAttribute('class') || "";
            if (classAttr.includes('right')) {
                await toggle.click({ force: true }).catch(() => { });
            }
        }
        await page.waitForTimeout(800);

        // B. SCAN FOR NEXT INCOMPLETE LESSON
        const items = page.locator('.cursor-pointer, .ant-list-item').all();
        let nextTarget = null;
        let targetTitle = "";

        for (const item of await items) {
            try {
                const text = await item.textContent() || "";
                const title = text.split('\n')[0].trim();

                if (title.length < 3) continue;

                const isChapter = await item.locator('i.fa-chevron-right, i.fa-chevron-down').count() > 0;
                const isDone = await item.locator('img[src*="check"], .text-green-500, i.fa-check-circle, .anticon-check-circle').count() > 0;

                if (!isChapter && !isDone && !processedThisRun.has(title)) {
                    nextTarget = item;
                    targetTitle = title;
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!nextTarget) {
            console.log('🏁 No more incomplete topics found.');
            break;
        }

        // C. INTERACT WITH LESSON
        console.log(`👉 Processing Topic: ${targetTitle}`);
        // RE-LOCATE for stability (prevents "Element not attached to DOM" error)
        const stableTarget = page.locator('.cursor-pointer, .ant-list-item').filter({ hasText: targetTitle }).first();

        try {
            await stableTarget.scrollIntoViewIfNeeded({ timeout: 5000 });
            await stableTarget.click({ force: true });
            await page.waitForTimeout(2500);
        } catch (e) {
            console.log(`   ⚠️ DOM Detached for "${targetTitle}", retrying scan...`);
            continue;
        }

        // D. DETECT ACTION BUTTON (Mark as Read/Complete)
        const actionBtn = page.locator('button').filter({
            hasText: /Mark as Complete|Mark as Read|Complete Lesson/i
        }).first();

        if (await actionBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            const currentText = await actionBtn.innerText();
            if (!currentText.includes('Incomplete')) {
                console.log(`   ✅ Clicking: ${currentText}`);
                await actionBtn.click({ force: true });
                await page.waitForTimeout(2000);
                await page.waitForLoadState('networkidle').catch(() => { });
            }
        }

        // E. QUIZ SOLVER (Enhanced to handle all questions and Retake states)
        const quizStartBtn = page.locator('button').filter({ hasText: /Start Quiz|Retake Quiz/i }).first();
        if (await quizStartBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            console.log('   🎓 Quiz detected, attempting to solve all questions...');
            await quizStartBtn.click({ force: true });
            await page.waitForTimeout(4000);

            if (await quizStartBtn.isVisible()) {
                await quizStartBtn.click({ force: true }).catch(() => { });
                await page.waitForTimeout(2000);
            }

            let qCounter = 0;
            while (qCounter < 50) {
                qCounter++;
                const options = page.locator('[role="radiogroup"] > *, .ant-radio-wrapper, .option-item, label').filter({ hasText: /\w/ });

                if (await options.count() > 0) {
                    const choice = options.first();
                    console.log(`      📝 Answering Question ${qCounter}...`);
                    await choice.scrollIntoViewIfNeeded();
                    await choice.click({ force: true });
                    await page.waitForTimeout(1500);

                    const nextBtn = page.locator('button').filter({ hasText: /^Next$/ }).last();
                    const submitBtn = page.locator('button').filter({ hasText: /Submit|Confirm|Finish|View Results/i }).first();

                    if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
                        await nextBtn.click({ force: true });
                        await page.waitForTimeout(2000);
                    } else if (await submitBtn.isVisible()) {
                        console.log('   🏁 Finalizing quiz...');
                        await submitBtn.click({ force: true });
                        await page.waitForTimeout(3000);
                        break;
                    } else {
                        break;
                    }
                } else {
                    const doneBtn = page.locator('button').filter({ hasText: /Result|Score|Done|Back/i }).first();
                    if (await doneBtn.isVisible()) {
                        await doneBtn.click({ force: true });
                        await page.waitForTimeout(2000);
                    }
                    break;
                }
            }
        }

        processedThisRun.add(targetTitle);
    }

    console.log('🏁 Mission accomplished. All topics checked.');

    // ============================================================
    // 4️⃣ FINAL PROGRESS VERIFICATION (Integrated from something.spec.ts)
    // ============================================================
    console.log('🔄 Verifying final progress on Skill Wallet dashboard...');
    await page.getByRole('link', { name: 'Skill Wallet' }).click();
    await page.waitForTimeout(5000);

    const bodyText = await page.innerText('body');
    const progressMatch = bodyText.match(/Security in the cloud[\s\S]{1,150}?(\d+)%/i);

    if (progressMatch) {
        const percent = parseInt(progressMatch[1]);
        console.log(`📊 FINAL STATUS: Course "Security in the cloud" is at ${percent}% completion.`);
        if (percent > 0) {
            console.log('✅ Progress confirmed!');
        } else {
            console.log('❌ Progress still shows 0%. Verification failed.');
        }
    } else {
        console.log('⚠️ Could not find a percentage indicator for this course on the dashboard.');
    }

    console.log('🏁 Test completed.');
});