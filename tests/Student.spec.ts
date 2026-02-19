import { test, expect } from '@playwright/test';

test('Student Enrollment and Course Interaction Flow', async ({ page, context }) => {
    // 0. CONFIGURATION
    const courseName = 'Full Stack Development Mern';
    const email = 'chiranjeevi4.adarsh@gmail.com';
    const password = 'Chiru@534';

    test.setTimeout(180000);
    console.log(`🚀 Starting Student Enrollment Flow for: "${courseName}"`);

    // 1. Login Phase
    await page.goto('https://myskillwallet.ai/login', { waitUntil: 'networkidle' });

    // Handle potential privacy popup
    try {
        const acceptBtn = page.getByRole('button', { name: 'Accept All' });
        if (await acceptBtn.isVisible({ timeout: 5000 })) {
            await acceptBtn.click();
            console.log('✅ Privacy popup accepted');
        }
    } catch (e) { }

    console.log('Logging in...');
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // 2. Navigation Phase
    console.log('Navigating to Skill Bank...');
    await page.waitForTimeout(2000); // Small buffer for login redirect
    await page.getByRole('link', { name: 'Skill Bank' }).click();

    await page.getByRole('heading', { name: 'Virtual Internship Program' }).waitFor({ state: 'visible' });
    await page.getByRole('heading', { name: 'Virtual Internship Program' }).click();
    await page.waitForTimeout(2000);

    // 3. SEARCH & CONDITIONAL ENROLLMENT
    console.log(`🔍 Searching for VIP: "${courseName}"`);
    const searchInput = page.getByPlaceholder(/Search by skill|Search/i).first();
    if (await searchInput.isVisible()) {
        await searchInput.fill(courseName);
        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await page.waitForTimeout(3000);
    }

    console.log('🛒 Checking Enrollment Status...');
    const addToCartButton = page.getByRole('button', { name: 'Add To Cart' }).first();
    const accessNowButton = page.getByRole('button', { name: 'Access Resource' }).or(page.getByRole('button', { name: 'Access Now' })).first();

    if (await addToCartButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('🛍️ Not enrolled. Processing Enrollment...');
        await addToCartButton.click();

        await page.getByLabel('Select Cohort').waitFor({ state: 'visible' });
        await page.getByLabel('Select Cohort').selectOption({ index: 1 }).catch(() => { });

        await page.getByRole('button', { name: 'Proceed' }).click();
        await page.getByRole('button', { name: 'Enroll Now' }).click();
        await page.getByRole('button', { name: 'Confirm' }).click();
        await page.waitForTimeout(3000);
    } else if (await accessNowButton.isVisible()) {
        console.log('✅ Already enrolled. Skipping to access...');
    } else {
        // Fallback: Click the card itself
        await page.locator('div, h5').filter({ hasText: courseName }).first().click().catch(() => { });
    }

    // 4. Course Interaction Phase
    console.log('🚀 Entering Program Content...');
    if (await accessNowButton.isVisible()) {
        await accessNowButton.click();
    }

    // Tab interactions
    await page.getByRole('tab', { name: 'Learning Journey' }).click();
    await page.getByRole('tab', { name: 'Courses' }).click();
    await page.getByRole('tab', { name: 'Certificate' }).click();
    await page.getByRole('tab', { name: 'Instructions' }).click();
    await page.getByRole('tab', { name: 'Learning Journey' }).click();

    // Interaction with Journey items
    console.log('Interacting with Journey items...');
    const joinButtons = page.getByText('Join');
    const viewButtons = page.getByText('View');

    if (await joinButtons.first().isVisible()) await joinButtons.first().click();
    if (await viewButtons.first().isVisible()) await viewButtons.first().click();

    // 5. Completion Phase
    console.log('📖 Step 5: Sub-Course Progression...');
    await page.getByRole('tab', { name: 'Courses' }).click();
    await page.waitForTimeout(3000); // Allow list to load

    try {
        const firstCourseBtn = page.locator('button').filter({ hasText: /Enroll Now|Access Resource|Access Now/i }).first();

        if (await firstCourseBtn.isVisible({ timeout: 10000 })) {
            console.log(`   🔹 Accessing course content...`);

            // Handle potential new tab/popup (Race with a short timeout to handle same-tab navigation)
            const pagePromise = context.waitForEvent('page', { timeout: 8000 }).catch(() => null);
            await firstCourseBtn.click();
            const coursePage = (await pagePromise) || page;

            console.log(coursePage === page ? '   📍 Same tab navigation' : '   📄 New tab opened');
            await coursePage.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => { });
            await coursePage.waitForTimeout(5000);

            // Inside the Course Content
            console.log('   ✅ Looking for completion/next buttons...');

            // Try to find ANY button that indicates completion or progression
            const finishButtons = coursePage.locator('button').filter({ hasText: /Mark as Complete|Mark as Incomplete|Next|Finish/i });
            const count = await finishButtons.count();

            if (count > 0) {
                // 1. Handle "Mark as Complete" if available
                const markComplete = coursePage.getByRole('button', { name: /Mark as Complete/i, exact: false }).first();
                if (await markComplete.isVisible({ timeout: 5000 }).catch(() => false)) {
                    await markComplete.click({ force: true });
                    console.log('   ✔️ Clicked "Mark as Complete"');
                    await coursePage.waitForTimeout(2000);
                } else {
                    const alreadyDone = coursePage.getByText(/Mark as Incomplete/i).first();
                    if (await alreadyDone.isVisible().catch(() => false)) {
                        console.log('   ℹ️ Course already marked as complete.');
                    }
                }

                // 2. Click "Next" to progress
                const nextBtn = coursePage.getByRole('button', { name: /Next|Continue/i, exact: false }).first();
                if (await nextBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
                    await nextBtn.click({ force: true });
                    console.log('   ➡️ Clicked "Next/Continue"');
                    await coursePage.waitForTimeout(3000);
                }
            } else {
                console.log('   ⚠️ No progression buttons (Mark Complete/Next) found in the player.');
            }

            // Close the course tab only if it was a popup
            if (coursePage !== page) {
                console.log('   🔒 Closing course tab...');
                await coursePage.close().catch(() => { });
            }
        } else {
            console.log('   ⚠️ No course buttons (Enroll/Access) found in the list.');
        }
    } catch (e: any) {
        console.log('   ❌ Error during course progression:', e.message);
    }

    // If it was same-tab navigation, we might need to go back to the VIP dashboard
    if (page.url().includes('/courses/')) {
        console.log('   🔙 Returning to VIP Dashboard via breadcrumb...');
        await page.locator('nav[aria-label="breadcrumb"] link, nav[aria-label="breadcrumb"] a').filter({ hasText: courseName }).last().click().catch(() => { });
        await page.waitForTimeout(3000);
    }

    // Return to original tab state if needed
    console.log('Finalizing status check...');
    await page.getByRole('tab', { name: 'Courses' }).click().catch(() => { });
    await page.getByRole('tab', { name: 'Certificate' }).click().catch(() => { });

    console.log('Navigation back to Skill Wallet...');
    await page.getByRole('link', { name: 'Skill Wallet' }).click();

    console.log('✨ Workflow Completed');
});
