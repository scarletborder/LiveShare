import {
    logToScreen, setSignalInputOrder, addReceivedFileToUI,
    currentStunServerDisplay, stunServerInput, stunServerListElement,
    roleDisplay, localSignalText, copyLocalSignalBtn, remoteSignalText,
    roleSelectionDiv, connectionSetupDiv, connectedViewDiv,
    sendModuleDiv, receiveModuleDiv, fileSendProgressContainer,
    fileReceiveProgressContainer, sendBtn, fileInput,
    fileNameSend, fileSendProgressBar, fileSendStatus,
    fileNameReceive, fileReceiveProgressBar, fileReceiveStatus,
    receivedFilesList, connectionLog, textInput,
    confirmRemoteSignalBtn,
    remoteSignalGroup,
    addMessageToUI
} from './widget';

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

// --- STUN Server Management ---
export function loadStunServers() {
    const storedServers = localStorage.getItem(STUN_SERVERS_STORAGE_KEY);
    if (storedServers) {
        stunServers = JSON.parse(storedServers);
    }
    if (stunServers.length === 0 || !stunServers.includes(DEFAULT_STUN_SERVER)) {
        stunServers.unshift(DEFAULT_STUN_SERVER);
    }
    if (!currentStunServer || !stunServers.includes(currentStunServer)) {
        currentStunServer = stunServers[0] || DEFAULT_STUN_SERVER;
    }
    renderStunServerList();
    updateCurrentStunDisplay();
}

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

// --- WebRTC Core Logic ---
export async function createPeerConnection() {
    logToScreen(`Attempting to connect using STUN: ${currentStunServer}`);
    const pcConfig: RTCConfiguration = {
        iceServers: [{ urls: currentStunServer }]
    };
    peerConnection = new RTCPeerConnection(pcConfig);
    const collectedIceCandidates: RTCIceCandidateInit[] = [];

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            logToScreen(`ICE Candidate gathered: ${event.candidate.candidate.substring(0, 30)}...`);
            collectedIceCandidates.push(event.candidate.toJSON());
        } else {
            logToScreen("All ICE candidates gathered. Finalizing signal...");
            const currentDescription = peerConnection!.localDescription;
            if (currentDescription) {
                localSignalText.value = JSON.stringify({
                    sdp: currentDescription.toJSON(),
                    candidates: collectedIceCandidates
                });
                if (userRole === "client") {
                    copyLocalSignalBtn.classList.remove("hidden");
                }
            }
        }
    };

    peerConnection.oniceconnectionstatechange = () => {
        if (!peerConnection) return;
        logToScreen(`ICE Connection State: ${peerConnection.iceConnectionState}`);
        if (peerConnection.iceConnectionState === "failed") {
            logToScreen("ICE connection failed. Restarting ICE...");
            peerConnection.restartIce();
        }
    };

    peerConnection.onconnectionstatechange = () => {
        if (!peerConnection) return;
        logToScreen(`Connection State: ${peerConnection.connectionState}`);
        if (peerConnection.connectionState === "connected") {
            roleSelectionDiv.classList.add("hidden");
            connectionSetupDiv.classList.add("hidden");
            connectedViewDiv.classList.remove("hidden");
            sendModuleDiv.classList.remove("hidden");
            receiveModuleDiv.classList.remove("hidden");
            logToScreen("P2P Connection Established!");
        } else if (["disconnected", "failed", "closed"].includes(peerConnection.connectionState)) {
            logToScreen("P2P Connection Lost or Failed.");
            resetConnection();
        }
    };

    peerConnection.ondatachannel = (event) => {
        logToScreen("Data channel received!");
        dataChannel = event.channel;
        setupDataChannelEvents();
    };
}

