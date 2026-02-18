import { test, expect } from '@playwright/test';

test('Student Enrollment and Course Interaction Flow', async ({ page }) => {
    // Setting a longer timeout for the entire test as it has many steps
    test.setTimeout(120000);

    console.log('🚀 Starting Student Enrollment Flow');

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
    await page.getByRole('textbox', { name: 'Email' }).fill('chiranjeevi4.adarsh@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('Chiru@534');
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // 2. Navigation Phase
    console.log('Navigating to Skill Bank...');
    await page.waitForTimeout(2000); // Small buffer for login redirect
    await page.getByRole('link', { name: 'Skill Bank' }).click();

    await page.getByRole('heading', { name: 'Virtual Internship Program' }).waitFor({ state: 'visible' });
    await page.getByRole('heading', { name: 'Virtual Internship Program' }).click();

    // 3. Enrollment Phase
    console.log('Processing Enrollment...');
    const addToCartButton = page.getByRole('button', { name: 'Add To Cart' }).first();
    await addToCartButton.waitFor({ state: 'visible', timeout: 15000 });
    await addToCartButton.click();

    await page.getByLabel('Select Cohort').waitFor({ state: 'visible' });
    // Using selectOption with index or label to be more robust
    await page.getByLabel('Select Cohort').selectOption('697b0028f4864a9337313dc2').catch(async () => {
        await page.getByLabel('Select Cohort').selectOption({ index: 1 });
    });

    await page.getByRole('button', { name: 'Proceed' }).click();
    await page.getByRole('button', { name: 'Enroll Now' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    // 4. Course Interaction Phase
    console.log('Accessing Resources...');
    await page.getByRole('button', { name: 'Access Resource' }).first().waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Access Resource' }).first().click();

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
    console.log('Checking Course Completion...');
    await page.getByRole('tab', { name: 'Courses' }).click();
    try {
        const enrollBtn = page.getByRole('button', { name: 'Enroll Now' }).first();
        if (await enrollBtn.isVisible({ timeout: 5000 })) {
            await enrollBtn.click();
            await page.getByRole('button', { name: 'Access Resource' }).click();
            await page.getByRole('button', { name: 'Mark as Complete' }).click();
            await page.getByRole('button', { name: 'Next' }).click();
        }
    } catch (e) {
        console.log('Already enrolled or completion step skipped');
    }

    await page.getByRole('link', { name: 'Courses' }).click();
    await page.getByRole('tab', { name: 'Certificate' }).click();

    console.log('Navigation back to dashboard...');
    await page.getByRole('link', { name: 'Skill Wallet' }).click();

    console.log('✨ Workflow Completed');
});
