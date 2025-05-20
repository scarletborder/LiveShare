import {
    logToScreen, setSignalInputOrder,
    hostBtn, clientBtn, confirmRemoteSignalBtn, copyLocalSignalBtn, disconnectBtn,
    sendTypeRadios, sendBtn, cancelSendBtn, textInput, fileInput,
    sendTextContainer, sendFileContainer,
    settingsContent, toggleSettingsBtn,
    receiveModuleDiv, fileSendProgressContainer, fileNameSend,
    fileSendProgressBar, fileSendStatus, connectionLog,
    backBtn, clearLogBtn, addMessageToUI
} from './widget';

import {
    loadStunServers, startHost, startClient, handleRemoteSignal,
    resetConnection, handleSendFile, cancelFileSend,
    handleSendText
} from './logic';

// --- Configuration ---
const DEFAULT_STUN_SERVER = "stun:stun.l.google.com:19302";
const STUN_SERVERS_STORAGE_KEY = "webrtcP2PStunServers";
const CHUNK_SIZE = 16384; // 16KB chunks for file transfer

// --- Global State ---
let peerConnection: RTCPeerConnection | null = null;
let dataChannel: RTCDataChannel | null = null;
let userRole: "host" | "client" | null = null;
let stunServers: string[] = [];
let currentStunServer: string = DEFAULT_STUN_SERVER;

let sendingFile: File | null = null;
let sendingFileReader: FileReader | null = null;
let sendOffset: number = 0;
let sendCancelled: boolean = false;

let receiveBuffer: ArrayBuffer[] = [];
let receivedFileInfo: { name: string; type: string; size: number } | null = null;
let receivedSize: number = 0;


// --- DOM Elements ---
// Settings
const settingsModule = document.getElementById("settingsModule") as HTMLDivElement;
const currentStunServerDisplay = document.getElementById("currentStunServerDisplay") as HTMLSpanElement;
const stunServerInput = document.getElementById("stunServerInput") as HTMLInputElement;
const addStunBtn = document.getElementById("addStunBtn") as HTMLButtonElement;
const stunServerListElement = document.getElementById("stunServerList") as HTMLUListElement;

// Connection
const roleSelectionDiv = document.getElementById("roleSelection") as HTMLDivElement;
const roleDisplay = document.getElementById("roleDisplay") as HTMLHeadingElement;

// MODIFIED: Get signal group containers for reordering
const signalInputContainer = document.getElementById("signalInputContainer") as HTMLDivElement;
const localSignalGroup = document.getElementById("localSignalGroup") as HTMLDivElement;
const remoteSignalGroup = document.getElementById("remoteSignalGroup") as HTMLDivElement;

const localSignalText = document.getElementById("localSignal") as HTMLTextAreaElement;
const remoteSignalText = document.getElementById("remoteSignal") as HTMLTextAreaElement;
const connectedViewDiv = document.getElementById("connectedView") as HTMLDivElement;
const connectionSetupDiv = document.getElementById("connectionSetup") as HTMLDivElement;

// Send
const sendModuleDiv = document.getElementById("sendModule") as HTMLDivElement;
const receivedFilesList = document.getElementById("receivedFilesList") as HTMLDivElement;
const fileReceiveProgressContainer = document.getElementById("fileReceiveProgressContainer") as HTMLDivElement;
const fileNameReceive = document.getElementById("fileNameReceive") as HTMLSpanElement;
const fileReceiveProgressBar = document.getElementById("fileReceiveProgressBar") as HTMLDivElement;
const fileReceiveStatus = document.getElementById("fileReceiveStatus") as HTMLSpanElement;




// --- STUN Server Management ---

function saveStunServers() {
    localStorage.setItem(STUN_SERVERS_STORAGE_KEY, JSON.stringify(stunServers));
}

function renderStunServerList() {
    stunServerListElement.innerHTML = "";
    stunServers.forEach(serverUrl => {
        const li = document.createElement("li");
        li.className = 'stun-server-item';

        const span = document.createElement("span");
        span.textContent = serverUrl;
        li.appendChild(span);

        const controlsDiv = document.createElement("div");

        const selectBtn = document.createElement("button");
        selectBtn.textContent = "Use";
        selectBtn.disabled = (serverUrl === currentStunServer);
        selectBtn.onclick = () => {
            currentStunServer = serverUrl;
            updateCurrentStunDisplay();
            renderStunServerList();
            logToScreen(`Selected STUN server: ${currentStunServer}`);
        };
        controlsDiv.appendChild(selectBtn);

        if (serverUrl !== DEFAULT_STUN_SERVER) {
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.style.backgroundColor = "#dc3545";
            deleteBtn.onclick = () => {
                stunServers = stunServers.filter(s => s !== serverUrl);
                if (currentStunServer === serverUrl) {
                    currentStunServer = stunServers[0] || DEFAULT_STUN_SERVER;
                }
                saveStunServers();
                renderStunServerList();
                updateCurrentStunDisplay();
            };
            controlsDiv.appendChild(deleteBtn);
        }
        li.appendChild(controlsDiv);
        stunServerListElement.appendChild(li);
    });
}

function updateCurrentStunDisplay() {
    currentStunServerDisplay.textContent = currentStunServer;
}

addStunBtn.onclick = () => {
    const newServer = stunServerInput.value.trim();
    if (newServer && !stunServers.includes(newServer)) {
        try {
            const url = new URL(newServer);
            if (url.protocol !== "stun:" && url.protocol !== "stuns:" && url.protocol !== "turn:" && url.protocol !== "turns:") {
                throw new Error("Invalid protocol. Must be stun(s): or turn(s):");
            }
            stunServers.push(newServer);
            saveStunServers();
            renderStunServerList();
            stunServerInput.value = "";
        } catch (error) {
            logToScreen(`Error adding STUN server: ${(error as Error).message}. Please use format like stun:example.com:port or turn:example.com:port?transport=udp`);
        }
    } else if (stunServers.includes(newServer)) {
        logToScreen("STUN server already in the list.");
    } else {
        logToScreen("STUN server URL cannot be empty.");
    }
};

