// @ts-check

/** Методы для работы с хранилищем данных */
const storageHelpers = {
    readNotes: () => chrome.storage.sync.get(),
    addNote: async (text) => {
        const uuid = await window.crypto.randomUUID();
        await chrome.storage.sync.set({ [uuid]: text });
        return { uuid, text }
    },
    removeNote: async (uuid) => {
        await chrome.storage.sync.remove(uuid);
    },
    updateNote: async (uuid, text) => {
        await chrome.storage.sync.set({ [uuid]: text });
    }
}

const listContainer = /** @type {HTMLTemplateElement} */
    (document.querySelector('#list-container'));
const noteTemplate = /** @type {HTMLTemplateElement} */
    (document.querySelector('#note-template'));
const noteAddText = /** @type {HTMLInputElement} */
    (document.querySelector('#note-add-text'));
const noteAddBtn = /** @type {HTMLButtonElement} */
    (document.querySelector('#note-add-btn'));

const textareaSetHeight = (el) => {
    const rows = el.value.split('\n');
    const symbolsPerRow = Math.ceil(el.clientWidth / 10);
    const rowCount = rows.reduce((result, row) => {
        return row.length > 0
            ? result + Math.ceil(row.length / symbolsPerRow)
            : result + 1;
    }, 0);
    el.style.height = Math.max(rowCount * 14, 25) + 'px';
};
const textareaAutoGrow = (e) => textareaSetHeight(e.target);
noteAddText.oninput = textareaAutoGrow;

const appendNoteUI = (uuid, text) => {
    const note = /** @type {HTMLElement} */
        (noteTemplate.content.cloneNode(true));
    const noteArticle = /** @type {HTMLElement} */
        (note.querySelector('article'));
    noteArticle.dataset['id'] = uuid
    const noteEditText = /** @type {HTMLInputElement} */
        (note.querySelector('.note-edit-text'));
    const noteUpdateBtn = /** @type {HTMLButtonElement} */
        (note.querySelector('.note-update-btn'));
    const noteRemoveBtn = /** @type {HTMLButtonElement} */
        (note.querySelector('.note-remove-btn'));
    noteEditText.value = text;
    noteEditText.oninput = textareaAutoGrow;
    noteUpdateBtn.onclick = async () =>
        await storageHelpers.updateNote(uuid, noteEditText.value);
    noteRemoveBtn.onclick = async () => {
        await storageHelpers.removeNote(uuid);
        const noteArticle = /** @type {HTMLElement} */
            (listContainer.querySelector(`article[data-id="${uuid}"]`));
        listContainer.removeChild(noteArticle);
    }
    // Add to the ending of the list
    // listContainer.appendChild(note);
    // Add to the begining of the list
    listContainer.insertBefore(note, listContainer.firstChild);
    textareaSetHeight(noteEditText);
}

const run = async () => {
    noteAddBtn.addEventListener('click', async () => {
        const text = noteAddText.value;
        if (text) {
            const { uuid } = await storageHelpers.addNote(text);
            appendNoteUI(uuid, text);
            noteAddText.value = '';
            textareaSetHeight(noteAddText);
        }
    })

    const notes = await storageHelpers.readNotes();
    Object.entries(notes)
        // Show last notes at top
        .reverse()
        .forEach(([uuid, text]) => appendNoteUI(uuid, text));
}

run();
