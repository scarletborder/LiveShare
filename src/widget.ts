// --- DOM Elements ---
// Settings
export const settingsModule = document.getElementById("settingsModule") as HTMLDivElement;
export const settingsContent = document.getElementById("settingsContent") as HTMLDivElement;
export const toggleSettingsBtn = document.getElementById("toggleSettingsBtn") as HTMLButtonElement;
export const currentStunServerDisplay = document.getElementById("currentStunServerDisplay") as HTMLSpanElement;
export const stunServerInput = document.getElementById("stunServerInput") as HTMLInputElement;
export const addStunBtn = document.getElementById("addStunBtn") as HTMLButtonElement;
export const stunServerListElement = document.getElementById("stunServerList") as HTMLUListElement;

// Connection
export const roleSelectionDiv = document.getElementById("roleSelection") as HTMLDivElement;
export const hostBtn = document.getElementById("hostBtn") as HTMLButtonElement;
export const clientBtn = document.getElementById("clientBtn") as HTMLButtonElement;
export const backBtn = document.getElementById("backBtn") as HTMLButtonElement;
export const connectionSetupDiv = document.getElementById("connectionSetup") as HTMLDivElement;
export const roleDisplay = document.getElementById("roleDisplay") as HTMLHeadingElement;

export const signalInputContainer = document.getElementById("signalInputContainer") as HTMLDivElement;
export const localSignalGroup = document.getElementById("localSignalGroup") as HTMLDivElement;
export const remoteSignalGroup = document.getElementById("remoteSignalGroup") as HTMLDivElement;

export const localSignalText = document.getElementById("localSignal") as HTMLTextAreaElement;
export const copyLocalSignalBtn = document.getElementById("copyLocalSignalBtn") as HTMLButtonElement;
export const remoteSignalText = document.getElementById("remoteSignal") as HTMLTextAreaElement;
export const confirmRemoteSignalBtn = document.getElementById("confirmRemoteSignalBtn") as HTMLButtonElement;
export const connectionLog = document.getElementById("connectionLog") as HTMLDivElement;
export const clearLogBtn = document.getElementById("clearLogBtn") as HTMLButtonElement;
export const connectedViewDiv = document.getElementById("connectedView") as HTMLDivElement;
export const disconnectBtn = document.getElementById("disconnectBtn") as HTMLButtonElement;

// Send
export const sendModuleDiv = document.getElementById("sendModule") as HTMLDivElement;
export const sendTypeRadios = document.querySelectorAll<HTMLInputElement>('input[name="sendType"]');
export const sendTextContainer = document.getElementById("sendTextContainer") as HTMLDivElement;
export const sendFileContainer = document.getElementById("sendFileContainer") as HTMLDivElement;
export const textInput = document.getElementById("textInput") as HTMLTextAreaElement;
export const fileInput = document.getElementById("fileInput") as HTMLInputElement;
export const sendBtn = document.getElementById("sendBtn") as HTMLButtonElement;
export const fileSendProgressContainer = document.getElementById("fileSendProgressContainer") as HTMLDivElement;
export const fileNameSend = document.getElementById("fileNameSend") as HTMLSpanElement;
export const fileSendProgressBar = document.getElementById("fileSendProgressBar") as HTMLDivElement;
export const fileSendStatus = document.getElementById("fileSendStatus") as HTMLSpanElement;
export const cancelSendBtn = document.getElementById("cancelSendBtn") as HTMLButtonElement;

// Receive
export const receiveModuleDiv = document.getElementById("receiveModule") as HTMLDivElement;
export const receivedFilesList = document.getElementById("receivedFilesList") as HTMLDivElement;
export const fileReceiveProgressContainer = document.getElementById("fileReceiveProgressContainer") as HTMLDivElement;
export const fileNameReceive = document.getElementById("fileNameReceive") as HTMLSpanElement;
export const fileReceiveProgressBar = document.getElementById("fileReceiveProgressBar") as HTMLDivElement;
export const fileReceiveStatus = document.getElementById("fileReceiveStatus") as HTMLSpanElement;
export const messagesList = document.querySelector(".messages-list") as HTMLDivElement;

// --- UI Utility Functions ---
export function logToScreen(message: string) {
    console.log(message);
    const logEntry = document.createElement("div");
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    connectionLog.appendChild(logEntry);
    connectionLog.scrollTop = connectionLog.scrollHeight;
}

export function setSignalInputOrder(order: "host" | "client") {
    if (order === "host") {
        signalInputContainer.appendChild(localSignalGroup);
        signalInputContainer.appendChild(remoteSignalGroup);
    } else {
        signalInputContainer.appendChild(remoteSignalGroup);
        signalInputContainer.appendChild(localSignalGroup);
    }
}

export function addReceivedFileToUI(fileName: string, fileBlob: Blob) {
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

export function addMessageToUI(type: 'send' | 'receive', content: string) {
    const messageItem = document.createElement("div");
    messageItem.className = "message-item";

    const messageInfo = document.createElement("div");
    messageInfo.className = "message-info";

    const messageType = document.createElement("span");
    messageType.className = `message-type ${type}`;
    messageType.textContent = type === 'send' ? 'Send' : 'Receive';

    const messageTime = document.createElement("span");
    messageTime.className = "message-time";
    messageTime.textContent = new Date().toLocaleTimeString();

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "Copy";
    copyBtn.onclick = () => {
        navigator.clipboard.writeText(content)
            .then(() => {
                copyBtn.textContent = "Copied";
                setTimeout(() => {
                    copyBtn.textContent = "Copy";
                }, 2000);
            })
            .catch(err => console.error('Failed to copy:', err));
    };

    messageInfo.appendChild(messageType);
    messageInfo.appendChild(messageTime);
    messageInfo.appendChild(copyBtn);

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    messageContent.textContent = content;

    messageItem.appendChild(messageInfo);
    messageItem.appendChild(messageContent);
    messagesList.appendChild(messageItem);
    messagesList.scrollTop = messagesList.scrollHeight;
} 