function setupDataChannelEvents() {
    if (!dataChannel) return;

    dataChannel.onopen = () => {
        logToScreen("Data Channel Opened!");
        sendBtn.disabled = false;
    };

    dataChannel.onclose = () => {
        logToScreen("Data Channel Closed!");
        sendBtn.disabled = true;
    };

    dataChannel.onerror = (error) => {
        logToScreen(`Data Channel Error: ${JSON.stringify(error)}`);
    };

    dataChannel.onmessage = (event) => {
        if (typeof event.data === "string") {
            try {
                const message = JSON.parse(event.data);
                if (message.type === "file-meta") {
                    receivedFileInfo = { name: message.name, type: message.fileType, size: message.size };
                    receiveBuffer = [];
                    receivedSize = 0;
                    logToScreen(`Receiving file: ${receivedFileInfo.name} (${receivedFileInfo.size} bytes)`);
                    fileNameReceive.textContent = receivedFileInfo.name;
                    fileReceiveProgressBar.style.width = "0%";
                    fileReceiveStatus.textContent = "0%";
                    fileReceiveProgressContainer.classList.remove("hidden");
                } else if (message.type === "file-end") {
                    if (receivedFileInfo) {
                        const receivedBlob = new Blob(receiveBuffer, { type: receivedFileInfo.type });
                        logToScreen(`File ${receivedFileInfo.name} received completely.`);
                        addReceivedFileToUI(receivedFileInfo.name, receivedBlob);
                        receivedFileInfo = null;
                        receiveBuffer = [];
                        fileReceiveProgressContainer.classList.add("hidden");
                    }
                } else if (message.type === "text") {
                    logToScreen(`Receive a Text Message: ${message.payload.substring(0, 25)}...`);
                    addMessageToUI('receive', message.payload);
                } else {
                    logToScreen(`Unknown structured message received: ${event.data}`);
                }
            } catch (e) {
                logToScreen(`Legacy Text Received: ${event.data}`);
            }
        } else if (event.data instanceof ArrayBuffer) {
            if (receivedFileInfo) {
                receiveBuffer.push(event.data);
                receivedSize += event.data.byteLength;
                const progress = Math.round((receivedSize / receivedFileInfo.size) * 100);
                fileReceiveProgressBar.style.width = `${progress}%`;
                fileReceiveStatus.textContent = `${progress}%`;
            } else {
                logToScreen("Received ArrayBuffer chunk but no file metadata active.");
            }
        }
    };
}

export async function startHost() {
    userRole = "host";
    roleDisplay.textContent = "Role: HOST";
    logToScreen("Starting as HOST. Creating offer...");
    connectionLog.innerHTML = "";

    setSignalInputOrder("host");
    localSignalText.classList.remove("hidden");
    localSignalText.value = "";
    copyLocalSignalBtn.classList.remove("hidden");

    await createPeerConnection();
    if (!peerConnection) return;

    dataChannel = peerConnection.createDataChannel("sendDataChannel");
    logToScreen("Data channel created by host.");
    setupDataChannelEvents();

    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        logToScreen("Offer created and set as local description. Waiting for ICE candidates to complete signal...");
    } catch (e) {
        logToScreen(`Error creating offer: ${(e as Error).message}`);
        resetConnection();
    }
}

export async function startClient() {
    userRole = "client";
    roleDisplay.textContent = "Role: CLIENT";
    logToScreen("Starting as CLIENT. Waiting for HOST's signal.");
    connectionLog.innerHTML = "";

    setSignalInputOrder("client");
    localSignalText.value = "";
    localSignalText.classList.add("hidden");
    copyLocalSignalBtn.classList.add("hidden");
}

