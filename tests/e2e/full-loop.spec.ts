import { test, expect } from '@playwright/test';

const patientUrl = process.env.PATIENT_APP_URL ?? 'http://localhost:5185';
const doctorUrl = process.env.DOCTOR_APP_URL ?? 'http://localhost:5174';

const text = {
  provincePrompt: '\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e08\u0e31\u0e07\u0e2b\u0e27\u0e31\u0e14\u0e17\u0e35\u0e48\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e23\u0e31\u0e1a\u0e1a\u0e23\u0e34\u0e01\u0e32\u0e23',
  bangkok: '\u0e01\u0e23\u0e38\u0e07\u0e40\u0e17\u0e1e\u0e21\u0e2b\u0e32\u0e19\u0e04\u0e23',
  next: '\u0e16\u0e31\u0e14\u0e44\u0e1b',
  chiefComplaint: '\u0e2d\u0e32\u0e01\u0e32\u0e23\u0e2b\u0e25\u0e31\u0e01',
  photoHeading: '\u0e16\u0e48\u0e32\u0e22\u0e23\u0e39\u0e1b\u0e1c\u0e34\u0e27\u0e2b\u0e19\u0e31\u0e07',
  redFlags: '\u0e2d\u0e32\u0e01\u0e32\u0e23\u0e17\u0e35\u0e48\u0e15\u0e49\u0e2d\u0e07\u0e23\u0e30\u0e27\u0e31\u0e07',
  spreadingFast: '\u0e01\u0e23\u0e30\u0e08\u0e32\u0e22\u0e40\u0e23\u0e47\u0e27',
  facialSwelling: '\u0e1a\u0e27\u0e21\u0e2b\u0e19\u0e49\u0e32',
  submitRequest: '\u0e2a\u0e48\u0e07\u0e04\u0e33\u0e02\u0e2d\u0e1b\u0e23\u0e36\u0e01\u0e29\u0e32',
  submitSuccess: '\u0e2a\u0e48\u0e07\u0e04\u0e33\u0e02\u0e2d\u0e1b\u0e23\u0e36\u0e01\u0e29\u0e32\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08!',
  viewStatus: '\ud83d\udcca \u0e14\u0e39\u0e2a\u0e16\u0e32\u0e19\u0e30\u0e04\u0e33\u0e02\u0e2d',
  statusTitle: '\u0e2a\u0e16\u0e32\u0e19\u0e30\u0e04\u0e33\u0e02\u0e2d',
  refreshStatus: '\u0e23\u0e35\u0e40\u0e1f\u0e23\u0e0a\u0e2a\u0e16\u0e32\u0e19\u0e30',
  completed: '\u0e40\u0e2a\u0e23\u0e47\u0e08\u0e2a\u0e34\u0e49\u0e19',
  escalated: '\u0e2a\u0e48\u0e07\u0e15\u0e48\u0e2d\u0e41\u0e25\u0e49\u0e27',
  diagnosisLabel: '\u0e04\u0e33\u0e27\u0e34\u0e19\u0e34\u0e08\u0e09\u0e31\u0e22',
  imagesLabel: '\u0e23\u0e39\u0e1b\u0e20\u0e32\u0e1e',
  zeroImages: '0 \u0e23\u0e39\u0e1b',
  usernameLabel: 'Username',
  loginButton: '\u0e40\u0e02\u0e49\u0e32\u0e17\u0e33\u0e07\u0e32\u0e19',
  claimCase: '\u0e23\u0e31\u0e1a\u0e04\u0e19\u0e44\u0e02\u0e49\u0e19\u0e35\u0e49',
  inReview: '\u0e01\u0e33\u0e25\u0e31\u0e07\u0e15\u0e23\u0e27\u0e08',
  sendResult: '\u0e2a\u0e48\u0e07\u0e1c\u0e25\u0e43\u0e2b\u0e49\u0e04\u0e19\u0e44\u0e02\u0e49',
  escalateCase: '\u0e2a\u0e48\u0e07\u0e15\u0e48\u0e2d\u0e40\u0e04\u0e2a\u0e19\u0e35\u0e49',
  responseSaved: '\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e1c\u0e25\u0e15\u0e2d\u0e1a\u0e01\u0e25\u0e31\u0e1a\u0e41\u0e25\u0e49\u0e27',
  escalatedSaved: '\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e01\u0e32\u0e23\u0e2a\u0e48\u0e07\u0e15\u0e48\u0e2d\u0e41\u0e25\u0e49\u0e27'
};

