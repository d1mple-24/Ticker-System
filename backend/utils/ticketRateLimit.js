import crypto from 'crypto';

// Store submission attempts by email and IP
const submissionStore = new Map();

// Constants for rate limiting
const MAX_SUBMISSIONS_PER_EMAIL = 3; // Maximum submissions per email in the time window
const MAX_SUBMISSIONS_PER_IP = 5; // Maximum submissions per IP in the time window
const SUBMISSION_WINDOW = 60 * 60 * 1000; // 1 hour window for submissions
const LOCKOUT_DURATION = 24 * 60 * 60 * 1000; // 24 hours lockout after too many submissions

// Clean up expired records
const cleanup = () => {
  const now = Date.now();
  
  for (const [key, data] of submissionStore.entries()) {
    if (now - data.lastSubmission > SUBMISSION_WINDOW) {
      submissionStore.delete(key);
    }
  }
};

// Check if submission is allowed
export const canSubmitTicket = (email, ip) => {
  cleanup();
  
  const now = Date.now();
  const emailKey = `email:${email}`;
  const ipKey = `ip:${ip}`;
  
  // Get submission data
  const emailData = submissionStore.get(emailKey) || {
    submissions: 0,
    lastSubmission: now,
    isLocked: false,
    lockedAt: null
  };
  
  const ipData = submissionStore.get(ipKey) || {
    submissions: 0,
    lastSubmission: now,
    isLocked: false,
    lockedAt: null
  };
  
  // Check if locked out
  if (emailData.isLocked && now - emailData.lockedAt < LOCKOUT_DURATION) {
    throw new Error('This email has been temporarily blocked due to too many submissions. Please try again later.');
  }
  
  if (ipData.isLocked && now - ipData.lockedAt < LOCKOUT_DURATION) {
    throw new Error('Your IP has been temporarily blocked due to too many submissions. Please try again later.');
  }
  
  // Check submission limits
  if (emailData.submissions >= MAX_SUBMISSIONS_PER_EMAIL) {
    emailData.isLocked = true;
    emailData.lockedAt = now;
    submissionStore.set(emailKey, emailData);
    throw new Error('Maximum ticket submissions reached for this email. Please try again tomorrow.');
  }
  
  if (ipData.submissions >= MAX_SUBMISSIONS_PER_IP) {
    ipData.isLocked = true;
    ipData.lockedAt = now;
    submissionStore.set(ipKey, ipData);
    throw new Error('Maximum ticket submissions reached from your IP. Please try again tomorrow.');
  }
  
  return true;
};

// Record a successful submission
export const recordSubmission = (email, ip) => {
  const now = Date.now();
  const emailKey = `email:${email}`;
  const ipKey = `ip:${ip}`;
  
  // Update email submission data
  const emailData = submissionStore.get(emailKey) || {
    submissions: 0,
    lastSubmission: now,
    isLocked: false,
    lockedAt: null
  };
  
  emailData.submissions++;
  emailData.lastSubmission = now;
  submissionStore.set(emailKey, emailData);
  
  // Update IP submission data
  const ipData = submissionStore.get(ipKey) || {
    submissions: 0,
    lastSubmission: now,
    isLocked: false,
    lockedAt: null
  };
  
  ipData.submissions++;
  ipData.lastSubmission = now;
  submissionStore.set(ipKey, ipData);
}; 