export async function handleRemoteSignal() {
    if (!remoteSignalText.value) {
        logToScreen("Remote signal cannot be empty.");
        return;
    }

    let parsedSignal;
    try {
        parsedSignal = JSON.parse(remoteSignalText.value);
        if (!parsedSignal.sdp || !parsedSignal.candidates) {
            throw new Error("Signal must contain sdp and candidates array.");
        }
    } catch (e) {
        logToScreen(`Invalid remote signal format: ${(e as Error).message}`);
        return;
    }

    const remoteDescription = new RTCSessionDescription(parsedSignal.sdp as RTCSessionDescriptionInit);

    if (userRole === "host") {
        if (!peerConnection || peerConnection.signalingState !== "have-local-offer") {
            logToScreen("Host: Invalid state or no local offer set. Please restart process.");
            return;
        }
        logToScreen("Host: Received client's answer. Setting remote description...");
        try {
            await peerConnection.setRemoteDescription(remoteDescription);
            logToScreen("Host: Remote description (answer) set. Adding ICE candidates from client...");
            for (const candidate of parsedSignal.candidates) {
                if (candidate.candidate) {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                }
            }
            logToScreen("Host: Client's ICE candidates added.");
        } catch (e) {
            logToScreen(`Host: Error setting remote description or adding ICE candidate: ${(e as Error).message}`);
            resetConnection();
        }
    } else if (userRole === "client") {
        localSignalText.value = "Generating your signal, please wait...";
        localSignalText.classList.remove("hidden");
        remoteSignalGroup.classList.add("hidden");
        confirmRemoteSignalBtn.classList.add("hidden");
        copyLocalSignalBtn.classList.add("hidden");

        logToScreen("Client: Received host's offer. Creating peer connection...");
        await createPeerConnection();
        if (!peerConnection) return;

        logToScreen("Client: Setting remote description (offer)...");
        try {
            await peerConnection.setRemoteDescription(remoteDescription);
            logToScreen("Client: Remote description (offer) set. Adding ICE candidates from host...");
            for (const candidate of parsedSignal.candidates) {
                if (candidate.candidate) {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                }
            }
            logToScreen("Client: Host's ICE candidates added. Creating answer...");
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            logToScreen("Client: Answer created and set as local description. Waiting for ICE candidates to complete signal...");
        } catch (e) {
            logToScreen(`Client: Error processing offer or creating answer: ${(e as Error).message}`);
            localSignalText.value = "Error generating signal. Please try again.";
            copyLocalSignalBtn.classList.add("hidden");
            resetConnection();
        }
    }
    remoteSignalText.value = "";
}

export function resetConnection() {
    logToScreen("Resetting connection...");
    if (dataChannel) {
        dataChannel.close();
        dataChannel = null;
    }
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    userRole = null;
    sendingFile = null;
    if (sendingFileReader) {
        sendingFileReader.abort();
        sendingFileReader = null;
    }
    sendOffset = 0;
    sendCancelled = false;

    receiveBuffer = [];
    receivedFileInfo = null;
    receivedSize = 0;

    roleSelectionDiv.classList.remove("hidden");
    connectionSetupDiv.classList.add("hidden");
    connectedViewDiv.classList.add("hidden");
    sendModuleDiv.classList.add("hidden");
    fileSendProgressContainer.classList.add("hidden");
    fileReceiveProgressContainer.classList.add("hidden");

    localSignalText.value = "";
    localSignalText.classList.remove("hidden");
    copyLocalSignalBtn.classList.remove("hidden");
    remoteSignalText.value = "";
    textInput.value = "";
    fileInput.value = "";

    remoteSignalGroup.classList.remove("hidden");
    confirmRemoteSignalBtn.classList.remove("hidden");

    if (connectionLog.innerHTML.includes("Choose a role to start")) {
    } else {
        logToScreen("Connection reset. Choose a role to start again.");
    }
    sendBtn.disabled = true;
    setSignalInputOrder("host");
}

