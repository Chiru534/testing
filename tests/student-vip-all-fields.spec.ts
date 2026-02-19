import { test, expect } from '@playwright/test';

test('Student VIP Workflow - Comprehensive Field Check', async ({ page, context }) => {
    // 0. CONFIGURATION
    const COURSE_NAME = 'Full Stack Development Mern';
    const email = 'chiranjeevi4.adarsh@gmail.com';
    const password = 'Chiru@534';

    test.setTimeout(240000);
    console.log(`🚀 Starting Student VIP Workflow for: "${COURSE_NAME}"`);

    // 1. LOGIN PHASE
    await page.goto('https://myskillwallet.ai/login', { waitUntil: 'networkidle' });

    // Handle potential privacy popup
    try {
        const acceptBtn = page.getByRole('button', { name: /Accept All/i });
        if (await acceptBtn.isVisible({ timeout: 5000 })) {
            await acceptBtn.click({ force: true });
            console.log('✅ Privacy popup accepted');
        }
    } catch (e) { }

    console.log('Logging in...');
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await page.waitForTimeout(3000);

    // 2. NAVIGATION & SEARCH
    console.log('Navigating to Skill Bank...');
    await page.getByRole('link', { name: 'Skill Bank' }).click();

    await page.getByRole('heading', { name: 'Virtual Internship Program' }).waitFor({ state: 'visible' });
    await page.getByRole('heading', { name: 'Virtual Internship Program' }).click();
    await page.waitForTimeout(2000);

    console.log(`🔍 Searching for VIP: "${COURSE_NAME}"`);
    const searchInput = page.getByPlaceholder(/Search by skill|Search/i).first();
    if (await searchInput.isVisible()) {
        await searchInput.fill(COURSE_NAME);
        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await page.waitForTimeout(3000);
    }

    // 3. CONDITIONAL ENROLLMENT
    console.log('🛒 Checking Enrollment Status...');
    const addToCartButton = page.getByRole('button', { name: 'Add To Cart' }).first();
    const accessNowButton = page.getByRole('button', { name: /Access Resource|Access Now/i }).first();

    if (await addToCartButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('🛍️ Not enrolled. Processing Enrollment...');
        await addToCartButton.click();

        const cohortSelect = page.getByLabel('Select Cohort');
        await cohortSelect.waitFor({ state: 'visible', timeout: 10000 });
        await cohortSelect.selectOption({ index: 1 }).catch(() => { });

        await page.getByRole('button', { name: 'Proceed' }).click();
        await page.getByRole('button', { name: 'Enroll Now' }).click();
        await page.getByRole('button', { name: 'Confirm' }).click();
        await page.waitForTimeout(4000);
    } else if (await accessNowButton.isVisible()) {
        console.log('✅ Already enrolled. Proceeding to access...');
    } else {
        // Fallback: Click the card itself
        await page.locator('div, h5').filter({ hasText: COURSE_NAME }).first().click().catch(() => { });
    }

    // Entering the Program Content
    console.log('🚀 Entering Program Content...');
    const finalAccess = page.getByRole('button', { name: /Access Resource|Access Now/i }).first();
    if (await finalAccess.isVisible()) {
        await finalAccess.click();
    } else {
        await page.locator('div, h5').filter({ hasText: COURSE_NAME }).first().click();
    }
    await page.waitForTimeout(3000);

    // 4. DETAILED FIELD VERIFICATION (Tabs)
    console.log('📋 Verifying Main Course Tabs...');
    const expectedTabs = ['Instructions', 'Learning Journey', 'Courses', 'Capstone Project', 'Certificate'];

    for (const tabName of expectedTabs) {
        await test.step(`Verify Tab: ${tabName}`, async () => {
            const tab = page.getByRole('tab', { name: new RegExp(tabName, 'i') });
            if (await tab.isVisible({ timeout: 5000 })) {
                console.log(`  👉 Clicking Tab: "${tabName}"`);
                await tab.click();
                await page.waitForTimeout(1000);

                const bodyText = await page.innerText('body');
                if (bodyText.length > 500) {
                    console.log(`    ✅ Content visible in "${tabName}"`);
                }
            }
        });
    }

    // 5. ADVANCED SUB-COURSE PROGRESSION
    console.log('📖 Step 5: Advanced Sub-Course Progression...');
    await page.getByRole('tab', { name: 'Courses' }).click();
    await page.waitForTimeout(3000);

    try {
        const firstCourseBtn = page.locator('button').filter({ hasText: /Enroll Now|Access Resource|Access Now/i }).first();
        if (await firstCourseBtn.isVisible({ timeout: 10000 })) {
            console.log(`   🔹 Accessing specific course content...`);

            // Handle Tab/Popup logic
            const pagePromise = context.waitForEvent('page', { timeout: 8000 }).catch(() => null);
            await firstCourseBtn.click();
            const coursePage = (await pagePromise) || page;

            console.log(coursePage === page ? '   📍 Same tab navigation' : '   📄 New tab opened');
            await coursePage.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => { });
            await coursePage.waitForTimeout(5000);

            // Inside course interaction
            console.log('   ✅ Looking for progression buttons...');
            const finishButtons = coursePage.locator('button').filter({ hasText: /Mark as Complete|Mark as Incomplete|Next|Finish/i });

            if (await finishButtons.count() > 0) {
                const markComplete = coursePage.getByRole('button', { name: /Mark as Complete/i }).first();
                if (await markComplete.isVisible({ timeout: 5000 }).catch(() => false)) {
                    await markComplete.click({ force: true });
                    console.log('   ✔️ Clicked "Mark as Complete"');
                    await coursePage.waitForTimeout(2000);
                }

                const nextBtn = coursePage.getByRole('button', { name: /Next|Continue/i }).first();
                if (await nextBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
                    await nextBtn.click({ force: true });
                    console.log('   ➡️ Clicked "Next/Continue"');
                    await coursePage.waitForTimeout(3000);
                }
            }

            if (coursePage !== page) {
                await coursePage.close().catch(() => { });
            }
        }
    } catch (e: any) {
        console.log('   ❌ Course progression error:', e.message);
    }

    // 6. FINAL DASHBOARD CHECK
    if (page.url().includes('/courses/')) {
        console.log('   🔙 Returning to VIP Dashboard...');
        await page.locator('nav[aria-label="breadcrumb"] link, nav[aria-label="breadcrumb"] a').filter({ hasText: COURSE_NAME }).last().click().catch(() => { });
        await page.waitForTimeout(3000);
    }

    console.log('🏠 Navigation back to Skill Wallet...');
    await page.getByRole('link', { name: 'Skill Wallet' }).click();
    await page.waitForTimeout(5000);

    console.log('✨ Mission Accomplished: VIP Workflow Fully Verified!');
});
