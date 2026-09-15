import { useState } from 'react';
import { detectIntent, parseDate, extractSearchQuery, INTENT } from '../utils/chatParser';
import api from '../utils/api';

const mkBot = (text, extra = {}) => ({ id: crypto.randomUUID(), from: 'bot', text, ...extra });
const mkUser = (text) => ({ id: crypto.randomUUID(), from: 'user', text });

const HELP_TEXT = `Here's what I can do:

📝 Create task  →  "create task" / "task banao"
📋 View tasks   →  "show tasks" / "tasks dikhao"
🔍 Search       →  "search login bug" / "dhundo payment"
✏️  Update status → "update status" / "mark task done"

You can type in English, Hindi, or Hinglish!`;

export function useChat({ tasks, setTasks, users, user }) {
  const [messages, setMessages] = useState([
    mkBot(
      `Namaste ${user.name}! 👋 I'm your task assistant.\n\nI understand English, Hindi, and Hinglish. Type "help" to see what I can do, or say "create task" to get started!`
    ),
  ]);
  const [step, setStep] = useState('IDLE');
  const [draft, setDraft] = useState({});

  const pushBot = (text, extra = {}) =>
    setMessages((m) => [...m, mkBot(text, extra)]);

  const send = async (rawText) => {
    const text = rawText.trim();
    if (!text) return;

    setMessages((m) => [...m, mkUser(text)]);
    const tl = text.toLowerCase();

    /* ─── STEP: collecting task title ─── */
    if (step === 'TITLE') {
      setDraft((d) => ({ ...d, title: text }));
      setStep('DESC');
      pushBot("Got it! Give me a short description (or type skip).");
      return;
    }

    /* ─── STEP: collecting description ─── */
    if (step === 'DESC') {
      setDraft((d) => ({ ...d, description: tl === 'skip' ? '' : text }));
      setStep('DUE');
      pushBot(
        "When is this due? You can say things like tomorrow, Friday, next week, or a specific date. Type skip for no due date."
      );
      return;
    }

    /* ─── STEP: collecting due date ─── */
    if (step === 'DUE') {
      if (tl !== 'skip') {
        const parsed = parseDate(text);
        if (!parsed) {
          pushBot(
            "Hmm, I couldn't read that date. Try 'tomorrow', 'Friday', 'Jan 20', or 'skip'."
          );
          return;
        }
        setDraft((d) => ({ ...d, dueDate: parsed }));
      }
      setStep('ASSIGN');

      if (users.length === 0) {
        pushBot("Who should this be assigned to? (No other users found — type 'me' or 'skip')");
      } else {
        const list = users.map((u, i) => `${i + 1}. ${u.name} (${u.email})`).join('\n');
        pushBot(`Who should this be assigned to?\n\n${list}\n\nType a number, name, 'me', or 'skip'.`);
      }
      return;
    }

    /* ─── STEP: collecting assignee ─── */
    if (step === 'ASSIGN') {
      let assignedTo = null;

      if (tl !== 'skip' && tl !== 'me' && tl !== 'none' && tl !== 'nobody') {
        const idx = parseInt(text) - 1;
        if (!isNaN(idx) && users[idx]) {
          assignedTo = users[idx]._id;
        } else {
          const found = users.find(
            (u) =>
              u.name.toLowerCase().includes(tl) || u.email.toLowerCase().includes(tl)
          );
          if (found) {
            assignedTo = found._id;
          } else {
            pushBot(`Couldn't find "${text}". Pick a number from the list, type a name, or say 'skip'.`);
            return;
          }
        }
      }

      const payload = { ...draft, assignedTo };
      setStep('IDLE');
      setDraft({});

      try {
        pushBot('Creating task...');
        const { data } = await api.post('/tasks', payload);
        setTasks((prev) => [data, ...prev]);
        setMessages((m) => {
          const without = m.filter((msg) => msg.text !== 'Creating task...');
          return [...without, mkBot('Task created! ✅', { type: 'task_created', task: data })];
        });
      } catch (err) {
        pushBot(`Failed: ${err.response?.data?.msg || 'Server error'}`);
      }
      return;
    }

    /* ─── STEP: picking task to update ─── */
    if (step === 'UPDATE_SELECT') {
      const idx = parseInt(text) - 1;
      if (isNaN(idx) || idx < 0 || idx >= tasks.length) {
        pushBot('Please enter a valid number from the list.');
        return;
      }
      setDraft({ task: tasks[idx] });
      setStep('UPDATE_STATUS');
      pushBot(
        `Updating "${tasks[idx].title}". What's the new status?\n\n1. Pending\n2. In Progress\n3. Completed`
      );
      return;
    }

    /* ─── STEP: picking new status ─── */
    if (step === 'UPDATE_STATUS') {
      const map = {
        '1': 'Pending', pending: 'Pending',
        '2': 'In Progress', 'in progress': 'In Progress', progress: 'In Progress', wip: 'In Progress',
        '3': 'Completed', completed: 'Completed', complete: 'Completed', done: 'Completed',
        khatam: 'Completed', finish: 'Completed', finished: 'Completed',
      };
      const newStatus = map[tl];
      if (!newStatus) {
        pushBot('Please choose: 1 (Pending), 2 (In Progress), or 3 (Completed).');
        return;
      }

      const { task } = draft;
      setStep('IDLE');
      setDraft({});

      try {
        const { data } = await api.put(`/tasks/${task._id}`, { status: newStatus });
        setTasks((prev) => prev.map((t) => (t._id === data._id ? data : t)));
        pushBot(`Status updated to "${newStatus}" ✅`);
      } catch (err) {
        pushBot(`Failed: ${err.response?.data?.msg || 'Server error'}`);
      }
      return;
    }

    /* ─── IDLE: intent detection ─── */
    const intent = detectIntent(text);

    if (intent === INTENT.GREETING) {
      const replies = [
        `Hey ${user.name}! 👋 How can I help?`,
        `Hello! Ready to get things done?`,
        `Namaste! 🙏 What would you like to do?`,
        `Hi there! Type "help" to see my commands.`,
      ];
      pushBot(replies[Math.floor(Math.random() * replies.length)]);
      return;
    }

    if (intent === INTENT.HELP) {
      pushBot(HELP_TEXT);
      return;
    }

    if (intent === INTENT.CREATE_TASK) {
      setStep('TITLE');
      setDraft({});
      pushBot("Let's create a task! What should it be called?");
      return;
    }

    if (intent === INTENT.LIST_TASKS) {
      if (tasks.length === 0) {
        pushBot("You don't have any tasks yet. Say 'create task' to add one!");
        return;
      }

      let filtered = tasks;
      let label = 'all';

      if (/pending/.test(tl)) { filtered = tasks.filter((t) => t.status === 'Pending'); label = 'pending'; }
      else if (/completed|done|khatam/.test(tl)) { filtered = tasks.filter((t) => t.status === 'Completed'); label = 'completed'; }
      else if (/in.progress|progress|wip/.test(tl)) { filtered = tasks.filter((t) => t.status === 'In Progress'); label = 'in-progress'; }
      else if (/my|mine|mera|meri/.test(tl)) { filtered = tasks.filter((t) => t.assignedBy?._id === user.id); label = 'your'; }
      else if (/assigned/.test(tl)) { filtered = tasks.filter((t) => t.assignedTo?._id === user.id); label = 'assigned'; }

      if (filtered.length === 0) {
        pushBot(`No ${label} tasks found.`);
        return;
      }
      pushBot(null, { type: 'task_list', tasks: filtered, label });
      return;
    }

    if (intent === INTENT.SEARCH_TASK) {
      const q = extractSearchQuery(text);
      if (!q) {
        pushBot('What would you like to search for?');
        return;
      }
      await doSearch(q);
      return;
    }

    if (intent === INTENT.UPDATE_STATUS) {
      if (tasks.length === 0) {
        pushBot("No tasks to update. Create one first!");
        return;
      }
      setStep('UPDATE_SELECT');
      const list = tasks.map((t, i) => `${i + 1}. ${t.title} — ${t.status}`).join('\n');
      pushBot(`Which task would you like to update?\n\n${list}\n\nType the number.`);
      return;
    }

    pushBot(
      "I didn't quite get that. Type 'help' to see what I can do, or try:\n• \"create task\"\n• \"show tasks\"\n• \"search [keyword]\""
    );

    async function doSearch(q) {
      try {
        pushBot(`Searching for "${q}"...`);
        const { data } = await api.get(`/tasks/search?q=${encodeURIComponent(q)}`);
        setMessages((m) => {
          const without = m.filter((msg) => msg.text !== `Searching for "${q}"...`);
          if (data.length === 0) {
            return [...without, mkBot(`No tasks found matching "${q}".`)];
          }
          return [...without, mkBot(null, { type: 'task_list', tasks: data, label: `"${q}"` })];
        });
      } catch {
        pushBot('Search failed. Please try again.');
      }
    }
  };

  return { messages, send };
}