export function sendFile() {
    if (!sendingFile || !dataChannel || dataChannel.readyState !== "open") return;

    logToScreen(`Starting to send file: ${sendingFile.name} (${sendingFile.size} bytes)`);
    fileNameSend.textContent = sendingFile.name;
    fileSendProgressBar.style.width = "0%";
    fileSendStatus.textContent = "0%";
    fileSendProgressContainer.classList.remove("hidden");
    sendBtn.disabled = true;
    fileInput.disabled = true;

    sendCancelled = false;
    sendOffset = 0;

    const metadata = {
        type: "file-meta",
        name: sendingFile.name,
        size: sendingFile.size,
        fileType: sendingFile.type
    };
    dataChannel.send(JSON.stringify(metadata));

    sendingFileReader = new FileReader();
    sendingFileReader.onload = (e) => {
        if (sendCancelled || !dataChannel || !e.target?.result) {
            if (sendCancelled) logToScreen("File send process aborted (onload).");
            return;
        }
        try {
            dataChannel.send(e.target.result as ArrayBuffer);
            sendOffset += (e.target.result as ArrayBuffer).byteLength;

            const progress = Math.round((sendOffset / sendingFile!.size) * 100);
            fileSendProgressBar.style.width = `${progress}%`;
            fileSendStatus.textContent = `${progress}%`;

            if (sendOffset < sendingFile!.size) {
                if (sendCancelled) {
                    logToScreen("File send process aborted (mid-send).");
                    return;
                }
                if (dataChannel.bufferedAmount > CHUNK_SIZE * 16) {
                    dataChannel.onbufferedamountlow = () => {
                        // @ts-ignore
                        dataChannel.onbufferedamountlow = null;
                        if (sendOffset < sendingFile!.size && !sendCancelled) {
                            readNextChunk();
                        }
                    }
                } else {
                    readNextChunk();
                }
            } else {
                logToScreen(`File ${sendingFile!.name} sent completely.`);
                dataChannel.send(JSON.stringify({ type: "file-end" }));
                fileSendProgressContainer.classList.add("hidden");
                sendBtn.disabled = false;
                fileInput.disabled = false;
                fileInput.value = "";
                sendingFile = null;
            }
        } catch (error) {
            logToScreen(`Error sending file chunk: ${(error as Error).message}`);
            fileSendProgressContainer.classList.add("hidden");
            sendBtn.disabled = false;
            fileInput.disabled = false;
            sendingFile = null;
        }
    };
    sendingFileReader.onerror = (e) => {
        logToScreen(`FileReadError for ${sendingFile?.name}: ${sendingFileReader?.error?.message}`);
        fileSendProgressContainer.classList.add("hidden");
        sendBtn.disabled = false;
        fileInput.disabled = false;
        sendingFile = null;
    };

    function readNextChunk() {
        if (sendCancelled || !dataChannel) {
            logToScreen("File send process aborted before next chunk read.");
            return;
        }
        const slice = sendingFile!.slice(sendOffset, sendOffset + CHUNK_SIZE);
        sendingFileReader!.readAsArrayBuffer(slice);
    }
    readNextChunk();
}

export function handleSendText(text: string) {
    if (!dataChannel || dataChannel.readyState !== "open") {
        logToScreen("Data channel is not open.");
        return;
    }

    if (text) {
        const message = { type: "text", payload: text };
        dataChannel.send(JSON.stringify(message));
        logToScreen(`Send a Text Message: ${text.substring(0, 25)}...`);
        return true;
    } else {
        logToScreen("Cannot send empty text.");
        return false;
    }
}

export function handleSendFile(file: File) {
    if (!dataChannel || dataChannel.readyState !== "open") {
        logToScreen("Data channel is not open.");
        return;
    }

    if (file) {
        sendingFile = file;
        sendFile();
        return true;
    } else {
        logToScreen("No file selected to send.");
        return false;
    }
}

export function cancelFileSend() {
    if (sendingFile && sendingFileReader) {
        sendCancelled = true;
        sendingFileReader.abort();
        logToScreen(`File send for ${sendingFile.name} cancelled.`);
        fileSendProgressContainer.classList.add("hidden");
        sendBtn.disabled = false;
        fileInput.disabled = false;
        sendingFile = null;
    }
} 