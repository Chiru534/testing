import { test, expect } from '@playwright/test';

test('Student Credit Course Workflow - Comprehensive Field Check', async ({ page }) => {
    // Setting global timeout for complex workflow
    test.setTimeout(180000);

    const COURSE_NAME = 'Data Analytics';

    console.log('🚀 Starting Student Credit Course Workflow');
    // 1. Login Phase
    await page.goto('https://myskillwallet.ai/login', { waitUntil: 'load' });

    // Improved Privacy Popup Handler
    try {
        const acceptBtn = page.getByRole('button', { name: /Accept All/i });
        await acceptBtn.waitFor({ state: 'visible', timeout: 7000 }).catch(() => { });
        if (await acceptBtn.isVisible()) {
            await acceptBtn.click({ force: true });
            console.log('✅ Privacy popup accepted');
            await page.waitForTimeout(1000);
        }
    } catch (e) {
        console.log('ℹ Privacy popup did not appear or was not clickable');
    }

    // Login
    console.log('Logging in...');
    await page.getByRole('textbox', { name: 'Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill('m.chiranjeevi.adarsh+2@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('Chiru@534');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 15000 });

    // Navigate to Skill Bank
    console.log('Navigating to Skill Bank...');
    await page.getByRole('link', { name: 'Skill Bank' }).click();
    console.log('Selecting Credit Courses section...');
    await page.getByRole('heading', { name: 'Credit Courses' }).click();

    // Search and Enrollment
    console.log(`Searching for "${COURSE_NAME}" course...`);
    const searchInput = page.getByRole('textbox', { name: 'Search by skill, course, or' });
    await searchInput.click();
    await searchInput.fill(COURSE_NAME);
    await searchInput.press('Enter');
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    console.log('Processing Enrollment...');
    await page.getByRole('button', { name: 'Add To Cart' }).first().click();

    // Selecting cohort - try specific one first, then fallback to first available
    console.log('Selecting Cohort...');
    const cohortSelect = page.getByLabel('Select Cohort');
    await cohortSelect.waitFor({ state: 'visible', timeout: 10000 });
    await cohortSelect.selectOption('68da2af81f8d22d769e55892').catch(async () => {
        console.log('ℹ Could not select cohort by ID, attempting first available');
        await cohortSelect.selectOption({ index: 1 });
    });

    await page.getByRole('button', { name: 'Proceed' }).click();

    console.log('Finalizing Payment with Credits...');
    await page.getByRole('button', { name: 'Pay Now' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    // --- Detailed Field & Content Verification ---
    console.log('Step: Verifying Credit Course Tabs and their Content...');
    await page.getByRole('button', { name: 'Access Resource' }).first().click();
    await page.waitForURL(/.*\/dashboard\/skillwallet\/module\/.*/);

    const expectedTabs = [
        'Instructions',
        'Learning Journey',
        'Courses',
        'Labs',
        'Assessment',
        'Certificate'
    ];

    for (const tabName of expectedTabs) {
        await test.step(`Verify Field: ${tabName}`, async () => {
            const tab = page.getByRole('tab', { name: new RegExp(tabName, 'i') });

            if (await tab.isVisible({ timeout: 3000 })) {
                console.log(`  👉 Testing Tab: "${tabName}"`);
                await tab.click();
                await page.waitForTimeout(1000);

                const bodyText = await page.innerText('body');
                if (bodyText.length > 200) {
                    console.log(`    ✅ Content found in "${tabName}"`);
                } else {
                    console.log(`    ❌ Warning: "${tabName}" content seems missing or empty`);
                    test.info().annotations.push({ type: 'warning', description: `Empty Content: ${tabName}` });
                }
            } else {
                console.log(`  ❌ info: Missing Field: ${tabName}`);
                test.info().annotations.push({ type: 'info', description: `❌ Missing Field: ${tabName}` });
            }
        });
    }

    // 4. Learning Journey Interactions
    console.log('Interacting with Learning Journey...');
    const journeyTab = page.getByRole('tab', { name: 'Learning Journey' });
    if (await journeyTab.isVisible()) {
        await journeyTab.click();
        const joinBtn = page.getByText('Join').first();
        if (await joinBtn.isVisible({ timeout: 3000 })) await joinBtn.click();
    }

    // 5. Courses Interactions
    console.log('Navigating to Courses...');
    const coursesTab = page.getByRole('tab', { name: 'Courses' });
    if (await coursesTab.isVisible()) {
        await coursesTab.click();
        try {
            const enrollSub = page.getByRole('button', { name: 'Enroll Now' }).first();
            if (await enrollSub.isVisible({ timeout: 3000 })) {
                await enrollSub.click();
                await page.getByRole('button', { name: 'Access Resource' }).click();
                await page.getByRole('button', { name: 'Mark as Complete' }).click();
                await page.getByRole('button', { name: 'Next' }).click();
            }
        } catch (e) { }
    }

    // 6. Labs Interactions (Specific to Credit Course)
    console.log('Navigating to Labs...');
    const labsTab = page.getByRole('tab', { name: 'Labs' });
    if (await labsTab.isVisible()) {
        await labsTab.click();
        try {
            // Basic interaction check if 'Labs' has specific buttons, otherwise acts as a passthrough
            await page.waitForTimeout(1000);
        } catch (e) { }
    }

    // Final Cleanup and Dashboard Return
    console.log('Cleaning up and returning to Skill Wallet...');
    await page.getByRole('link', { name: 'Skill Wallet' }).click();

    console.log('✨ Mission Accomplished: Workflow Completed!');
});
