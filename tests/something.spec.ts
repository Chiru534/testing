import { test, expect } from '@playwright/test';

test('Course Content Validation - Direct Access', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes

    // 1. Login
    await page.goto('https://myskillwallet.ai/login');
    try {
        await page.getByRole('button', { name: 'Accept All' }).click({ timeout: 5000 });
    } catch (e) { }

    await page.getByRole('textbox', { name: 'Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill('chiranjeevi4.adarsh@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('Chiru@534');
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // 2. Navigate and Search
    await page.getByRole('link', { name: 'Skill Bank' }).click();
    try { await page.locator('.absolute.inset-0.opacity-10').first().click({ timeout: 2000 }); } catch (e) { }

    const courseName = 'AWS Well-Architected Solutions';
    await page.getByRole('textbox', { name: 'Search by skill, course, or' }).fill(courseName);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.waitForTimeout(2000);

    // 3. Access Course
    console.log('🚀 directly accessing resource...');
    const accessBtn = page.getByRole('button', { name: 'Access Now' }).first();
    if (await accessBtn.isVisible()) {
        await accessBtn.click();
    } else {
        await page.getByRole('button', { name: 'Access Resource' }).first().click();
    }

    // 4. Wait for Player
    console.log('🔄 Waiting for Course Player to load...');
    await page.getByRole('heading', { name: 'Course Content' }).first().waitFor();
    await page.waitForTimeout(3000);

    // 5. Robust Lesson Iteration (Using Subagent Findings)
    console.log('🔍 Scanning for lesson items using robust selector...');
    // Selector found by subagent: div.cursor-pointer.transition-all.duration-200
    // We filter to ensure we aren't clicking hidden items or chapters
    const lessons = page.locator('div.cursor-pointer.transition-all.duration-200');
    const count = await lessons.count();
    console.log(`📋 Found ${count} potential lessons.`);

    for (let i = 0; i < count; i++) {
        // Re-locate elements in every iteration to avoid stale element errors
        const lesson = lessons.nth(i);

        // Get title for logging (safely)
        const lessonTitle = await lesson.innerText().catch(() => `Lesson ${i + 1}`);

        await test.step(`Verify Lesson ${i + 1}: ${lessonTitle}`, async () => {
            console.log(`  👉 Clicking Lesson: "${lessonTitle.split('\n')[0]}"`);

            // Scroll into view & Click
            await lesson.scrollIntoViewIfNeeded();
            await lesson.click({ force: true });
            await page.waitForTimeout(2000); // Allow content load

            // --- Validation Logic ---
            const contentText = await page.innerText('body');
            const paragraphs = await page.locator('p, article, .content-body').allInnerTexts();
            const totalParagraphWords = paragraphs.join(' ').split(/\s+/).length;

            // Check for Quiz
            const startQuizBtn = page.getByRole('button', { name: 'Start Quiz' }).first();

            if (await startQuizBtn.isVisible()) {
                console.log(`    🎓 Quiz Detected! Starting quiz...`);
                // User's manual code suggests clicking twice might be necessary
                await startQuizBtn.click({ force: true });
                await page.waitForTimeout(1000);
                if (await startQuizBtn.isVisible()) {
                    await startQuizBtn.click({ force: true });
                }

                // Wait for the question text to appear (heuristic)
                await page.waitForTimeout(2000);

                let quizActive = true;
                let questionCount = 0;
                while (quizActive && questionCount < 50) {
                    questionCount++;
                    console.log(`      ❓ Answering Question ${questionCount}...`);

                    const firstOption = page.locator('label, .option-item, input[type="radio"]').first();
                    if (await firstOption.isVisible()) {
                        await firstOption.click({ force: true });
                    } else {
                        await page.locator('.quiz-option, .answer-choice').first().click().catch(() => { });
                    }
                    await page.waitForTimeout(500);

                    const nextBtn = page.getByRole('button', { name: 'Next' }).nth(1);
                    const finishBtn = page.getByRole('button', { name: 'Finish' });

                    if (await finishBtn.isVisible()) {
                        await finishBtn.click();
                        await page.waitForTimeout(1000);
                        if (await finishBtn.isVisible()) await finishBtn.click();
                        quizActive = false;
                    } else if (await nextBtn.isVisible()) {
                        await nextBtn.click();
                        await page.waitForTimeout(1000);
                    } else {
                        const stdNext = page.getByRole('button', { name: 'Next' }).first();
                        if (await stdNext.isVisible()) {
                            await stdNext.click();
                            await page.waitForTimeout(1000);
                        } else {
                            console.log('      ⚠️ No navigation button found, assuming quiz end.');
                            quizActive = false;
                        }
                    }
                }
                console.log(`    ✅ Quiz Completed.`);
            } else if (totalParagraphWords >= 30) {
                console.log(`    ✅ Content Verified (${totalParagraphWords} words).`);
            } else {
                console.log(`    ⚠️ Low content and no quiz found.`);
            }

            // --- Mark as Complete ---
            // Subagent confirmed 'Mark as Complete' is available
            const markComplete = page.getByRole('button', { name: 'Mark as Complete' }).first();
            if (await markComplete.isVisible()) {
                console.log('    ✅ Marking as Complete...');
                await markComplete.click();
                await page.waitForTimeout(1000);
            }
        });
    }

    console.log('✨ All lessons processed. Checking for course completion...');

    // 7. Click Next to trigger completion popup
    const finalNextBtn = page.getByRole('button', { name: 'Next' }).first();
    if (await finalNextBtn.isVisible()) {
        console.log('👉 Clicking final Next button...');
        await finalNextBtn.click();
        await page.waitForTimeout(2000);
    }

    // Check for "completed the course" popup/toast
    const completionToast = page.getByText("You've completed the course!");
    if (await completionToast.isVisible()) {
        console.log("✅ Completion popup detected!");
    }

    // 8. Go back to Skill Wallet and verify progress
    console.log('🔄 Returning to Skill Wallet to verify progress...');
    await page.getByRole('link', { name: 'Skill Wallet' }).click();
    await page.waitForTimeout(4000); // Wait for dashboard cards to stabilize

    // Flexible search for the course card (titles are often truncated in the UI)
    const card = page.locator('div').filter({ hasText: /AWS Well-Architected/i }).locator('xpath=ancestor::div[contains(@class, "card") or contains(@class, "border")][1]').first();

    if (await card.isVisible()) {
        const fullCardText = await card.innerText();
        console.log(`📊 Card Content found: ${fullCardText.replace(/\n/g, ' ')}`);

        // Find any percentage matching XX%
        const percentMatch = fullCardText.match(/(\d+)%/);
        const percent = percentMatch ? parseInt(percentMatch[1]) : 0;

        if (percent > 0) {
            console.log(`✅ Success: Course progress is ${percent}% (not 0).`);
        } else {
            console.log(`❌ Error: Course progress shows 0% or couldn't be parsed. Text found: "${fullCardText}"`);
        }
    } else {
        // Fallback: Check all text on page for any percentage next to course keywords
        const bodyText = await page.innerText('body');
        const fallbackMatch = bodyText.match(/AWS Well-Architected[\s\S]{1,100}?(\d+)%/i);
        if (fallbackMatch) {
            console.log(`✅ Success (Fallback): Found progress via page scan: ${fallbackMatch[1]}%`);
        } else {
            console.log('⚠️ Could not find progress indicator for the course on the Skill Wallet dashboard.');
        }
    }

    console.log('🏁 Test completed.');
});
