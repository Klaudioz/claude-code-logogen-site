import { chromium } from 'playwright';

async function testVideoGeneration() {
  console.log('Starting Playwright test for video generation...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen for console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log('Console Error:', msg.text());
    }
  });

  // Listen for network errors
  const networkErrors = [];
  page.on('response', response => {
    if (!response.ok()) {
      networkErrors.push(`${response.status()} ${response.url()}`);
      console.log('Network Error:', response.status(), response.url());
    }
  });

  try {
    console.log('1. Navigating to http://localhost:5175/');
    await page.goto('http://localhost:5175/');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: 'initial-page.png' });
    console.log('Initial screenshot saved as initial-page.png');

    console.log('2. Generating ASCII art first...');
    // First, click "Generate Claude Code logo" button to generate ASCII art
    const generateLogoButton = await page.locator('text=Generate Claude Code logo').first();
    const logoButtonVisible = await generateLogoButton.isVisible();
    console.log('Generate Claude Code logo button visible:', logoButtonVisible);
    
    if (logoButtonVisible) {
      await generateLogoButton.click();
      await page.waitForTimeout(1000); // Wait for ASCII generation
      console.log('ASCII art generated');
      
      // Take screenshot after generating ASCII
      await page.screenshot({ path: 'after-ascii-generation.png' });
      console.log('Screenshot after ASCII generation saved');
    }

    // Check if Generate Video button exists
    console.log('3. Looking for Generate Video button...');
    const generateVideoButton = await page.locator('text=Generate Video').first();
    const isVisible = await generateVideoButton.isVisible();
    console.log('Generate Video button visible:', isVisible);
    
    if (isVisible) {
      console.log('4. Clicking Generate Video button...');
      await generateVideoButton.click();
      
      // Wait a moment for the video interface to appear
      await page.waitForTimeout(2000);
      
      // Take screenshot after clicking Generate Video
      await page.screenshot({ path: 'after-generate-video-click.png' });
      console.log('Screenshot after Generate Video click saved as after-generate-video-click.png');
      
      // Check for "Video Animation Preview" text
      const videoPreviewText = await page.locator('text=Video Animation Preview').first();
      const previewTextVisible = await videoPreviewText.isVisible();
      console.log('Video Animation Preview text visible:', previewTextVisible);
      
      // Check for canvas or video element
      const canvas = await page.locator('canvas').first();
      const canvasVisible = await canvas.isVisible();
      console.log('Canvas element visible:', canvasVisible);
      
      if (canvasVisible) {
        const canvasSize = await canvas.boundingBox();
        console.log('Canvas size:', canvasSize);
        
        // Check if canvas is showing content
        const canvasData = await page.evaluate(() => {
          const canvas = document.querySelector('canvas');
          if (!canvas) return null;
          const ctx = canvas.getContext('2d');
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;
          
          // Check if canvas has any non-black pixels
          let hasContent = false;
          for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i] > 0 || pixels[i + 1] > 0 || pixels[i + 2] > 0) {
              hasContent = true;
              break;
            }
          }
          
          return {
            width: canvas.width,
            height: canvas.height,
            hasContent,
            totalPixels: pixels.length / 4
          };
        });
        
        console.log('Canvas content analysis:', canvasData);
      }
      
      // Check for Download PNG button
      console.log('5. Looking for Download PNG button...');
      const downloadPngButton = await page.locator('text=Download PNG').first();
      const downloadPngVisible = await downloadPngButton.isVisible();
      console.log('Download PNG button visible:', downloadPngVisible);
      
      if (downloadPngVisible) {
        console.log('6. Testing Download PNG button...');
        const downloadPngPromise = page.waitForEvent('download');
        await downloadPngButton.click();
        
        try {
          const download = await Promise.race([
            downloadPngPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Download timeout')), 5000))
          ]);
          console.log('PNG Download started:', download.suggestedFilename());
        } catch (error) {
          console.log('PNG Download failed or timed out:', error.message);
        }
      }
      
      // Check for Download Animation button
      console.log('7. Looking for Download Animation button...');
      const downloadButton = await page.locator('text=Download Animation').first();
      const downloadButtonVisible = await downloadButton.isVisible();
      console.log('Download Animation button visible:', downloadButtonVisible);
      
      if (downloadButtonVisible) {
        console.log('8. Clicking Download Animation button...');
        
        // Set up download handler
        const downloadPromise = page.waitForEvent('download');
        await downloadButton.click();
        
        try {
          const download = await Promise.race([
            downloadPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Download timeout')), 5000))
          ]);
          console.log('Download started:', download.suggestedFilename());
        } catch (error) {
          console.log('Download failed or timed out:', error.message);
        }
      }
      
      // Take final screenshot
      await page.screenshot({ path: 'final-state.png' });
      console.log('Final screenshot saved as final-state.png');
      
    } else {
      console.log('Generate Video button not found');
    }
    
    // Report console errors
    if (consoleErrors.length > 0) {
      console.log('\nConsole Errors Found:');
      consoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('\nNo console errors detected');
    }
    
    // Report network errors
    if (networkErrors.length > 0) {
      console.log('\nNetwork Errors Found:');
      networkErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('\nNo network errors detected');
    }

  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
  }

  await browser.close();
  console.log('Test completed');
}

testVideoGeneration();