const STORAGE_KEY = "kgsc_messages";

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function loadMessages() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch {
        return [];
    }
}

function persist(messages) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function saveMessage({ title, message, senderName = "Admin", senderRole = "Admin" }) {
    const messages = loadMessages();
    const newMessage = {
        _id: generateId(),
        date: new Date().toISOString(),
        title: title.trim(),
        message: message.trim(),
        senderName,
        senderRole,
    };
    persist([newMessage, ...messages]);
    return newMessage;
}

export function deleteMessage(id) {
    const updated = loadMessages().filter((m) => m._id !== id);
    persist(updated);
    return updated;
}