function uniqueComplaint(prefix: string) {
  return `${prefix} ${Date.now()} \u0e1a\u0e23\u0e34\u0e40\u0e27\u0e13\u0e41\u0e02\u0e19\u0e41\u0e25\u0e30\u0e25\u0e33\u0e04\u0e2d`;
}

async function submitPatientConsultation(page: import('@playwright/test').Page, complaint: string) {
  await page.goto(patientUrl, { waitUntil: 'networkidle' });
  await expect(page.getByText(text.provincePrompt)).toBeVisible();
  await page.getByRole('button', { name: text.bangkok }).click();
  await page.getByRole('button', { name: text.next }).click();

  await expect(page.getByText(text.chiefComplaint)).toBeVisible();
  await page.locator('textarea').fill(complaint);
  await page.locator('input[type="number"]').fill('3');
  await page.getByRole('button', { name: text.next }).click();

  await expect(page.getByText(text.photoHeading)).toBeVisible();
  await page.getByRole('button', { name: text.next }).click();

  await expect(page.getByText(text.redFlags)).toBeVisible();
  await page.getByRole('button', { name: new RegExp(text.spreadingFast) }).click();
  await page.getByRole('button', { name: new RegExp(text.facialSwelling) }).click();
  await page.getByRole('button', { name: text.submitRequest }).click();
  await expect(page.getByText(text.submitSuccess)).toBeVisible();
}

async function loginAsDoctor(page: import('@playwright/test').Page, username = 'dr.narin', password = 'doctor123') {
  await page.goto(doctorUrl, { waitUntil: 'networkidle' });
  await expect(page.getByText(text.usernameLabel, { exact: true })).toBeVisible();
  await page.locator('input[autocomplete="username"]').fill(username);
  await page.locator('input[autocomplete="current-password"]').fill(password);
  await page.getByRole('button', { name: text.loginButton }).click();
}

async function respondAsDoctor(page: import('@playwright/test').Page, complaint: string, diagnosis: string, advice: string, escalated = false) {
  await loginAsDoctor(page);

  const queueCard = page.locator('button').filter({ hasText: complaint }).first();
  await expect(queueCard).toBeVisible();
  await queueCard.click();
  await page.getByRole('button', { name: text.claimCase }).click();
  await expect(page.getByText(text.inReview).first()).toBeVisible();

  const textareas = page.locator('textarea');
  await textareas.nth(0).fill(diagnosis);
  await textareas.nth(1).fill(advice);

  await page.getByRole('button', { name: escalated ? text.escalateCase : text.sendResult }).click();
  await expect(page.getByText(escalated ? text.escalatedSaved : text.responseSaved)).toBeVisible();
}

