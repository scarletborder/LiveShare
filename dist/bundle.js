define("widget", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.messagesList = exports.fileReceiveStatus = exports.fileReceiveProgressBar = exports.fileNameReceive = exports.fileReceiveProgressContainer = exports.receivedFilesList = exports.receiveModuleDiv = exports.cancelSendBtn = exports.fileSendStatus = exports.fileSendProgressBar = exports.fileNameSend = exports.fileSendProgressContainer = exports.sendBtn = exports.fileInput = exports.textInput = exports.sendFileContainer = exports.sendTextContainer = exports.sendTypeRadios = exports.sendModuleDiv = exports.disconnectBtn = exports.connectedViewDiv = exports.clearLogBtn = exports.connectionLog = exports.confirmRemoteSignalBtn = exports.remoteSignalText = exports.copyLocalSignalBtn = exports.localSignalText = exports.remoteSignalGroup = exports.localSignalGroup = exports.signalInputContainer = exports.roleDisplay = exports.connectionSetupDiv = exports.backBtn = exports.clientBtn = exports.hostBtn = exports.roleSelectionDiv = exports.stunServerListElement = exports.addStunBtn = exports.stunServerInput = exports.currentStunServerDisplay = exports.toggleSettingsBtn = exports.settingsContent = exports.settingsModule = void 0;
    exports.logToScreen = logToScreen;
    exports.setSignalInputOrder = setSignalInputOrder;
    exports.addReceivedFileToUI = addReceivedFileToUI;
    exports.addMessageToUI = addMessageToUI;
    // --- DOM Elements ---
    // Settings
    exports.settingsModule = document.getElementById("settingsModule");
    exports.settingsContent = document.getElementById("settingsContent");
    exports.toggleSettingsBtn = document.getElementById("toggleSettingsBtn");
    exports.currentStunServerDisplay = document.getElementById("currentStunServerDisplay");
    exports.stunServerInput = document.getElementById("stunServerInput");
    exports.addStunBtn = document.getElementById("addStunBtn");
    exports.stunServerListElement = document.getElementById("stunServerList");
    // Connection
    exports.roleSelectionDiv = document.getElementById("roleSelection");
    exports.hostBtn = document.getElementById("hostBtn");
    exports.clientBtn = document.getElementById("clientBtn");
    exports.backBtn = document.getElementById("backBtn");
    exports.connectionSetupDiv = document.getElementById("connectionSetup");
    exports.roleDisplay = document.getElementById("roleDisplay");
    exports.signalInputContainer = document.getElementById("signalInputContainer");
    exports.localSignalGroup = document.getElementById("localSignalGroup");
    exports.remoteSignalGroup = document.getElementById("remoteSignalGroup");
    exports.localSignalText = document.getElementById("localSignal");
    exports.copyLocalSignalBtn = document.getElementById("copyLocalSignalBtn");
    exports.remoteSignalText = document.getElementById("remoteSignal");
    exports.confirmRemoteSignalBtn = document.getElementById("confirmRemoteSignalBtn");
    exports.connectionLog = document.getElementById("connectionLog");
    exports.clearLogBtn = document.getElementById("clearLogBtn");
    exports.connectedViewDiv = document.getElementById("connectedView");
    exports.disconnectBtn = document.getElementById("disconnectBtn");
    // Send
    exports.sendModuleDiv = document.getElementById("sendModule");
    exports.sendTypeRadios = document.querySelectorAll('input[name="sendType"]');
    exports.sendTextContainer = document.getElementById("sendTextContainer");
    exports.sendFileContainer = document.getElementById("sendFileContainer");
    exports.textInput = document.getElementById("textInput");
    exports.fileInput = document.getElementById("fileInput");
    exports.sendBtn = document.getElementById("sendBtn");
    exports.fileSendProgressContainer = document.getElementById("fileSendProgressContainer");
    exports.fileNameSend = document.getElementById("fileNameSend");
    exports.fileSendProgressBar = document.getElementById("fileSendProgressBar");
    exports.fileSendStatus = document.getElementById("fileSendStatus");
    exports.cancelSendBtn = document.getElementById("cancelSendBtn");
    // Receive
    exports.receiveModuleDiv = document.getElementById("receiveModule");
    exports.receivedFilesList = document.getElementById("receivedFilesList");
    exports.fileReceiveProgressContainer = document.getElementById("fileReceiveProgressContainer");
    exports.fileNameReceive = document.getElementById("fileNameReceive");
    exports.fileReceiveProgressBar = document.getElementById("fileReceiveProgressBar");
    exports.fileReceiveStatus = document.getElementById("fileReceiveStatus");
    exports.messagesList = document.querySelector(".messages-list");
    // --- UI Utility Functions ---
    function logToScreen(message) {
        console.log(message);
        const logEntry = document.createElement("div");
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        exports.connectionLog.appendChild(logEntry);
        exports.connectionLog.scrollTop = exports.connectionLog.scrollHeight;
    }
    function setSignalInputOrder(order) {
        if (order === "host") {
            exports.signalInputContainer.appendChild(exports.localSignalGroup);
            exports.signalInputContainer.appendChild(exports.remoteSignalGroup);
        }
        else {
            exports.signalInputContainer.appendChild(exports.remoteSignalGroup);
            exports.signalInputContainer.appendChild(exports.localSignalGroup);
        }
    }
    function addReceivedFileToUI(fileName, fileBlob) {
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
        exports.receivedFilesList.appendChild(fileItem);
    }
    function addMessageToUI(type, content) {
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
        copyBtn.textContent = "复制";
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(content)
                .then(() => {
                copyBtn.textContent = "已复制";
                setTimeout(() => {
                    copyBtn.textContent = "复制";
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
        exports.messagesList.appendChild(messageItem);
        exports.messagesList.scrollTop = exports.messagesList.scrollHeight;
    }
});
define("logic", ["require", "exports", "widget"], function (require, exports, widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadStunServers = loadStunServers;
    exports.createPeerConnection = createPeerConnection;
    exports.startHost = startHost;
    exports.startClient = startClient;
    exports.handleRemoteSignal = handleRemoteSignal;
    exports.resetConnection = resetConnection;
    exports.sendFile = sendFile;
    exports.handleSendText = handleSendText;
    exports.handleSendFile = handleSendFile;
    exports.cancelFileSend = cancelFileSend;
    // --- Configuration ---
    const DEFAULT_STUN_SERVER = "stun:stun.l.google.com:19302";
    const STUN_SERVERS_STORAGE_KEY = "webrtcP2PStunServers";
    const CHUNK_SIZE = 16384; // 16KB chunks for file transfer
    // --- Global State ---
    let peerConnection = null;
    let dataChannel = null;
    let userRole = null;
    let stunServers = [];
    let currentStunServer = DEFAULT_STUN_SERVER;
    let sendingFile = null;
    let sendingFileReader = null;
    let sendOffset = 0;
    let sendCancelled = false;
    let receiveBuffer = [];
    let receivedFileInfo = null;
    let receivedSize = 0;
    // --- STUN Server Management ---
    function loadStunServers() {
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
        widget_1.stunServerListElement.innerHTML = "";
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
                (0, widget_1.logToScreen)(`Selected STUN server: ${currentStunServer}`);
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
            widget_1.stunServerListElement.appendChild(li);
        });
    }
    function updateCurrentStunDisplay() {
        widget_1.currentStunServerDisplay.textContent = currentStunServer;
    }
    // --- WebRTC Core Logic ---
    async function createPeerConnection() {
        (0, widget_1.logToScreen)(`Attempting to connect using STUN: ${currentStunServer}`);
        const pcConfig = {
            iceServers: [{ urls: currentStunServer }]
        };
        peerConnection = new RTCPeerConnection(pcConfig);
        const collectedIceCandidates = [];
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                (0, widget_1.logToScreen)(`ICE Candidate gathered: ${event.candidate.candidate.substring(0, 30)}...`);
                collectedIceCandidates.push(event.candidate.toJSON());
            }
            else {
                (0, widget_1.logToScreen)("All ICE candidates gathered. Finalizing signal...");
                const currentDescription = peerConnection.localDescription;
                if (currentDescription) {
                    widget_1.localSignalText.value = JSON.stringify({
                        sdp: currentDescription.toJSON(),
                        candidates: collectedIceCandidates
                    });
                    if (userRole === "client") {
                        widget_1.copyLocalSignalBtn.classList.remove("hidden");
                    }
                }
            }
        };
        peerConnection.oniceconnectionstatechange = () => {
            if (!peerConnection)
                return;
            (0, widget_1.logToScreen)(`ICE Connection State: ${peerConnection.iceConnectionState}`);
            if (peerConnection.iceConnectionState === "failed") {
                (0, widget_1.logToScreen)("ICE connection failed. Restarting ICE...");
                peerConnection.restartIce();
            }
        };
        peerConnection.onconnectionstatechange = () => {
            if (!peerConnection)
                return;
            (0, widget_1.logToScreen)(`Connection State: ${peerConnection.connectionState}`);
            if (peerConnection.connectionState === "connected") {
                widget_1.roleSelectionDiv.classList.add("hidden");
                widget_1.connectionSetupDiv.classList.add("hidden");
                widget_1.connectedViewDiv.classList.remove("hidden");
                widget_1.sendModuleDiv.classList.remove("hidden");
                widget_1.receiveModuleDiv.classList.remove("hidden");
                (0, widget_1.logToScreen)("P2P Connection Established!");
            }
            else if (["disconnected", "failed", "closed"].includes(peerConnection.connectionState)) {
                (0, widget_1.logToScreen)("P2P Connection Lost or Failed.");
                resetConnection();
            }
        };
        peerConnection.ondatachannel = (event) => {
            (0, widget_1.logToScreen)("Data channel received!");
            dataChannel = event.channel;
            setupDataChannelEvents();
        };
    }
    function setupDataChannelEvents() {
        if (!dataChannel)
            return;
        dataChannel.onopen = () => {
            (0, widget_1.logToScreen)("Data Channel Opened!");
            widget_1.sendBtn.disabled = false;
        };
        dataChannel.onclose = () => {
            (0, widget_1.logToScreen)("Data Channel Closed!");
            widget_1.sendBtn.disabled = true;
        };
        dataChannel.onerror = (error) => {
            (0, widget_1.logToScreen)(`Data Channel Error: ${JSON.stringify(error)}`);
        };
        dataChannel.onmessage = (event) => {
            if (typeof event.data === "string") {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === "file-meta") {
                        receivedFileInfo = { name: message.name, type: message.fileType, size: message.size };
                        receiveBuffer = [];
                        receivedSize = 0;
                        (0, widget_1.logToScreen)(`Receiving file: ${receivedFileInfo.name} (${receivedFileInfo.size} bytes)`);
                        widget_1.fileNameReceive.textContent = receivedFileInfo.name;
                        widget_1.fileReceiveProgressBar.style.width = "0%";
                        widget_1.fileReceiveStatus.textContent = "0%";
                        widget_1.fileReceiveProgressContainer.classList.remove("hidden");
                    }
                    else if (message.type === "file-end") {
                        if (receivedFileInfo) {
                            const receivedBlob = new Blob(receiveBuffer, { type: receivedFileInfo.type });
                            (0, widget_1.logToScreen)(`File ${receivedFileInfo.name} received completely.`);
                            (0, widget_1.addReceivedFileToUI)(receivedFileInfo.name, receivedBlob);
                            receivedFileInfo = null;
                            receiveBuffer = [];
                            widget_1.fileReceiveProgressContainer.classList.add("hidden");
                        }
                    }
                    else if (message.type === "text") {
                        (0, widget_1.logToScreen)(`Receive a Text Message: ${message.payload.substring(0, 25)}...`);
                        (0, widget_1.addMessageToUI)('receive', message.payload);
                    }
                    else {
                        (0, widget_1.logToScreen)(`Unknown structured message received: ${event.data}`);
                    }
                }
                catch (e) {
                    (0, widget_1.logToScreen)(`Legacy Text Received: ${event.data}`);
                }
            }
            else if (event.data instanceof ArrayBuffer) {
                if (receivedFileInfo) {
                    receiveBuffer.push(event.data);
                    receivedSize += event.data.byteLength;
                    const progress = Math.round((receivedSize / receivedFileInfo.size) * 100);
                    widget_1.fileReceiveProgressBar.style.width = `${progress}%`;
                    widget_1.fileReceiveStatus.textContent = `${progress}%`;
                }
                else {
                    (0, widget_1.logToScreen)("Received ArrayBuffer chunk but no file metadata active.");
                }
            }
        };
    }
    async function startHost() {
        userRole = "host";
        widget_1.roleDisplay.textContent = "Role: HOST";
        (0, widget_1.logToScreen)("Starting as HOST. Creating offer...");
        widget_1.connectionLog.innerHTML = "";
        (0, widget_1.setSignalInputOrder)("host");
        widget_1.localSignalText.classList.remove("hidden");
        widget_1.localSignalText.value = "";
        widget_1.copyLocalSignalBtn.classList.remove("hidden");
        await createPeerConnection();
        if (!peerConnection)
            return;
        dataChannel = peerConnection.createDataChannel("sendDataChannel");
        (0, widget_1.logToScreen)("Data channel created by host.");
        setupDataChannelEvents();
        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            (0, widget_1.logToScreen)("Offer created and set as local description. Waiting for ICE candidates to complete signal...");
        }
        catch (e) {
            (0, widget_1.logToScreen)(`Error creating offer: ${e.message}`);
            resetConnection();
        }
    }
    async function startClient() {
        userRole = "client";
        widget_1.roleDisplay.textContent = "Role: CLIENT";
        (0, widget_1.logToScreen)("Starting as CLIENT. Waiting for HOST's signal.");
        widget_1.connectionLog.innerHTML = "";
        (0, widget_1.setSignalInputOrder)("client");
        widget_1.localSignalText.value = "";
        widget_1.localSignalText.classList.add("hidden");
        widget_1.copyLocalSignalBtn.classList.add("hidden");
    }
    async function handleRemoteSignal() {
        if (!widget_1.remoteSignalText.value) {
            (0, widget_1.logToScreen)("Remote signal cannot be empty.");
            return;
        }
        let parsedSignal;
        try {
            parsedSignal = JSON.parse(widget_1.remoteSignalText.value);
            if (!parsedSignal.sdp || !parsedSignal.candidates) {
                throw new Error("Signal must contain sdp and candidates array.");
            }
        }
        catch (e) {
            (0, widget_1.logToScreen)(`Invalid remote signal format: ${e.message}`);
            return;
        }
        const remoteDescription = new RTCSessionDescription(parsedSignal.sdp);
        if (userRole === "host") {
            if (!peerConnection || peerConnection.signalingState !== "have-local-offer") {
                (0, widget_1.logToScreen)("Host: Invalid state or no local offer set. Please restart process.");
                return;
            }
            (0, widget_1.logToScreen)("Host: Received client's answer. Setting remote description...");
            try {
                await peerConnection.setRemoteDescription(remoteDescription);
                (0, widget_1.logToScreen)("Host: Remote description (answer) set. Adding ICE candidates from client...");
                for (const candidate of parsedSignal.candidates) {
                    if (candidate.candidate) {
                        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                }
                (0, widget_1.logToScreen)("Host: Client's ICE candidates added.");
            }
            catch (e) {
                (0, widget_1.logToScreen)(`Host: Error setting remote description or adding ICE candidate: ${e.message}`);
                resetConnection();
            }
        }
        else if (userRole === "client") {
            widget_1.localSignalText.value = "Generating your signal, please wait...";
            widget_1.localSignalText.classList.remove("hidden");
            widget_1.remoteSignalGroup.classList.add("hidden");
            widget_1.confirmRemoteSignalBtn.classList.add("hidden");
            widget_1.copyLocalSignalBtn.classList.add("hidden");
            (0, widget_1.logToScreen)("Client: Received host's offer. Creating peer connection...");
            await createPeerConnection();
            if (!peerConnection)
                return;
            (0, widget_1.logToScreen)("Client: Setting remote description (offer)...");
            try {
                await peerConnection.setRemoteDescription(remoteDescription);
                (0, widget_1.logToScreen)("Client: Remote description (offer) set. Adding ICE candidates from host...");
                for (const candidate of parsedSignal.candidates) {
                    if (candidate.candidate) {
                        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                }
                (0, widget_1.logToScreen)("Client: Host's ICE candidates added. Creating answer...");
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                (0, widget_1.logToScreen)("Client: Answer created and set as local description. Waiting for ICE candidates to complete signal...");
            }
            catch (e) {
                (0, widget_1.logToScreen)(`Client: Error processing offer or creating answer: ${e.message}`);
                widget_1.localSignalText.value = "Error generating signal. Please try again.";
                widget_1.copyLocalSignalBtn.classList.add("hidden");
                resetConnection();
            }
        }
        widget_1.remoteSignalText.value = "";
    }
    function resetConnection() {
        (0, widget_1.logToScreen)("Resetting connection...");
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
        widget_1.roleSelectionDiv.classList.remove("hidden");
        widget_1.connectionSetupDiv.classList.add("hidden");
        widget_1.connectedViewDiv.classList.add("hidden");
        widget_1.sendModuleDiv.classList.add("hidden");
        widget_1.fileSendProgressContainer.classList.add("hidden");
        widget_1.fileReceiveProgressContainer.classList.add("hidden");
        widget_1.localSignalText.value = "";
        widget_1.localSignalText.classList.remove("hidden");
        widget_1.copyLocalSignalBtn.classList.remove("hidden");
        widget_1.remoteSignalText.value = "";
        widget_1.textInput.value = "";
        widget_1.fileInput.value = "";
        widget_1.remoteSignalGroup.classList.remove("hidden");
        widget_1.confirmRemoteSignalBtn.classList.remove("hidden");
        if (widget_1.connectionLog.innerHTML.includes("Choose a role to start")) {
        }
        else {
            (0, widget_1.logToScreen)("Connection reset. Choose a role to start again.");
        }
        widget_1.sendBtn.disabled = true;
        (0, widget_1.setSignalInputOrder)("host");
    }
    function sendFile() {
        if (!sendingFile || !dataChannel || dataChannel.readyState !== "open")
            return;
        (0, widget_1.logToScreen)(`Starting to send file: ${sendingFile.name} (${sendingFile.size} bytes)`);
        widget_1.fileNameSend.textContent = sendingFile.name;
        widget_1.fileSendProgressBar.style.width = "0%";
        widget_1.fileSendStatus.textContent = "0%";
        widget_1.fileSendProgressContainer.classList.remove("hidden");
        widget_1.sendBtn.disabled = true;
        widget_1.fileInput.disabled = true;
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
                if (sendCancelled)
                    (0, widget_1.logToScreen)("File send process aborted (onload).");
                return;
            }
            try {
                dataChannel.send(e.target.result);
                sendOffset += e.target.result.byteLength;
                const progress = Math.round((sendOffset / sendingFile.size) * 100);
                widget_1.fileSendProgressBar.style.width = `${progress}%`;
                widget_1.fileSendStatus.textContent = `${progress}%`;
                if (sendOffset < sendingFile.size) {
                    if (sendCancelled) {
                        (0, widget_1.logToScreen)("File send process aborted (mid-send).");
                        return;
                    }
                    if (dataChannel.bufferedAmount > CHUNK_SIZE * 16) {
                        dataChannel.onbufferedamountlow = () => {
                            // @ts-ignore
                            dataChannel.onbufferedamountlow = null;
                            if (sendOffset < sendingFile.size && !sendCancelled) {
                                readNextChunk();
                            }
                        };
                    }
                    else {
                        readNextChunk();
                    }
                }
                else {
                    (0, widget_1.logToScreen)(`File ${sendingFile.name} sent completely.`);
                    dataChannel.send(JSON.stringify({ type: "file-end" }));
                    widget_1.fileSendProgressContainer.classList.add("hidden");
                    widget_1.sendBtn.disabled = false;
                    widget_1.fileInput.disabled = false;
                    widget_1.fileInput.value = "";
                    sendingFile = null;
                }
            }
            catch (error) {
                (0, widget_1.logToScreen)(`Error sending file chunk: ${error.message}`);
                widget_1.fileSendProgressContainer.classList.add("hidden");
                widget_1.sendBtn.disabled = false;
                widget_1.fileInput.disabled = false;
                sendingFile = null;
            }
        };
        sendingFileReader.onerror = (e) => {
            (0, widget_1.logToScreen)(`FileReadError for ${sendingFile?.name}: ${sendingFileReader?.error?.message}`);
            widget_1.fileSendProgressContainer.classList.add("hidden");
            widget_1.sendBtn.disabled = false;
            widget_1.fileInput.disabled = false;
            sendingFile = null;
        };
        function readNextChunk() {
            if (sendCancelled || !dataChannel) {
                (0, widget_1.logToScreen)("File send process aborted before next chunk read.");
                return;
            }
            const slice = sendingFile.slice(sendOffset, sendOffset + CHUNK_SIZE);
            sendingFileReader.readAsArrayBuffer(slice);
        }
        readNextChunk();
    }
    function handleSendText(text) {
        if (!dataChannel || dataChannel.readyState !== "open") {
            (0, widget_1.logToScreen)("Data channel is not open.");
            return;
        }
        if (text) {
            const message = { type: "text", payload: text };
            dataChannel.send(JSON.stringify(message));
            (0, widget_1.logToScreen)(`Send a Text Message: ${text.substring(0, 25)}...`);
            return true;
        }
        else {
            (0, widget_1.logToScreen)("Cannot send empty text.");
            return false;
        }
    }
    function handleSendFile(file) {
        if (!dataChannel || dataChannel.readyState !== "open") {
            (0, widget_1.logToScreen)("Data channel is not open.");
            return;
        }
        if (file) {
            sendingFile = file;
            sendFile();
            return true;
        }
        else {
            (0, widget_1.logToScreen)("No file selected to send.");
            return false;
        }
    }
    function cancelFileSend() {
        if (sendingFile && sendingFileReader) {
            sendCancelled = true;
            sendingFileReader.abort();
            (0, widget_1.logToScreen)(`File send for ${sendingFile.name} cancelled.`);
            widget_1.fileSendProgressContainer.classList.add("hidden");
            widget_1.sendBtn.disabled = false;
            widget_1.fileInput.disabled = false;
            sendingFile = null;
        }
    }
});
define("app", ["require", "exports", "widget", "logic"], function (require, exports, widget_2, logic_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.main = main;
    // --- Configuration ---
    const DEFAULT_STUN_SERVER = "stun:stun.l.google.com:19302";
    const STUN_SERVERS_STORAGE_KEY = "webrtcP2PStunServers";
    const CHUNK_SIZE = 16384; // 16KB chunks for file transfer
    // --- Global State ---
    let peerConnection = null;
    let dataChannel = null;
    let userRole = null;
    let stunServers = [];
    let currentStunServer = DEFAULT_STUN_SERVER;
    let sendingFile = null;
    let sendingFileReader = null;
    let sendOffset = 0;
    let sendCancelled = false;
    let receiveBuffer = [];
    let receivedFileInfo = null;
    let receivedSize = 0;
    // --- DOM Elements ---
    // Settings
    const settingsModule = document.getElementById("settingsModule");
    const currentStunServerDisplay = document.getElementById("currentStunServerDisplay");
    const stunServerInput = document.getElementById("stunServerInput");
    const addStunBtn = document.getElementById("addStunBtn");
    const stunServerListElement = document.getElementById("stunServerList");
    // Connection
    const roleSelectionDiv = document.getElementById("roleSelection");
    const roleDisplay = document.getElementById("roleDisplay");
    // MODIFIED: Get signal group containers for reordering
    const signalInputContainer = document.getElementById("signalInputContainer");
    const localSignalGroup = document.getElementById("localSignalGroup");
    const remoteSignalGroup = document.getElementById("remoteSignalGroup");
    const localSignalText = document.getElementById("localSignal");
    const remoteSignalText = document.getElementById("remoteSignal");
    const connectedViewDiv = document.getElementById("connectedView");
    const connectionSetupDiv = document.getElementById("connectionSetup");
    // Send
    const sendModuleDiv = document.getElementById("sendModule");
    const receivedFilesList = document.getElementById("receivedFilesList");
    const fileReceiveProgressContainer = document.getElementById("fileReceiveProgressContainer");
    const fileNameReceive = document.getElementById("fileNameReceive");
    const fileReceiveProgressBar = document.getElementById("fileReceiveProgressBar");
    const fileReceiveStatus = document.getElementById("fileReceiveStatus");
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
                (0, widget_2.logToScreen)(`Selected STUN server: ${currentStunServer}`);
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
            }
            catch (error) {
                (0, widget_2.logToScreen)(`Error adding STUN server: ${error.message}. Please use format like stun:example.com:port or turn:example.com:port?transport=udp`);
            }
        }
        else if (stunServers.includes(newServer)) {
            (0, widget_2.logToScreen)("STUN server already in the list.");
        }
        else {
            (0, widget_2.logToScreen)("STUN server URL cannot be empty.");
        }
    };
    // --- Settings Module Toggle Logic ---
    function toggleSettings() {
        const isCollapsed = widget_2.settingsContent.classList.contains("collapsed");
        if (isCollapsed) {
            widget_2.settingsContent.classList.remove("collapsed");
            widget_2.toggleSettingsBtn.textContent = "▼";
        }
        else {
            widget_2.settingsContent.classList.add("collapsed");
            widget_2.toggleSettingsBtn.textContent = "▶";
        }
    }
    // --- UI Event Handlers ---
    widget_2.hostBtn.onclick = () => {
        roleSelectionDiv.classList.add("hidden");
        connectionSetupDiv.classList.remove("hidden");
        widget_2.confirmRemoteSignalBtn.textContent = "Confirm Client's Signal & Connect";
        (0, logic_1.startHost)();
    };
    widget_2.clientBtn.onclick = () => {
        roleSelectionDiv.classList.add("hidden");
        connectionSetupDiv.classList.remove("hidden");
        widget_2.confirmRemoteSignalBtn.textContent = "Confirm Host's Signal & Generate Response";
        (0, logic_1.startClient)();
    };
    widget_2.backBtn.onclick = () => {
        (0, logic_1.resetConnection)();
        (0, widget_2.logToScreen)("已返回角色选择界面");
    };
    widget_2.confirmRemoteSignalBtn.onclick = logic_1.handleRemoteSignal;
    widget_2.copyLocalSignalBtn.onclick = () => {
        if (localSignalText.value) {
            localSignalText.select();
            navigator.clipboard.writeText(localSignalText.value)
                .then(() => (0, widget_2.logToScreen)("Local signal copied to clipboard."))
                .catch(err => (0, widget_2.logToScreen)("Failed to copy local signal: " + err));
        }
        else {
            (0, widget_2.logToScreen)("No local signal generated yet to copy.");
        }
    };
    widget_2.disconnectBtn.onclick = logic_1.resetConnection;
    // --- Send Module Logic ---
    widget_2.sendTypeRadios.forEach(radio => {
        radio.onchange = () => {
            if (radio.value === "text") {
                widget_2.sendTextContainer.classList.remove("hidden");
                widget_2.sendFileContainer.classList.add("hidden");
            }
            else {
                widget_2.sendTextContainer.classList.add("hidden");
                widget_2.sendFileContainer.classList.remove("hidden");
            }
        };
    });
    widget_2.sendBtn.onclick = () => {
        const sendType = document.querySelector('input[name="sendType"]:checked').value;
        if (sendType === "text") {
            const text = widget_2.textInput.value;
            if (!text.trim()) {
                (0, widget_2.logToScreen)("Cannot send: Text is empty.");
                return;
            }
            try {
                const message = {
                    type: "text",
                    payload: text
                };
                (0, logic_1.handleSendText)(text);
                (0, widget_2.addMessageToUI)('send', text);
                widget_2.textInput.value = "";
            }
            catch (error) {
                (0, widget_2.logToScreen)(`Error sending text: ${error.message}`);
            }
        }
        else if (sendType === "file") {
            if (widget_2.fileInput.files && widget_2.fileInput.files.length > 0) {
                (0, logic_1.handleSendFile)(widget_2.fileInput.files[0]);
            }
        }
    };
    widget_2.cancelSendBtn.onclick = logic_1.cancelFileSend;
    // --- Receive Module Logic ---
    function addReceivedFileToUI(fileName, fileBlob) {
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
    function main() {
        (0, logic_1.loadStunServers)();
        (0, logic_1.resetConnection)();
        // Initialize settings module as collapsed
        widget_2.settingsContent.classList.add("collapsed");
        widget_2.toggleSettingsBtn.textContent = "▶";
        widget_2.toggleSettingsBtn.onclick = toggleSettings;
        document.querySelector('input[name="sendType"][value="text"]').checked = true;
        widget_2.sendTextContainer.classList.remove("hidden");
        widget_2.sendFileContainer.classList.add("hidden");
        widget_2.connectionLog.innerHTML = "";
        (0, widget_2.logToScreen)("Application initialized. Please choose a role (HOST or CLIENT) to begin.");
    }
    // --- UI Event Handlers ---
    let clearLogTimeout = null;
    widget_2.clearLogBtn.onclick = () => {
        if (widget_2.clearLogBtn.classList.contains('confirm')) {
            widget_2.connectionLog.innerHTML = '';
            (0, widget_2.logToScreen)('Log has been cleared');
            widget_2.clearLogBtn.classList.remove('confirm');
            widget_2.clearLogBtn.textContent = 'Clear Log';
            if (clearLogTimeout) {
                window.clearTimeout(clearLogTimeout);
                clearLogTimeout = null;
            }
        }
        else {
            widget_2.clearLogBtn.classList.add('confirm');
            widget_2.clearLogBtn.textContent = 'Confirm Clear';
            if (clearLogTimeout) {
                window.clearTimeout(clearLogTimeout);
            }
            clearLogTimeout = window.setTimeout(() => {
                widget_2.clearLogBtn.classList.remove('confirm');
                widget_2.clearLogBtn.textContent = 'Clear Log';
                clearLogTimeout = null;
            }, 3000);
        }
    };
    // 点击其他地方时重置清空按钮状态
    document.addEventListener('click', (event) => {
        if (!widget_2.clearLogBtn.contains(event.target) && widget_2.clearLogBtn.classList.contains('confirm')) {
            widget_2.clearLogBtn.classList.remove('confirm');
            widget_2.clearLogBtn.textContent = 'Clear Log';
            if (clearLogTimeout) {
                window.clearTimeout(clearLogTimeout);
                clearLogTimeout = null;
            }
        }
    });
});
