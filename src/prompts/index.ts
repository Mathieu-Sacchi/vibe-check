import { AUDIT_PROMPTS } from './auditPrompts';

/**
 * Default set of audit prompts for comprehensive repository analysis
 */
export const DEFAULT_PROMPTS = [
  AUDIT_PROMPTS.secrets,
  AUDIT_PROMPTS.security,
  AUDIT_PROMPTS.quality,
  AUDIT_PROMPTS.documentation,
];

export { AUDIT_PROMPTS };