test('patient to doctor to patient full loop', async ({ browser }) => {
  const complaint = uniqueComplaint('\u0e1c\u0e37\u0e48\u0e19\u0e41\u0e14\u0e07\u0e04\u0e31\u0e19\u0e17\u0e14\u0e2a\u0e2d\u0e1a\u0e2d\u0e31\u0e15\u0e42\u0e19\u0e21\u0e31\u0e15\u0e34');
  const diagnosis = '\u0e1c\u0e37\u0e48\u0e19\u0e41\u0e1e\u0e49\u0e2a\u0e31\u0e21\u0e1c\u0e31\u0e2a\u0e2b\u0e23\u0e37\u0e2d\u0e1c\u0e37\u0e48\u0e19\u0e23\u0e30\u0e04\u0e32\u0e22\u0e40\u0e04\u0e37\u0e2d\u0e07\u0e08\u0e32\u0e01\u0e2a\u0e32\u0e23\u0e01\u0e23\u0e30\u0e15\u0e38\u0e49\u0e19';
  const advice = '\u0e2b\u0e22\u0e38\u0e14\u0e43\u0e0a\u0e49\u0e1c\u0e25\u0e34\u0e15\u0e20\u0e31\u0e13\u0e11\u0e4c\u0e40\u0e14\u0e34\u0e21 \u0e17\u0e32\u0e22\u0e32\u0e15\u0e32\u0e21\u0e2a\u0e31\u0e48\u0e07 \u0e41\u0e25\u0e30\u0e01\u0e25\u0e31\u0e1a\u0e21\u0e32\u0e1e\u0e1a\u0e41\u0e1e\u0e17\u0e22\u0e4c\u0e2b\u0e32\u0e01\u0e2d\u0e32\u0e01\u0e32\u0e23\u0e25\u0e32\u0e21\u0e2b\u0e23\u0e37\u0e2d\u0e1a\u0e27\u0e21\u0e21\u0e32\u0e01\u0e02\u0e36\u0e49\u0e19';

  const patientContext = await browser.newContext();
  const patientPage = await patientContext.newPage();
  await submitPatientConsultation(patientPage, complaint);

  const doctorContext = await browser.newContext();
  const doctorPage = await doctorContext.newPage();
  await respondAsDoctor(doctorPage, complaint, diagnosis, advice);

  await patientPage.getByRole('button', { name: text.viewStatus }).click();
  await expect(patientPage.getByText(text.statusTitle)).toBeVisible();
  await patientPage.getByRole('button', { name: text.refreshStatus }).click();

  await expect(patientPage.getByRole('heading', { name: text.completed })).toBeVisible();
  await expect(patientPage.getByText(text.diagnosisLabel).first()).toBeVisible();
  await expect(patientPage.getByText(diagnosis)).toBeVisible();
  await expect(patientPage.getByText(advice)).toBeVisible();
  await expect(patientPage.getByText('Hydrocortisone 1% cream')).toBeVisible();

  await doctorContext.close();
  await patientContext.close();
});

test('full loop works without uploaded images', async ({ browser }) => {
  const complaint = uniqueComplaint('\u0e1c\u0e37\u0e48\u0e19\u0e44\u0e21\u0e48\u0e21\u0e35\u0e23\u0e39\u0e1b\u0e17\u0e14\u0e2a\u0e2d\u0e1a\u0e2d\u0e31\u0e15\u0e42\u0e19\u0e21\u0e31\u0e15\u0e34');
  const diagnosis = '\u0e1c\u0e37\u0e48\u0e19\u0e1c\u0e34\u0e27\u0e2b\u0e19\u0e31\u0e07\u0e2d\u0e31\u0e01\u0e40\u0e2a\u0e1a\u0e17\u0e35\u0e48\u0e1b\u0e23\u0e30\u0e40\u0e21\u0e34\u0e19\u0e44\u0e14\u0e49\u0e08\u0e32\u0e01\u0e2d\u0e32\u0e01\u0e32\u0e23\u0e41\u0e21\u0e49\u0e44\u0e21\u0e48\u0e21\u0e35\u0e23\u0e39\u0e1b\u0e41\u0e19\u0e1a';
  const advice = '\u0e40\u0e23\u0e34\u0e48\u0e21\u0e22\u0e32\u0e17\u0e32\u0e15\u0e32\u0e21\u0e2d\u0e32\u0e01\u0e32\u0e23\u0e41\u0e25\u0e30\u0e15\u0e34\u0e14\u0e15\u0e32\u0e21\u0e1c\u0e25 \u0e2b\u0e32\u0e01\u0e44\u0e21\u0e48\u0e14\u0e35\u0e02\u0e36\u0e49\u0e19\u0e43\u0e2b\u0e49\u0e2a\u0e48\u0e07\u0e23\u0e39\u0e1b\u0e40\u0e1e\u0e34\u0e48\u0e21\u0e40\u0e15\u0e34\u0e21\u0e2b\u0e23\u0e37\u0e2d\u0e1e\u0e1a\u0e41\u0e1e\u0e17\u0e22\u0e4c';

  const patientContext = await browser.newContext();
  const patientPage = await patientContext.newPage();
  await submitPatientConsultation(patientPage, complaint);

  await expect(patientPage.getByText(text.imagesLabel, { exact: true })).toBeVisible();
  await expect(patientPage.getByText(text.zeroImages)).toBeVisible();

  const doctorContext = await browser.newContext();
  const doctorPage = await doctorContext.newPage();
  await respondAsDoctor(doctorPage, complaint, diagnosis, advice);

  await patientPage.getByRole('button', { name: text.viewStatus }).click();
  await patientPage.getByRole('button', { name: text.refreshStatus }).click();

  await expect(patientPage.getByRole('heading', { name: text.completed })).toBeVisible();
  await expect(patientPage.getByText(diagnosis)).toBeVisible();
  await expect(patientPage.getByText(advice)).toBeVisible();
  await expect(patientPage.getByText('Hydrocortisone 1% cream')).toBeVisible();

  await doctorContext.close();
  await patientContext.close();
});

