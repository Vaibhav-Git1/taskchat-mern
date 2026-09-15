export const INTENT = {
  GREETING: 'GREETING',
  CREATE_TASK: 'CREATE_TASK',
  LIST_TASKS: 'LIST_TASKS',
  SEARCH_TASK: 'SEARCH_TASK',
  UPDATE_STATUS: 'UPDATE_STATUS',
  HELP: 'HELP',
  UNKNOWN: 'UNKNOWN',
};

export function detectIntent(text) {
  const t = text.toLowerCase().trim();

  if (/^(hi+|hello+|hey+|namaste|hola|yo|hiya|good\s*(morning|evening|afternoon|night))/.test(t)) {
    return INTENT.GREETING;
  }

  if (
    /(create|add|new|make|banao|bnao|likho|dalo|chahiye)\s*(a\s+)?(new\s+)?(task|kaam|work)/i.test(t) ||
    /(task|kaam)\s*(banao|bnao|add|create|new|chahiye|banana)/i.test(t) ||
    /^(new task|add task|create task|task add|task create)$/.test(t)
  ) {
    return INTENT.CREATE_TASK;
  }

  if (
    /(show|list|view|get|see|dikha|dikhao|batao|display)\s*(all\s*)?(my\s*)?(tasks?|kaam)/i.test(t) ||
    /(tasks?|kaam)\s*(dikhao|batao|show|list|dikha|dekho)/i.test(t) ||
    /^(tasks?|all\s*tasks?|my\s*tasks?|mera\s*kaam|meri\s*task)$/.test(t) ||
    /(pending|completed|in.progress)\s*tasks?/i.test(t) ||
    /tasks?\s*(pending|completed|in.progress)/i.test(t)
  ) {
    return INTENT.LIST_TASKS;
  }

  if (
    /(search|find|look\s*for|dhundo|dhundh|khojo|locate)\s*(task|kaam|for)?/i.test(t) ||
    /task\s*(search|dhundo|khojo)/i.test(t)
  ) {
    return INTENT.SEARCH_TASK;
  }

  if (
    /(update|change|mark|set|complete|done|finish|khatam|badlo|kar\s*do)\s*(task|status|as)?/i.test(t) ||
    /(status)\s*(update|badlo|change|karo)/i.test(t) ||
    /mark\s*(as\s*)?(done|completed?|pending|in\s*progress|finished)/i.test(t) ||
    /(task|kaam)\s*(complete|khatam|done|finish)/i.test(t)
  ) {
    return INTENT.UPDATE_STATUS;
  }

  if (/(help|commands?|options?|what\s*can|kya\s*kar|guide|kaise\s*kare|tutorial)/i.test(t)) {
    return INTENT.HELP;
  }

  return INTENT.UNKNOWN;
}

export function extractSearchQuery(text) {
  return text
    .replace(/search|find|look\s*for|dhundo|dhundh|khojo|locate|task|kaam|for/gi, '')
    .trim() || null;
}

export function parseDate(text) {
  const t = text.toLowerCase().trim();
  const now = new Date();

  if (/today|aaj/.test(t)) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59);
  }

  if (/tomorrow|kal/.test(t)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    applyTime(d, t);
    return d;
  }

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < days.length; i++) {
    if (t.includes(days[i])) {
      const d = new Date(now);
      const diff = ((i - d.getDay() + 7) % 7) || 7;
      d.setDate(d.getDate() + diff);
      applyTime(d, t);
      return d;
    }
  }

  const inDays = t.match(/in\s+(\d+)\s+days?/);
  if (inDays) {
    const d = new Date(now);
    d.setDate(d.getDate() + parseInt(inDays[1]));
    return d;
  }

  if (/next\s*week|agli\s*hafte/.test(t)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 7);
    return d;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return parsed;

  return null;
}

function applyTime(date, text) {
  const m = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (m) {
    let h = parseInt(m[1]);
    const min = parseInt(m[2] || 0);
    if (m[3]?.toLowerCase() === 'pm' && h !== 12) h += 12;
    if (m[3]?.toLowerCase() === 'am' && h === 12) h = 0;
    date.setHours(h, min, 0, 0);
  }
}

export function formatDate(date) {
  if (!date) return 'No due date';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
