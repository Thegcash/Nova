import { test, expect } from '@playwright/test';

test.describe('Nova Fleet Command Center - Smoke Tests', () => {
  test('homepage loads and shows dashboard', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Nova/);
    
    // Check for key UI elements
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('text=Fleet overview and key metrics')).toBeVisible();
  });

  test('fleet overview page loads', async ({ page }) => {
    await page.goto('/fleet-overview');
    
    // Check for fleet overview content
    await expect(page.locator('h1')).toContainText('Fleet Overview');
    await expect(page.locator('text=Monitor your autonomous vehicle fleet')).toBeVisible();
  });

  test('live ops page loads', async ({ page }) => {
    await page.goto('/map-live-ops');
    
    // Check for live ops content
    await expect(page.locator('h1')).toContainText('Map & Live Operations');
    await expect(page.locator('text=Real-time vehicle tracking')).toBeVisible();
  });

  test('playback page loads', async ({ page }) => {
    await page.goto('/playback');
    
    // Check for playback content
    await expect(page.locator('h1')).toContainText('Playback');
    await expect(page.locator('text=Review historical vehicle data')).toBeVisible();
  });

  test('ingestion page loads', async ({ page }) => {
    await page.goto('/ingestion');
    
    // Check for ingestion content
    await expect(page.locator('h1')).toContainText('Data Ingestion');
    await expect(page.locator('text=Monitor data pipelines')).toBeVisible();
  });

  test('reduce cost page loads', async ({ page }) => {
    await page.goto('/reduce-cost');
    
    // Check for reduce cost content
    await expect(page.locator('h1')).toContainText('Reduce Cost');
    await expect(page.locator('text=Optimize operations')).toBeVisible();
  });

  test('roi page loads', async ({ page }) => {
    await page.goto('/roi');
    
    // Check for ROI content
    await expect(page.locator('h1')).toContainText('ROI Dashboard');
  });

  test('exports page loads', async ({ page }) => {
    await page.goto('/exports');
    
    // Check for exports content
    await expect(page.locator('h1')).toContainText('Data Exports');
    await expect(page.locator('text=Generate carrier data exports')).toBeVisible();
  });
});