test('doctor can escalate and patient sees escalated status', async ({ browser }) => {
  const complaint = uniqueComplaint('\u0e1c\u0e37\u0e48\u0e19\u0e2d\u0e32\u0e01\u0e32\u0e23\u0e2b\u0e19\u0e31\u0e01\u0e17\u0e14\u0e2a\u0e2d\u0e1a\u0e2d\u0e31\u0e15\u0e42\u0e19\u0e21\u0e31\u0e15\u0e34');
  const diagnosis = '\u0e2a\u0e07\u0e2a\u0e31\u0e22\u0e20\u0e32\u0e27\u0e30\u0e17\u0e35\u0e48\u0e04\u0e27\u0e23\u0e2a\u0e48\u0e07\u0e15\u0e48\u0e2d\u0e40\u0e1e\u0e37\u0e48\u0e2d\u0e15\u0e23\u0e27\u0e08\u0e40\u0e1e\u0e34\u0e48\u0e21';
  const advice = '\u0e41\u0e19\u0e30\u0e19\u0e33\u0e43\u0e2b\u0e49\u0e1e\u0e1a\u0e41\u0e1e\u0e17\u0e22\u0e4c\u0e40\u0e09\u0e1e\u0e32\u0e30\u0e17\u0e32\u0e07\u0e2b\u0e23\u0e37\u0e2d\u0e2b\u0e49\u0e2d\u0e07\u0e09\u0e38\u0e01\u0e40\u0e09\u0e34\u0e19\u0e2b\u0e32\u0e01\u0e2d\u0e32\u0e01\u0e32\u0e23\u0e41\u0e22\u0e48\u0e25\u0e07';

  const patientContext = await browser.newContext();
  const patientPage = await patientContext.newPage();
  await submitPatientConsultation(patientPage, complaint);

  const doctorContext = await browser.newContext();
  const doctorPage = await doctorContext.newPage();
  await respondAsDoctor(doctorPage, complaint, diagnosis, advice, true);

  await patientPage.getByRole('button', { name: text.viewStatus }).click();
  await patientPage.getByRole('button', { name: text.refreshStatus }).click();

  await expect(patientPage.getByRole('heading', { name: text.escalated })).toBeVisible();
  await expect(patientPage.getByText(advice)).toBeVisible();
  await expect(patientPage.getByText(diagnosis)).toBeVisible();

  await doctorContext.close();
  await patientContext.close();
});