// --- Settings Module Toggle Logic ---
function toggleSettings() {
    const isCollapsed = settingsContent.classList.contains("collapsed");
    if (isCollapsed) {
        settingsContent.classList.remove("collapsed");
        toggleSettingsBtn.textContent = "▼";
    } else {
        settingsContent.classList.add("collapsed");
        toggleSettingsBtn.textContent = "▶";
    }
}

// --- UI Event Handlers ---
hostBtn.onclick = () => {
    roleSelectionDiv.classList.add("hidden");
    connectionSetupDiv.classList.remove("hidden");
    confirmRemoteSignalBtn.textContent = "Confirm Client's Signal & Connect";
    startHost();
};

clientBtn.onclick = () => {
    roleSelectionDiv.classList.add("hidden");
    connectionSetupDiv.classList.remove("hidden");
    confirmRemoteSignalBtn.textContent = "Confirm Host's Signal & Generate Response";
    startClient();
};

backBtn.onclick = () => {
    resetConnection();
    logToScreen("已返回角色选择界面");
};

confirmRemoteSignalBtn.onclick = handleRemoteSignal;

copyLocalSignalBtn.onclick = () => {
    if (localSignalText.value) {
        localSignalText.select();
        navigator.clipboard.writeText(localSignalText.value)
            .then(() => logToScreen("Local signal copied to clipboard."))
            .catch(err => logToScreen("Failed to copy local signal: " + err));
    } else {
        logToScreen("No local signal generated yet to copy.");
    }
};

disconnectBtn.onclick = resetConnection;

// --- Send Module Logic ---
sendTypeRadios.forEach(radio => {
    radio.onchange = () => {
        if ((radio as HTMLInputElement).value === "text") {
            sendTextContainer.classList.remove("hidden");
            sendFileContainer.classList.add("hidden");
        } else {
            sendTextContainer.classList.add("hidden");
            sendFileContainer.classList.remove("hidden");
        }
    };
});

sendBtn.onclick = () => {
    const sendType = (document.querySelector('input[name="sendType"]:checked') as HTMLInputElement).value;

    if (sendType === "text") {
        const text = textInput.value;
        if (!text.trim()) {
            logToScreen("Cannot send: Text is empty.");
            return;
        }
        try {
            const message = {
                type: "text",
                payload: text
            };

            handleSendText(text);

            addMessageToUI('send', text);
            textInput.value = "";
        } catch (error) {
            logToScreen(`Error sending text: ${(error as Error).message}`);
        }
    } else if (sendType === "file") {
        if (fileInput.files && fileInput.files.length > 0) {
            handleSendFile(fileInput.files[0]);
        }
    }
};

cancelSendBtn.onclick = cancelFileSend;



// --- Receive Module Logic ---
function addReceivedFileToUI(fileName: string, fileBlob: Blob) {
    const fileItem = document.createElement("div");
    fileItem.className = "file-item";

    const fileNameSpan = document.createElement("span");
    fileNameSpan.textContent = `${fileName} (${(fileBlob.size / (1024 * 1024) > 1 ? (fileBlob.size / (1024 * 1024)).toFixed(2) + ' MB' : (fileBlob.size / 1024).toFixed(2) + ' KB')})`;
    fileItem.appendChild(fileNameSpan);

    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "Download";
    downloadBtn.onclick = () => {
        const url = URL.createObjectURL(fileBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    fileItem.appendChild(downloadBtn);
    receivedFilesList.appendChild(fileItem);
}


// --- Initialization ---
export function main() {
    loadStunServers();
    resetConnection();

    // Initialize settings module as collapsed
    settingsContent.classList.add("collapsed");
    toggleSettingsBtn.textContent = "▶";
    toggleSettingsBtn.onclick = toggleSettings;

    (document.querySelector('input[name="sendType"][value="text"]') as HTMLInputElement).checked = true;
    sendTextContainer.classList.remove("hidden");
    sendFileContainer.classList.add("hidden");

    connectionLog.innerHTML = "";
    logToScreen("Application initialized. Please choose a role (HOST or CLIENT) to begin.");
}

// --- UI Event Handlers ---
let clearLogTimeout: number | null = null;

clearLogBtn.onclick = () => {
    if (clearLogBtn.classList.contains('confirm')) {
        connectionLog.innerHTML = '';
        logToScreen('Log has been cleared');
        clearLogBtn.classList.remove('confirm');
        clearLogBtn.textContent = 'Clear Log';
        if (clearLogTimeout) {
            window.clearTimeout(clearLogTimeout);
            clearLogTimeout = null;
        }
    } else {
        clearLogBtn.classList.add('confirm');
        clearLogBtn.textContent = 'Confirm Clear';
        if (clearLogTimeout) {
            window.clearTimeout(clearLogTimeout);
        }
        clearLogTimeout = window.setTimeout(() => {
            clearLogBtn.classList.remove('confirm');
            clearLogBtn.textContent = 'Clear Log';
            clearLogTimeout = null;
        }, 3000);
    }
};

// 点击其他地方时重置清空按钮状态
document.addEventListener('click', (event) => {
    if (!clearLogBtn.contains(event.target as Node) && clearLogBtn.classList.contains('confirm')) {
        clearLogBtn.classList.remove('confirm');
        clearLogBtn.textContent = 'Clear Log';
        if (clearLogTimeout) {
            window.clearTimeout(clearLogTimeout);
            clearLogTimeout = null;
        }
    }
});